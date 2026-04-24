import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const LOGO_URL = "/bodega_logo_teal.svg";

const NAV = [
  { to: "/",            label: "Reserve" },
  { to: "/about",       label: "About" },
  { to: "/menu",        label: "Menu" },
  { to: "/events",      label: "Events" },
  { to: "/cellar-club", label: "Cellar Club" },
  { to: "/gallery",     label: "Gallery" },
  { to: "/contact",     label: "Contact" },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const isHome = location.pathname === "/";

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const linkClass = (to) =>
    `text-xs uppercase tracking-widest transition-colors duration-150 ${
      isActive(to) ? "text-[#193c47]" : "text-[#777777] hover:text-[#2e282a]"
    }`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f3f2ee", color: "#2e282a", fontFamily: "'Courier New', Courier, monospace" }}>

      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{ borderBottom: "1px solid #d8d6d0", backgroundColor: "#f3f2ee" }}
      >
        <div className="w-full px-6 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img
              src={LOGO_URL}
              alt="Bodega"
              className="h-7 w-auto"
              onError={(e) => {
                // Fallback to text if logo not found yet
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <span style={{ display: "none", fontSize: "16px", fontWeight: 400, color: "#193c47", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Bodega
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV.map(({ to, label }) => (
              <Link key={to} to={to} className={linkClass(to)}>{label}</Link>
            ))}
            {isAuthenticated && (
              <Link to="/admin" className="text-xs uppercase tracking-widest transition-colors duration-150" style={{ color: "#777777" }}
                onMouseEnter={e => e.target.style.color = "#2e282a"}
                onMouseLeave={e => e.target.style.color = "#777777"}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1"
            style={{ color: "#777777" }}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ borderTop: "1px solid #d8d6d0", backgroundColor: "#f3f2ee" }} className="md:hidden px-6 py-4 space-y-3">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`block text-xs uppercase tracking-widest transition-colors duration-150 ${isActive(to) ? "text-[#193c47]" : "text-[#777777]"}`}
              >
                {label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="block text-xs uppercase tracking-widest" style={{ color: "#777777" }}>
                Admin
              </Link>
            )}
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        style={{ borderTop: "1px solid #d8d6d0", backgroundColor: "#f3f2ee", position: "relative", zIndex: 1, marginTop: isHome ? 0 : "48px" }}
        className="py-8"
      >
        <div className="px-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <img
                src={LOGO_URL}
                alt="Bodega"
                className="h-6 w-auto mb-4"
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <p className="text-sm leading-relaxed" style={{ color: "#777777" }}>
                An intimate wine bar in the heart of Stockport, Manchester.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#777777" }}>Find us</p>
              <div className="text-sm space-y-1" style={{ color: "#777777" }}>
                <p>Bodega Wine Bar</p>
                <p>Stockport, Manchester</p>
                <p className="mt-2">
                  <a href="mailto:hello@bodegawine.co.uk" style={{ color: "#777777" }}>hello@bodegawine.co.uk</a>
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#777777" }}>Opening hours</p>
              <div className="text-sm space-y-1" style={{ color: "#777777" }}>
                <p>Monday — Closed</p>
                <p>Tuesday – Sunday: 2pm – 9pm</p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#777777" }}>Quick links</p>
              <div className="space-y-2">
                {NAV.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="block text-sm transition-colors duration-150"
                    style={{ color: "#777777" }}
                    onMouseEnter={e => e.target.style.color = "#2e282a"}
                    onMouseLeave={e => e.target.style.color = "#777777"}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #d8d6d0" }} className="pt-4 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs" style={{ color: "#777777" }}>
              © {new Date().getFullYear()} Bodega Wine Bar, Stockport. All rights reserved.
            </p>
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="text-xs"
                style={{ color: "#777777", background: "none", border: "none", cursor: "pointer", fontFamily: "'Courier New', Courier, monospace", padding: 0 }}
              >
                Sign out
              </button>
            ) : (
              <Link to="/login" className="text-xs" style={{ color: "#777777", textDecoration: "none" }}>
                Team sign in
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}