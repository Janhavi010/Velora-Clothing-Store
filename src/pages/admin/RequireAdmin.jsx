import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient.js";

export default function RequireAdmin({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function check() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setStatus("denied");
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", userData.user.id).single();
      setStatus(profile?.role === "admin" ? "allowed" : "denied");
    }
    check();
  }, []);

  if (status === "loading") return <div className="max-w-3xl mx-auto px-5 py-16 text-center text-muted">Checking access…</div>;

  if (status === "denied") {
    return (
      <div className="max-w-3xl mx-auto px-5 py-20 text-center">
        <p className="text-muted mb-4">This page is for admins only.</p>
        <Link to="/" className="underline text-ink">Back to home</Link>
      </div>
    );
  }

  return children;
}
