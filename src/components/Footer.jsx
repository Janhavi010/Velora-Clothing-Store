import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-sand py-10 text-center">
      <Link to="/" className="text-ink inline-block">
        <Logo className="h-8 w-auto mx-auto" />
      </Link>
      <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
        Everyday elegance for women — tops, jeans, dresses and fine jewellery, delivered across India.
      </p>
      <div className="flex justify-center gap-4 mt-4 text-xs text-muted">
        <Link to="/shop?category=tops" className="hover:text-ink">Tops</Link>
        <Link to="/shop?category=jeans" className="hover:text-ink">Jeans</Link>
        <Link to="/shop?category=dresses" className="hover:text-ink">Dresses</Link>
        <Link to="/shop?category=jewellery" className="hover:text-ink">Jewellery</Link>
        <Link to="/orders" className="hover:text-ink">Track order</Link>
        <Link to="/admin" className="hover:text-ink">Admin</Link>
      </div>
      <p className="text-[11px] text-muted/70 mt-6">© {new Date().getFullYear()} Velora. All rights reserved.</p>
      <p className="text-[11px] text-muted/70 mt-1">Curated by Janhavi Singh</p>
    </footer>
  );
}