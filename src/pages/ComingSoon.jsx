import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

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
    <div style={{ position: "fixed", inset: 0, fontFamily: "'Courier New', Courier, monospace", overflow: "hidden" }}>

      {/* Full-page background image */}
      <img
        src="/images/coming-soon.jpg"
        alt="Bodega wine bar"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
      />

      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(20, 14, 12, 0.55)" }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column" }}>

        {/* Logo bar */}
        <div>
          <img
            src="/images/bodega-logo.svg"
            alt="Bodega"
            style={{ width: "calc(100% - 48px)", display: "block", margin: "0 24px" }}
          />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ maxWidth: "520px", width: "100%", textAlign: "center" }}>

            <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(243,242,238,0.6)", marginBottom: "16px" }}>
              Opening June 5th, 2026 — Stockport
            </p>

            <h2 style={{ fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 400, color: "#f3f2ee", lineHeight: 1.3, marginBottom: "18px", letterSpacing: "0.02em" }}>
              Stockport's new wine bar<br />is almost here
            </h2>

            <p style={{ fontSize: "13px", lineHeight: 1.75, color: "rgba(243,242,238,0.75)", marginBottom: "36px" }}>
              A neighbourhood wine bar, private cellar club and bottle shop for people who love good wine. It opens June 5th 2026.
            </p>

            {done ? (
              <div style={{ padding: "16px 24px", border: "1px solid rgba(243,242,238,0.25)", borderRadius: "4px", backgroundColor: "rgba(243,242,238,0.08)" }}>
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
                      borderRadius: "4px",
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
                      color: "#193c47",
                      border: "none",
                      borderRadius: "4px",
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
                  No spam. Just the opening date and what's on.
                </p>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
