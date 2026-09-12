import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Supabase automatically parses the recovery token from the email link
    // and fires this event once a temporary session is ready.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // In case the event already fired before this component mounted.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage("Password updated! Redirecting to sign in…");
      setTimeout(() => navigate("/auth"), 1500);
    } catch (err) {
      setError(err.message ?? "Could not update password.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <div className="max-w-md mx-auto px-5 py-16 text-center">
        <div className="bg-white/85 backdrop-blur-sm border border-sand rounded-2xl px-7 py-9 shadow-sm">
        <p className="text-muted text-sm">
          Open this page using the reset link from your email. If you arrived here directly,
          please request a new reset link from the sign-in page.
        </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <div className="bg-white/85 backdrop-blur-sm border border-sand rounded-2xl px-7 py-9 shadow-sm">
      <h1 className="font-serif-display text-2xl mb-1">Set a new password</h1>
      <p className="text-muted text-sm mb-6">Choose a new password for your Velora account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="text-xs text-muted">New password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border border-sand rounded-md px-3 py-2 text-sm mt-1 bg-white focus:outline-none focus:ring-1 focus:ring-ink"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="text-xs text-muted">Confirm new password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border border-sand rounded-md px-3 py-2 text-sm mt-1 bg-white focus:outline-none focus:ring-1 focus:ring-ink"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}

        <button type="submit" disabled={loading} className="w-full bg-ink text-white text-sm py-2.5 rounded-full disabled:opacity-60">
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
      </div>
    </div>
  );
}