import { useState } from "react";
import { Upload } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";

const CATEGORIES = ["tops", "jeans", "dresses", "jewellery"];

export default function ProductUploadTab() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("tops");
  const [sizes, setSizes] = useState("S, M, L, XL");
  const [colors, setColors] = useState("");
  const [stock, setStock] = useState("10");
  const [files, setFiles] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  function resetForm() {
    setName(""); setDescription(""); setPrice(""); setSizes("S, M, L, XL"); setColors(""); setStock("10"); setFiles(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      if (!name || !price) throw new Error("Name and price are required.");

      const imageUrls = [];
      if (files) {
        for (const file of Array.from(files)) {
          const path = `${Date.now()}-${file.name}`;
          const { error: uploadErr } = await supabase.storage.from("product-images").upload(path, file);
          if (uploadErr) throw uploadErr;
          const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(path);
          imageUrls.push(publicUrl.publicUrl);
        }
      }

      const { error: insertErr } = await supabase.from("products").insert({
        name,
        description,
        price: Number(price),
        category,
        sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: colors.split(",").map((c) => c.trim()).filter(Boolean),
        image_urls: imageUrls,
        stock: Number(stock),
        is_active: true,
      });
      if (insertErr) throw insertErr;

      setMessage("Product uploaded successfully.");
      resetForm();
    } catch (err) {
      setError(err.message ?? "Could not upload product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <label className="text-xs text-muted">Product name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required
          className="w-full border border-sand rounded-md px-3 py-2 text-sm mt-1 bg-white" />
      </div>
      <div>
        <label className="text-xs text-muted">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
          className="w-full border border-sand rounded-md px-3 py-2 text-sm mt-1 bg-white" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted">Price (₹)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required
            className="w-full border border-sand rounded-md px-3 py-2 text-sm mt-1 bg-white" />
        </div>
        <div>
          <label className="text-xs text-muted">Stock</label>
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)}
            className="w-full border border-sand rounded-md px-3 py-2 text-sm mt-1 bg-white" />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-sand rounded-md px-3 py-2 text-sm mt-1 bg-white">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-muted">Sizes (comma separated)</label>
        <input value={sizes} onChange={(e) => setSizes(e.target.value)}
          className="w-full border border-sand rounded-md px-3 py-2 text-sm mt-1 bg-white" />
      </div>
      <div>
        <label className="text-xs text-muted">Colours (comma separated, optional)</label>
        <input value={colors} onChange={(e) => setColors(e.target.value)}
          className="w-full border border-sand rounded-md px-3 py-2 text-sm mt-1 bg-white" />
      </div>
      <div>
        <label className="text-xs text-muted">Images</label>
        <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)}
          className="w-full text-sm mt-1" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}

      <button type="submit" disabled={saving} className="bg-ink text-white text-sm px-5 py-2.5 rounded-full flex items-center gap-2 disabled:opacity-60">
        <Upload size={14} /> {saving ? "Uploading…" : "Upload product"}
      </button>
    </form>
  );
}
