-- ============================================================
-- AANYA STORE — SUPABASE SCHEMA
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- 1. PROFILES (extends Supabase auth.users with role)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

-- auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. PRODUCTS
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text not null check (category in ('tops','jeans','dresses','jewellery')),
  sizes text[] default '{}',        -- e.g. {'S','M','L','XL'}
  colors text[] default '{}',
  image_urls text[] default '{}',
  stock integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. ORDERS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  payment_method text not null check (payment_method in ('cod','online')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed')),
  razorpay_order_id text,
  razorpay_payment_id text,
  subtotal numeric(10,2) not null,
  shipping_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  shipping_name text not null,
  shipping_phone text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_state text not null,
  shipping_pincode text not null,
  created_at timestamptz not null default now()
);

-- 4. ORDER ITEMS
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,   -- snapshot at time of order
  price numeric(10,2) not null, -- snapshot at time of order
  size text,
  color text,
  quantity integer not null default 1
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- PROFILES: user can read/update own profile; admin can read all
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_admin_select_all" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- PRODUCTS: anyone can view active products; only admins can write
create policy "products_public_read" on public.products
  for select using (is_active = true or
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "products_admin_write" on public.products
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "products_admin_update" on public.products
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "products_admin_delete" on public.products
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ORDERS: user sees own orders; admin sees all; user can insert own order
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id or
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id);
create policy "orders_admin_update" on public.orders
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ORDER ITEMS: visible if parent order is visible
create policy "order_items_select" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
      and (o.user_id = auth.uid() or
           exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    )
  );
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid())
  );

-- ============================================================
-- STORAGE BUCKET for product images
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product_images_admin_write" on storage.objects
  for insert with check (
    bucket_id = 'product-images' and
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- To make yourself an admin after signing up once, run:
-- update public.profiles set role = 'admin' where id = 'YOUR-USER-UUID';
-- (find your UUID in Supabase Auth > Users)
-- ============================================================
