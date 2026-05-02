import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const LOGO_URL = "/bodega_logo_teal.svg";

const NAV = [
  { to: "/",            label: "Home" },
  { to: "/about",       label: "About" },
  { to: "/gallery",     label: "Gallery" },
  { to: "/cellar-club", label: "Cellar Club" },
  { to: "/events",      label: "What's On" },
  { to: "/contact",     label: "Contact" },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const cursorRef = useRef(null);

  const role = user?.user_metadata?.role;
  const isTeam = role === "admin" || role === "team";
  const isMember = isAuthenticated && !isTeam;

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const linkClass = (to) =>
    `text-xs uppercase tracking-widest transition-colors duration-150 ${
      isActive(to) ? "text-[#1E4D5A]" : "text-[#777777] hover:text-[#0A242C]"
    }`;

  useEffect(() => {
    const move = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`;
      }
    };
    const show = () => { if (cursorRef.current) cursorRef.current.style.opacity = "1"; };
    const hide = () => { if (cursorRef.current) cursorRef.current.style.opacity = "0"; };

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseenter", show);
    document.addEventListener("mouseleave", hide);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseenter", show);
      document.removeEventListener("mouseleave", hide);
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f3f2ee", color: "#0A242C", fontFamily: "'Courier New', Courier, monospace", cursor: "none" }}>

      {/* Custom cursor */}
      <div
        ref={cursorRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: "12px", height: "12px",
          borderRadius: "50%", backgroundColor: "#1E4D5A",
          pointerEvents: "none", zIndex: 9999,
          opacity: 0, transition: "opacity 0.2s", willChange: "transform",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50" style={{ borderBottom: "1px solid #d8d6d0", backgroundColor: "#f3f2ee" }}>
        <div className="w-full px-6 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img
              src={LOGO_URL}
              alt="Bodega"
              className="w-auto"
              style={{ height: "36px" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <span style={{ display: "none", fontSize: "16px", fontWeight: 400, color: "#1E4D5A", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Bodega
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV.map(({ to, label }) => (
              <Link key={to} to={to} className={linkClass(to)}>{label}</Link>
            ))}
            {isTeam && (
              <Link
                to="/admin"
                className="text-xs uppercase tracking-widest transition-colors duration-150"
                style={{ color: "#777777" }}
                onMouseEnter={e => e.target.style.color = "#0A242C"}
                onMouseLeave={e => e.target.style.color = "#777777"}
              >
                Admin
              </Link>
            )}
            <Link
              to={isMember ? "/my-cellar" : "/login"}
              style={{
                backgroundColor: "#1E4D5A",
                color: "#ffffff",
                padding: "6px 14px",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                textDecoration: "none",
                borderRadius: "0px",
                transition: "opacity 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              {isMember ? "My Account" : "Members Login"}
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button className="md:hidden p-1" style={{ color: "#777777" }} onClick={() => setMobileOpen((v) => !v)}>
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
                className={`block text-xs uppercase tracking-widest transition-colors duration-150 ${isActive(to) ? "text-[#1E4D5A]" : "text-[#777777]"}`}
              >
                {label}
              </Link>
            ))}
            {isTeam && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="block text-xs uppercase tracking-widest" style={{ color: "#777777" }}>
                Admin
              </Link>
            )}
            <Link
              to={isMember ? "/my-cellar" : "/login"}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "inline-block",
                backgroundColor: "#1E4D5A",
                color: "#ffffff",
                padding: "6px 14px",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                textDecoration: "none",
                borderRadius: "0px",
              }}
            >
              {isMember ? "My Account" : "Members Login"}
            </Link>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #d8d6d0", backgroundColor: "#f3f2ee", position: "relative", zIndex: 1 }} className="py-8">
        <div className="px-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">

            <div>
              <img src={LOGO_URL} alt="Bodega" className="h-6 w-auto mb-4" onError={(e) => { e.target.style.display = "none"; }} />
              <p className="text-sm leading-relaxed" style={{ color: "#777777", letterSpacing: "-0.02em" }}>
                A neighbourhood wine bar in the heart of Stockport.
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#777777" }}>Find us</p>
              <div className="text-sm space-y-1" style={{ color: "#777777", letterSpacing: "-0.02em" }}>
                <p>Engine Room</p>
                <p>Weir Mill</p>
                <p>Stockport, SK3 0AG</p>
                <p className="mt-2">
                  <a href="mailto:hello@bodegawine.co.uk" style={{ color: "#777777" }}>hello@bodegawine.co.uk</a>
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#777777" }}>Opening hours</p>
              <div className="text-sm space-y-1" style={{ color: "#777777", letterSpacing: "-0.02em" }}>
                <p>Monday — Closed</p>
                <p>Tuesday – Sunday — 2pm to late</p>
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
                    style={{ color: "#777777", letterSpacing: "-0.02em" }}
                    onMouseEnter={e => e.target.style.color = "#0A242C"}
                    onMouseLeave={e => e.target.style.color = "#777777"}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #d8d6d0" }} className="pt-4 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs" style={{ color: "#777777", letterSpacing: "-0.02em" }}>
              © {new Date().getFullYear()} Bodega, Stockport. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.rolke.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs"
                style={{ color: "#777777", textDecoration: "none", letterSpacing: "-0.02em" }}
                onMouseEnter={e => e.target.style.color = "#0A242C"}
                onMouseLeave={e => e.target.style.color = "#777777"}
              >
                Website by Rolke
              </a>
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="text-xs"
                  style={{ color: "#777777", background: "none", border: "none", cursor: "none", fontFamily: "'Courier New', Courier, monospace", padding: 0, letterSpacing: "-0.02em" }}
                >
                  Sign out
                </button>
              ) : (
                <Link to="/team-login" className="text-xs" style={{ color: "#777777", textDecoration: "none", letterSpacing: "-0.02em" }}>
                  Team sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}