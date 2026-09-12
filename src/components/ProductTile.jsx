import { Link } from "react-router-dom";
import { Shirt, Gem } from "lucide-react";

const CATEGORY_ICON = { tops: Shirt, jeans: Shirt, dresses: Shirt, jewellery: Gem };
const CATEGORY_HUE = {
  tops: "from-rose to-[#E8B4BC]",
  jeans: "from-plum to-[#6B4558]",
  dresses: "from-gold to-[#D8BC8C]",
  jewellery: "from-ink to-[#54473C]",
};

export default function ProductTile({ product }) {
  const Icon = CATEGORY_ICON[product.category] ?? Shirt;
  const hue = CATEGORY_HUE[product.category] ?? CATEGORY_HUE.tops;
  const image = product.image_urls?.[0];
  const soldOut = product.stock <= 0;

  return (
    <Link to={`/product/${product.id}`} className="text-left group block">
      <div className={`relative aspect-[3/4] rounded-lg bg-gradient-to-br ${hue} flex items-center justify-center overflow-hidden`}>
        {image ? (
          <img src={image} alt={product.name} className={`w-full h-full object-cover ${soldOut ? "opacity-50" : ""}`} />
        ) : (
          <Icon size={40} className="text-white/80 group-hover:scale-110 transition-transform" strokeWidth={1.2} />
        )}
        {soldOut && (
          <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-ink text-white font-medium">
            Sold out
          </span>
        )}
      </div>
      <p className="mt-3 text-sm font-medium text-ink">{product.name}</p>
      <p className="text-sm text-muted">₹{Number(product.price).toLocaleString("en-IN")}</p>
    </Link>
  );
}