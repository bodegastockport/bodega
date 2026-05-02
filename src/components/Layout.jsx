import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const LOGO_URL = "/bodega_logo_teal.svg";

const NAV = [
  { to: "/",            label: "Home" },
  { to: "/about",       label: "About" },
  { to: "/gallery",     label: "Gallery" },
  { to: "/menu",        label: "Menu" },
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
                style={{ color: "#0A242C" }}
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
          <button className="md:hidden p-1" style={{ color: "#0A242C" }} onClick={() => setMobileOpen((v) => !v)}>
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
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="block text-xs uppercase tracking-widest" style={{ color: "#0A242C" }}>
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

            <div className="flex flex-col justify-between" style={{ height: "100%" }}>
              <div>
                <img src={LOGO_URL} alt="Bodega" className="h-6 w-auto mb-4" onError={(e) => { e.target.style.display = "none"; }} />
                <p className="text-sm leading-relaxed" style={{ color: "#0A242C", letterSpacing: "-0.02em" }}>
                  A neighbourhood wine bar in the heart of Stockport.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <a href="https://www.instagram.com/bodega_stockport" target="_blank" rel="noopener noreferrer" style={{ color: "#1E4D5A", display: "flex" }} onMouseEnter={e => e.currentTarget.style.opacity = "0.7"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/></svg>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" style={{ color: "#1E4D5A", display: "flex" }} onMouseEnter={e => e.currentTarget.style.opacity = "0.7"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" style={{ color: "#1E4D5A", display: "flex" }} onMouseEnter={e => e.currentTarget.style.opacity = "0.7"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" style={{ color: "#1E4D5A", display: "flex" }} onMouseEnter={e => e.currentTarget.style.opacity = "0.7"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#0A242C" }}>Find us</p>
              <div className="text-sm space-y-1" style={{ color: "#0A242C", letterSpacing: "-0.02em" }}>
                <p>Engine Room</p>
                <p>Weir Mill</p>
                <p>Stockport, SK3 0AG</p>
                <p className="mt-3">+44 (0) 000 000 0000</p>
                <p className="mt-1">
                  <a href="mailto:hello@bodegawine.co.uk" style={{ color: "#0A242C" }}>hello@bodegawine.co.uk</a>
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#0A242C" }}>Opening hours</p>
              <div className="text-sm space-y-1" style={{ color: "#0A242C", letterSpacing: "-0.02em" }}>
                <p>Monday — Closed</p>
                <p>Tuesday – Sunday — 2pm to late</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#0A242C" }}>Quick links</p>
              <div className="space-y-2">
                {NAV.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="block text-sm transition-colors duration-150"
                    style={{ color: "#0A242C", letterSpacing: "-0.02em" }}
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
            <p className="text-xs" style={{ color: "#0A242C", letterSpacing: "-0.02em" }}>
              © {new Date().getFullYear()} Bodega, Stockport. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.rolke.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs"
                style={{ color: "#0A242C", textDecoration: "none", letterSpacing: "-0.02em" }}
                onMouseEnter={e => e.target.style.color = "#0A242C"}
                onMouseLeave={e => e.target.style.color = "#777777"}
              >
                Website by Rolke
              </a>
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="text-xs"
                  style={{ color: "#0A242C", background: "none", border: "none", cursor: "none", fontFamily: "'Courier New', Courier, monospace", padding: 0, letterSpacing: "-0.02em" }}
                >
                  Sign out
                </button>
              ) : (
                <Link to="/team-login" className="text-xs" style={{ color: "#0A242C", textDecoration: "none", letterSpacing: "-0.02em" }}>
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