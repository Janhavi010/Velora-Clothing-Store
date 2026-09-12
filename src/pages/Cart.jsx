import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 79;

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  const shipping = items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-20 text-center">
        <h1 className="text-xl font-medium mb-2">Your cart is empty</h1>
        <p className="text-muted mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="bg-ink text-white text-sm px-6 py-2.5 rounded-full">Shop the collection</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="font-serif-display text-2xl mb-6">Your Cart</h1>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 divide-y divide-sand">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 py-5">
              <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-md bg-sand" />
              <div className="flex-1">
                <p className="font-medium text-ink">{item.name}</p>
                <p className="text-sm text-muted mt-0.5">{[item.size, item.color].filter(Boolean).join(" · ")}</p>
                <p className="text-ink mt-1">₹{item.price.toLocaleString("en-IN")}</p>

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-sand rounded-md">
                    <button className="px-2.5 py-1" onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}>
                      <Minus size={12} />
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button className="px-2.5 py-1" onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}>
                      <Plus size={12} />
                    </button>
                  </div>
                  <button className="text-muted" onClick={() => removeItem(item.productId, item.size, item.color)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-ink font-medium">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/85 border border-sand rounded-lg p-5 h-fit">
          <h2 className="font-medium mb-4 text-sm">Order Summary</h2>
          <div className="flex justify-between text-sm text-muted mb-2">
            <span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-sm text-muted mb-2">
            <span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
          </div>
          {shipping > 0 && (
            <p className="text-xs text-muted mb-2">
              Add ₹{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString("en-IN")} more for free shipping
            </p>
          )}
          <div className="flex justify-between font-medium border-t border-sand mt-3 pt-3 text-sm">
            <span>Total</span><span>₹{total.toLocaleString("en-IN")}</span>
          </div>
          <button onClick={() => navigate("/checkout")} className="w-full mt-5 bg-ink text-white text-sm py-2.5 rounded-full">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}