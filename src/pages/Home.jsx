import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import ProductTile from "../components/ProductTile.jsx";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setProducts(data ?? []);
        setLoading(false);
      });
  }, []);

  const categories = [
    { key: "tops", label: "Tops" },
    { key: "jeans", label: "Jeans" },
    { key: "dresses", label: "Dresses" },
    { key: "jewellery", label: "Jewellery" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-5 py-14">
      <div className="text-center max-w-xl mx-auto mb-14">
        <p className="text-xs tracking-wide text-gold mb-4">New season</p>
        <h1 className="font-serif-display text-[2.75rem] leading-[1.15] mb-5 text-ink">
          Softly bold,<br />effortlessly you
        </h1>
        <p className="text-muted text-[15px] leading-relaxed max-w-sm mx-auto">
          Hand-picked tops, denim, dresses and fine jewellery for everyday moments and the ones worth dressing up for.
        </p>
        <Link
          to="/shop"
          className="inline-block mt-7 bg-ink text-white text-sm tracking-wide px-7 py-3 rounded-full hover:bg-berry transition-colors duration-300"
        >
          Shop the collection
        </Link>
        <p className="text-xs text-muted mt-5">
          Cash on delivery & secure online payment · Free shipping above ₹999 · Easy 7-day returns
        </p>
      </div>

      <h2 className="text-sm font-medium text-muted mb-4">Shop by category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
        {categories.map((c) => (
          <Link
            key={c.key}
            to={`/shop?category=${c.key}`}
            className="bg-white/70 border border-sand rounded-lg py-6 text-center text-sm font-medium hover:border-ink hover:bg-white transition-colors"
          >
            {c.label}
          </Link>
        ))}
      </div>

      <h2 className="text-sm font-medium text-muted mb-4">The featured edit</h2>
      {loading ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-muted text-sm">New pieces are being added to the collection. Please check back shortly.</p>
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