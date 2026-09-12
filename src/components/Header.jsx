import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, User, LogOut } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { supabase } from "../lib/supabaseClient.js";
import Logo from "./Logo.jsx";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/orders", label: "My Orders" },
];

export default function Header() {
  const { itemCount } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleAuthClick() {
    if (user) {
      await supabase.auth.signOut();
      navigate("/");
    } else {
      navigate("/auth");
    }
  }

  return (
    <header className="border-b border-sand sticky top-0 bg-cream/95 backdrop-blur z-40">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link to="/" className="text-ink">
          <Logo className="h-9 w-auto" />
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={pathname === n.to ? "text-ink font-medium" : "text-muted hover:text-ink"}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAuthClick}
            title={user ? `Sign out (${user.email})` : "Sign in"}
            className="text-muted hover:text-ink flex items-center gap-1"
          >
            {user ? <LogOut size={20} /> : <User size={20} />}
          </button>
          <Link to="/cart" className="relative text-muted hover:text-ink">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-plum text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      <div className="sm:hidden flex justify-center gap-5 pb-3 text-xs">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className={pathname === n.to ? "font-medium text-ink" : "text-muted"}>
            {n.label}
          </Link>
        ))}
      </div>
    </header>
  );
}