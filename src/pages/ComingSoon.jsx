import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

// Social icons as inline SVGs — no external dependency needed
const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none"/>
  </svg>
);

const TikTokIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.428c0-3.007 1.792-4.669 4.532-4.669 1.312 0 2.686.234 2.686.234v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/bodega_stockport/",
    icon: <InstagramIcon />,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@bodgea_stockport",
    icon: <TikTokIcon />,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/Bodega-Stockport/61589380284909/",
    icon: <FacebookIcon />,
  },
  {
    label: "Google",
    href: "https://share.google/FSAX760ymCwOEEG4c",
    icon: <GoogleIcon />,
  },
];

export default function ComingSoon() {
  const [email, setEmail]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(false);
  const [error, setError]           = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setError(null);

    // Calls the capture-mailing-list Edge Function which writes
    // directly to the Bodega Mailing List Google Sheet.
    // No data is stored in Supabase.
    const { error: fnError } = await supabase.functions.invoke("capture-mailing-list", {
      body: {
        email:  email.trim().toLowerCase(),
        source: "Coming Soon page",
      },
    });

    setSubmitting(false);

    if (fnError) {
      setError("Something went wrong. Please try again.");
      return;
    }

    setDone(true);
  };

  return (
    <div className="coming-soon-page" style={{ position: "fixed", inset: 0, fontFamily: "'Courier New', Courier, monospace", overflow: "hidden", cursor: "default" }}>

      {/* Full-page background image */}
      <img
        src="/images/coming-soon.jpg"
        alt="Bodega wine bar"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
      />

      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(10, 36, 44, 0.58)", pointerEvents: "none" }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column" }}>

        {/* Logo bar */}
        <div style={{ width: "100%" }}>
          <img
            src="/images/bodega-logo.svg"
            alt="Bodega"
            style={{ width: "100%", display: "block" }}
          />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ width: "100%", textAlign: "center", padding: "0 40px" }}>

            <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(243,242,238,0.6)", marginBottom: "16px" }}>
              Opening July 2026 — Stockport
            </p>

            <h2 style={{ fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 400, color: "#f3f2ee", lineHeight: 1.3, marginBottom: "18px", letterSpacing: "0.02em" }}>
              Stockport's newest wine bar is almost here
            </h2>

            <p style={{ fontSize: "13px", lineHeight: 1.75, color: "rgba(243,242,238,0.75)", marginBottom: "36px", maxWidth: "480px", margin: "0 auto 36px" }}>
              A neighbourhood wine bar, private cellar club and bottle shop, opening at Weir Mill, Stockport this Summer.
            </p>

            {done ? (
              <div style={{ padding: "16px 24px", border: "1px solid rgba(243,242,238,0.25)", backgroundColor: "rgba(243,242,238,0.08)" }}>
                <p style={{ fontSize: "13px", color: "#f3f2ee", margin: 0 }}>
                  You're on the list. We'll be in touch soon.
                </p>
              </div>
            ) : (
              <>
                <form
                  onSubmit={handleSubmit}
                  style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}
                >
                  <input
                    type="email"
                    required
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    style={{
                      flex: "1 1 220px",
                      maxWidth: "320px",
                      padding: "10px 14px",
                      backgroundColor: "rgba(243,242,238,0.1)",
                      border: "1px solid rgba(243,242,238,0.3)",
                      borderRadius: "0px",
                      fontFamily: "'Courier New', Courier, monospace",
                      fontSize: "13px",
                      color: "#f3f2ee",
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#f3f2ee",
                      color: "#0A242C",
                      border: "none",
                      borderRadius: "0px",
                      fontFamily: "'Courier New', Courier, monospace",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      cursor: submitting ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      whiteSpace: "nowrap",
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Notify me
                  </button>
                </form>

                {error && (
                  <p style={{ marginTop: "10px", fontSize: "12px", color: "#ffaaaa" }}>{error}</p>
                )}

                <p style={{ marginTop: "12px", fontSize: "10px", color: "rgba(243,242,238,0.4)", letterSpacing: "0.04em" }}>
                  Sign up for updates or to register your interest in the Cellar Club.
                </p>
              </>
            )}

            {/* Social links */}
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "40px" }}>
              {socialLinks.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    color: "rgba(243,242,238,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#f3f2ee"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "rgba(243,242,238,0.5)"}
                >
                  {icon}
                </a>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}