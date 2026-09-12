import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

const STATUS_LABEL = { pending: "Order placed", confirmed: "Confirmed", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };
const STATUS_COLOR = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(true);
  const [searchParams] = useSearchParams();
  const justPlaced = searchParams.get("placed");

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setSignedIn(false);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      if (!error && data) setOrders(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="max-w-3xl mx-auto px-5 py-16 text-center text-muted">Loading your orders…</div>;

  if (!signedIn) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-20 text-center">
        <p className="text-muted mb-4">Sign in to view your orders.</p>
        <Link to="/auth" className="underline text-ink">Sign in</Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-20 text-center">
        <p className="text-muted mb-4">You haven't placed any orders yet.</p>
        <Link to="/shop" className="underline text-ink">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="font-serif-display text-2xl mb-2">My Orders</h1>
      {justPlaced && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-6">
          Order placed successfully! We'll notify you as it's on its way.
        </p>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white/85 border border-sand rounded-lg p-5">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <p className="text-sm text-muted">
                  Order #{order.id.slice(0, 8).toUpperCase()} ·{" "}
                  {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="text-xs text-muted mt-0.5">{order.payment_method === "cod" ? "Cash on Delivery" : "Paid Online"}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
                {STATUS_LABEL[order.status]}
              </span>
            </div>

            <div className="mt-4 divide-y divide-sand/60">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-sm">
                  <span className="text-muted">{item.product_name}{item.size ? ` · ${item.size}` : ""} × {item.quantity}</span>
                  <span className="text-ink">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-3 pt-3 border-t border-sand font-medium text-sm">
              <span>Total</span><span>₹{order.total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}