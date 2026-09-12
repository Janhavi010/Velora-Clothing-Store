import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin"); // signin | signup | forgot
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage("Password reset link sent! Check your email (and spam folder).");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        if (data.session) {
          // Email confirmation is off — user is already signed in.
          navigate("/");
          return;
        }
        setMessage("Account created! Check your email to confirm, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      }
    } catch (err) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <div className="bg-white/85 backdrop-blur-sm border border-sand rounded-2xl px-7 py-9 shadow-sm">
      <h1 className="font-serif-display text-2xl mb-1">
        {mode === "signin" ? "Sign in" : mode === "signup" ? "Create your account" : "Reset your password"}
      </h1>
      <p className="text-muted text-sm mb-6">
        {mode === "signin" ? "Welcome back to Velora." : mode === "signup" ? "Join Velora to track your orders." : "Enter your email and we'll send you a reset link."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label htmlFor="fullName" className="text-xs text-muted">Full name</label>
            <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required
              className="w-full border border-sand rounded-md px-3 py-2 text-sm mt-1 bg-white focus:outline-none focus:ring-1 focus:ring-ink" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="text-xs text-muted">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full border border-sand rounded-md px-3 py-2 text-sm mt-1 bg-white focus:outline-none focus:ring-1 focus:ring-ink" />
        </div>
        {mode !== "forgot" && (
          <div>
            <label htmlFor="password" className="text-xs text-muted">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full border border-sand rounded-md px-3 py-2 text-sm mt-1 bg-white focus:outline-none focus:ring-1 focus:ring-ink" />
          </div>
        )}

        {mode === "signin" && (
          <div className="text-right -mt-2">
            <button type="button" className="text-xs text-muted underline" onClick={() => { setMode("forgot"); setError(null); setMessage(null); }}>
              Forgot password?
            </button>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}

        <button type="submit" disabled={loading} className="w-full bg-ink text-white text-sm py-2.5 rounded-full disabled:opacity-60">
          {loading ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
        </button>
      </form>

      <p className="text-sm text-muted mt-5 text-center">
        {mode === "forgot" ? (
          <button className="underline text-ink" onClick={() => { setMode("signin"); setError(null); setMessage(null); }}>
            Back to sign in
          </button>
        ) : (
          <>
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button className="underline text-ink" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setMessage(null); }}>
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </>
        )}
      </p>

      <p className="text-xs text-muted/70 mt-8 text-center">Velora — curated by Janhavi Singh</p>
      </div>
    </div>
  );
}