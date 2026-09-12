import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import ProductTile from "../components/ProductTile.jsx";

const CATEGORIES = ["all", "tops", "jeans", "dresses", "jewellery"];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "all";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let query = supabase.from("products").select("*").eq("is_active", true);
    if (category !== "all") query = query.eq("category", category);
    query.order("created_at", { ascending: false }).then(({ data }) => {
      setProducts(data ?? []);
      setLoading(false);
    });
  }, [category]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <h1 className="font-serif-display text-2xl mb-6">Shop</h1>
      <div className="flex gap-2 mb-8 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setSearchParams(c === "all" ? {} : { category: c })}
            className={`text-xs px-3.5 py-1.5 rounded-full border ${
              category === c ? "bg-ink text-white border-ink" : "border-sand text-muted"
            }`}
          >
            {c[0].toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-muted text-sm">No products here yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductTile key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
