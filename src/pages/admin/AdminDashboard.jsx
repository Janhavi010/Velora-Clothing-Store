import { useState } from "react";
import { Upload, Package } from "lucide-react";
import RequireAdmin from "./RequireAdmin.jsx";
import ProductUploadTab from "./ProductUploadTab.jsx";
import ProductsTab from "./ProductsTab.jsx";
import OrdersTab from "./OrdersTab.jsx";

export default function AdminDashboard() {
  const [tab, setTab] = useState("orders");

  return (
    <RequireAdmin>
      <div className="max-w-4xl mx-auto px-5 py-10">
        <h1 className="font-serif-display text-2xl mb-6">Admin Dashboard</h1>

        <div className="flex gap-2 border-b border-sand mb-6 flex-wrap">
          <button onClick={() => setTab("orders")} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "orders" ? "border-ink text-ink" : "border-transparent text-muted"}`}>
            Orders
          </button>
          <button onClick={() => setTab("products")} className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-1.5 ${tab === "products" ? "border-ink text-ink" : "border-transparent text-muted"}`}>
            <Package size={14} /> Products
          </button>
          <button onClick={() => setTab("upload")} className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-1.5 ${tab === "upload" ? "border-ink text-ink" : "border-transparent text-muted"}`}>
            <Upload size={14} /> Upload Product
          </button>
        </div>

        {tab === "orders" && <OrdersTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "upload" && <ProductUploadTab />}
      </div>
    </RequireAdmin>
  );
}