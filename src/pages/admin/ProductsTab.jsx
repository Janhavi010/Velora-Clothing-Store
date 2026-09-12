import { useEffect, useState } from "react";
import { Trash2, Shirt, Gem } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";

const CATEGORY_ICON = { tops: Shirt, jeans: Shirt, dresses: Shirt, jewellery: Gem };

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  async function loadProducts() {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (!error && data) setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function toggleSoldOut(product) {
    setBusyId(product.id);
    const newStock = product.stock > 0 ? 0 : 10;
    const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", product.id);
    if (error) {
      alert("Could not update: " + error.message);
    } else {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p)));
    }
    setBusyId(null);
  }

  async function deleteProduct(product) {
    if (!confirm(`Delete "${product.name}" permanently? This cannot be undone.`)) return;
    setBusyId(product.id);
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) {
      alert("Could not delete: " + error.message);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    }
    setBusyId(null);
  }

  if (loading) return <p className="text-muted text-sm">Loading products…</p>;

  if (products.length === 0) {
    return <p className="text-muted text-sm">No products yet — add one from the "Upload Product" tab.</p>;
  }

  return (
    <div className="space-y-3">
      {products.map((product) => {
        const Icon = CATEGORY_ICON[product.category] ?? Shirt;
        const soldOut = product.stock <= 0;
        const image = product.image_urls?.[0];
        const busy = busyId === product.id;

        return (
          <div key={product.id} className="flex items-center gap-4 bg-white/85 border border-sand rounded-lg p-3">
            <div className="w-14 h-16 rounded-md bg-sand overflow-hidden flex items-center justify-center shrink-0">
              {image ? (
                <img src={image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <Icon size={22} className="text-muted" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{product.name}</p>
              <p className="text-xs text-muted">
                ₹{Number(product.price).toLocaleString("en-IN")} · {product.category} · {product.image_urls?.length ?? 0} photo(s)
              </p>
              {soldOut && (
                <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                  Sold out
                </span>
              )}
            </div>

            <button
              onClick={() => toggleSoldOut(product)}
              disabled={busy}
              className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap disabled:opacity-50 ${
                soldOut ? "border-green-600 text-green-700" : "border-amber-600 text-amber-700"
              }`}
            >
              {soldOut ? "Mark in stock" : "Mark sold out"}
            </button>

            <button
              onClick={() => deleteProduct(product)}
              disabled={busy}
              className="text-muted hover:text-red-600 disabled:opacity-50"
              title="Delete product"
            >
              <Trash2 size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
}