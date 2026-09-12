# Velora — full store (standalone, no Lovable needed)

Yeh ek complete Vite + React + Tailwind project hai — koi Lovable ki zaroorat nahi.
Pages: Home, Shop, Product Detail, Cart, Checkout (COD + Razorpay), My Orders,
Sign-in/Register, aur Admin Dashboard (product upload + orders).

## 1. Install & run (local)

```bash
npm install
npm run dev
```

Terminal me link milega, usually `http://localhost:5173` — browser me kholo.

Abhi ke liye yeh **Supabase se connect nahi hai**, isliye pages khulenge lekin
products/login/orders kaam nahi karenge jab tak neeche wale steps na karo.

## 2. Supabase connect karo (backend ke liye)

1. [supabase.com](https://supabase.com) par free account banao, naya project banao.
2. Project Settings → API me jaake **Project URL** aur **anon public key** copy karo.
3. Is folder me `.env.example` ko `.env` naam se copy karo, aur wahan paste karo:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Supabase Dashboard → **SQL Editor** → New Query → `schema.sql` ka poora content
   paste karke **Run** karo. Isse tables aur security rules ban jayenge.
5. `npm run dev` dobara start karo (ya already chal raha hai to bas refresh karo).

## 3. Khud ko admin banao

1. Site par ek baar khud sign up karo (`/auth` page se).
2. Supabase Dashboard → Table Editor → `profiles` table → apni row dhoondo →
   `role` column ko `customer` se `admin` kar do.
3. Ab `/admin` khol sakte ho — wahan se product upload aur orders manage hoga.

## 4. Ek product upload karke test karo

`/admin` → "Upload Product" tab → koi bhi test product daal do (name, price zaroori
hai). Save hote hi woh Home aur Shop page par turant dikhne lagega.

## 5. Razorpay (jab key mil jaye)

Abhi COD hi kaam karta hai. Jab Razorpay account/key mile (HDFC se linked):

1. `.env` me add karo: `VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxx`
2. Supabase → Edge Functions me ek function banao `create-razorpay-order` jo
   Razorpay **secret key** (Supabase secrets me store karo, code me kabhi nahi)
   use karke order create kare.
3. Bas — checkout page apne aap "Pay Online" option enable kar dega.

## 6. Live link chahiye? (deploy)

1. Is poore folder ko GitHub par ek repo me push karo.
2. [vercel.com](https://vercel.com) ya [netlify.com](https://netlify.com) par free
   account banao, GitHub se connect karo, repo select karo.
3. Environment variables (wahi `.env` wale) waha bhi add karo deploy settings me.
4. 2 minute me live URL mil jayega.

## Folder structure

```
src/
  main.jsx              → app entry point
  App.jsx                → routes
  index.css              → Tailwind
  lib/supabaseClient.js  → Supabase connection
  context/CartContext.jsx→ cart state (localStorage)
  components/            → Header, Footer, ProductTile
  pages/                 → Home, Shop, ProductDetail, Cart, Checkout, MyOrders, Auth
  pages/admin/            → AdminDashboard, ProductUploadTab, OrdersTab, RequireAdmin
schema.sql               → Supabase tables + security rules
```

Note: maine yahan `npm install` khud run karke test nahi kiya (mere environment me
internet access nahi hai), lekin poora code haath se likha aur check kiya gaya hai.
Agar install/build ke time koi error aaye to poora error message bhej dena, turant
fix kar dunga.
