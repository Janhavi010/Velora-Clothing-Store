import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Minus, Plus, ArrowLeft, Shirt, Gem } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { useCart } from "../context/CartContext.jsx";

const CATEGORY_ICON = { tops: Shirt, jeans: Shirt, dresses: Shirt, jewellery: Gem };
const CATEGORY_HUE = {
  tops: "from-rose to-[#E8B4BC]",
  jeans: "from-plum to-[#6B4558]",
  dresses: "from-gold to-[#D8BC8C]",
  jewellery: "from-ink to-[#54473C]",
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState();
  const [color, setColor] = useState();
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError("Product not found.");
        } else {
          setProduct(data);
          setSize(data.sizes?.[0]);
          setColor(data.colors?.[0]);
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="max-w-5xl mx-auto px-5 py-16 text-center text-muted">Loading…</div>;

  if (error || !product) {
    return (
      <div className="max-w-5xl mx-auto px-5 py-16 text-center">
        <p className="text-muted mb-4">{error ?? "Something went wrong."}</p>
        <Link to="/shop" className="underline text-ink">Back to shop</Link>
      </div>
    );
  }

  const images = product.image_urls?.length ? product.image_urls : null;
  const Icon = CATEGORY_ICON[product.category] ?? Shirt;
  const hue = CATEGORY_HUE[product.category] ?? CATEGORY_HUE.tops;
  const outOfStock = product.stock <= 0;

  function handleAddToCart(goToCart) {
    if (product.sizes?.length && !size) {
      alert("Please select a size.");
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images?.[0] ?? "",
      size,
      color,
      quantity,
    });
    if (goToCart) navigate("/cart");
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 grid md:grid-cols-2 gap-10">
      <div>
        <button onClick={() => navigate(-1)} className="text-sm text-muted flex items-center gap-1 mb-4 md:hidden">
          <ArrowLeft size={14} /> Back
        </button>
        <div className={`aspect-[3/4] w-full overflow-hidden rounded-lg bg-gradient-to-br ${hue} flex items-center justify-center`}>
          {images ? (
            <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Icon size={64} className="text-white/80" strokeWidth={1} />
          )}
        </div>
        {images && images.length > 1 && (
          <div className="flex gap-2 mt-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-16 h-20 rounded-md overflow-hidden border ${i === activeImage ? "border-ink" : "border-sand"}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="font-serif-display text-2xl text-ink">{product.name}</h1>
        <p className="text-lg text-muted mt-2">₹{Number(product.price).toLocaleString("en-IN")}</p>

        {product.description && <p className="text-muted mt-4 leading-relaxed text-sm">{product.description}</p>}

        {product.sizes?.length > 0 && (
          <div className="mt-6">
            <p className="text-sm mb-2">Size</p>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-3 py-1.5 rounded-md border text-sm ${size === s ? "border-ink bg-ink text-white" : "border-sand text-ink"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.colors?.length > 0 && (
          <div className="mt-4">
            <p className="text-sm mb-2">Colour</p>
            <div className="flex gap-2 flex-wrap">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`px-3 py-1.5 rounded-md border text-sm ${color === c ? "border-ink bg-ink text-white" : "border-sand text-ink"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <p className="text-sm">Quantity</p>
          <div className="flex items-center border border-sand rounded-md">
            <button className="p-1.5" onClick={() => setQuantity((q) => Math.max(1, q - 1))}><Minus size={14} /></button>
            <span className="px-3 text-sm">{quantity}</span>
            <button className="p-1.5" onClick={() => setQuantity((q) => q + 1)}><Plus size={14} /></button>
          </div>
        </div>

        {outOfStock ? (
          <p className="mt-6 text-sm text-red-600">Currently out of stock.</p>
        ) : (
          <div className="mt-6 flex gap-3">
            <button onClick={() => handleAddToCart(false)} className="flex-1 border border-ink text-ink text-sm py-2.5 rounded-full hover:bg-ink/5">
              Add to Cart
            </button>
            <button onClick={() => handleAddToCart(true)} className="flex-1 bg-ink text-white text-sm py-2.5 rounded-full hover:bg-[#453C32]">
              Buy Now
            </button>
          </div>
        )}

        <p className="text-xs text-muted mt-6">
          Cash on delivery & secure online payment · Free shipping above ₹999 · Easy 7-day returns
        </p>
      </div>
    </div>
  );
}