import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { supabase } from "../lib/supabaseClient.js";

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 79;
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
const RAZORPAY_ENABLED = Boolean(RAZORPAY_KEY_ID);

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Field({ label, id, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="text-xs text-muted">{label}</label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-sand rounded-md px-3 py-2 text-sm mt-1 bg-white focus:outline-none focus:ring-1 focus:ring-ink"
      />
    </div>
  );
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate("/auth?redirect=/checkout");
      }
    });
  }, [navigate]);

  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    if (!form.name || !form.phone || !form.address || !form.city || !form.state || !form.pincode) {
      return "Please fill all shipping details.";
    }
    if (!/^\d{10}$/.test(form.phone)) return "Enter a valid 10-digit phone number.";
    if (!/^\d{6}$/.test(form.pincode)) return "Enter a valid 6-digit pincode.";
    return null;
  }

  async function createOrderRow(paymentStatus) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("Please sign in to place an order.");

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        status: "pending",
        subtotal,
        shipping_fee: shipping,
        total,
        shipping_name: form.name,
        shipping_phone: form.phone,
        shipping_address: form.address,
        shipping_city: form.city,
        shipping_state: form.state,
        shipping_pincode: form.pincode,
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      price: item.price,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
    if (itemsErr) throw itemsErr;

    return order;
  }

  async function handlePlaceOrderCOD() {
    setPlacing(true);
    setError(null);
    try {
      const order = await createOrderRow("pending");
      clearCart();
      navigate(`/orders?placed=${order.id}`);
    } catch (e) {
      setError(e.message ?? "Could not place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  async function handlePayOnline() {
    setPlacing(true);
    setError(null);
    try {
      const { data: rpOrder, error: fnError } = await supabase.functions.invoke("create-razorpay-order", {
        body: { amount: Math.round(total * 100) },
      });
      if (fnError) throw fnError;

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Could not load payment gateway. Check your connection.");

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: rpOrder.amount,
        currency: "INR",
        name: "Velora",
        description: "Order payment",
        order_id: rpOrder.id,
        prefill: { name: form.name, contact: form.phone },
        theme: { color: "#2B2420" },
        handler: async (response) => {
          const order = await createOrderRow("paid");
          await supabase
            .from("orders")
            .update({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
            })
            .eq("id", order.id);
          clearCart();
          navigate(`/orders?placed=${order.id}`);
        },
        modal: { ondismiss: () => setPlacing(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      setError(e.message ?? "Payment could not be started. Please try again.");
      setPlacing(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    if (paymentMethod === "cod") handlePlaceOrderCOD();
    else handlePayOnline();
  }

  if (items.length === 0) {
    return <div className="max-w-3xl mx-auto px-5 py-20 text-center text-muted">Your cart is empty — nothing to check out.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="font-serif-display text-2xl mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="font-medium mb-3 text-sm">Shipping details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name" id="name" value={form.name} onChange={(v) => updateField("name", v)} />
              <Field label="Phone number" id="phone" value={form.phone} onChange={(v) => updateField("phone", v)} />
              <div className="sm:col-span-2">
                <Field label="Address" id="address" value={form.address} onChange={(v) => updateField("address", v)} />
              </div>
              <Field label="City" id="city" value={form.city} onChange={(v) => updateField("city", v)} />
              <Field label="State" id="state" value={form.state} onChange={(v) => updateField("state", v)} />
              <Field label="Pincode" id="pincode" value={form.pincode} onChange={(v) => updateField("pincode", v)} />
            </div>
          </div>

          <div>
            <h2 className="font-medium mb-3 text-sm">Payment method</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-3 bg-white/70 border border-sand rounded-md p-3 cursor-pointer">
                <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                <span className="text-sm">Cash on Delivery</span>
              </label>
              <label className={`flex items-center gap-3 border rounded-md p-3 ${RAZORPAY_ENABLED ? "border-sand cursor-pointer" : "border-sand/60 opacity-50"}`}>
                <input type="radio" name="payment" disabled={!RAZORPAY_ENABLED} checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} />
                <span className="text-sm">
                  Pay Online (UPI / Card / Netbanking) {!RAZORPAY_ENABLED && <span className="text-xs text-muted">— coming soon</span>}
                </span>
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="bg-white/85 border border-sand rounded-lg p-5 h-fit">
          <h2 className="font-medium mb-4 text-sm">Order Summary</h2>
          <div className="flex justify-between text-sm text-muted mb-2"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between text-sm text-muted mb-2"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
          <div className="flex justify-between font-medium border-t border-sand mt-3 pt-3 text-sm"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
          <button type="submit" disabled={placing} className="w-full mt-5 bg-ink text-white text-sm py-2.5 rounded-full disabled:opacity-60">
            {placing ? "Placing order…" : paymentMethod === "cod" ? "Place Order (COD)" : "Pay & Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}