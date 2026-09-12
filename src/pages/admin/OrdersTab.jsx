import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  async function loadOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(product_name, quantity, size)")
      .order("created_at", { ascending: false });
    if (!error && data) setOrders(data);
    setLoading(false);
  }

  useEffect(() => { loadOrders(); }, []);

  async function updateStatus(orderId, status) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      alert("Could not update status: " + error.message);
      loadOrders();
    }
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <p className="text-muted text-sm">Loading orders…</p>;

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {["all", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border ${filter === s ? "bg-ink text-white border-ink" : "border-sand text-muted"}`}
          >
            {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted text-sm">No orders in this category.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="bg-white/85 border border-sand rounded-lg p-4">
              <div className="flex justify-between flex-wrap gap-2">
                <div>
                  <p className="font-medium text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-muted">{new Date(order.created_at).toLocaleString("en-IN")}</p>
                </div>
                <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="border border-sand rounded-md text-sm px-2 py-1">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-3 text-sm">
                <div>
                  <p className="text-muted">Customer</p>
                  <p className="text-ink">{order.shipping_name} · {order.shipping_phone}</p>
                  <p className="text-muted">{order.shipping_address}, {order.shipping_city} - {order.shipping_pincode}</p>
                </div>
                <div>
                  <p className="text-muted">Payment</p>
                  <p className="text-ink">
                    {order.payment_method === "cod" ? "Cash on Delivery" : "Online"} ·{" "}
                    <span className={order.payment_status === "paid" ? "text-green-700" : "text-amber-700"}>{order.payment_status}</span>
                  </p>
                  <p className="text-ink font-medium mt-1">₹{order.total.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-sand/60 text-sm text-muted">
                {order.order_items.map((item, i) => (
                  <span key={i}>{item.product_name}{item.size ? ` (${item.size})` : ""} × {item.quantity}{i < order.order_items.length - 1 ? " · " : ""}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}