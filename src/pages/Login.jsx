import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const inputStyle = {
  backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "4px",
  fontFamily: "'Courier New', Courier, monospace", fontSize: "13px",
  padding: "9px 12px", color: "#2e282a", width: "100%", outline: "none",
  transition: "border-color 0.15s",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setError(null);

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    setSubmitting(false);

    if (err) {
      setError("Something went wrong. Please try again.");
      return;
    }

    setSent(true);
  };

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>

        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#777777", marginBottom: "8px" }}>Bodega</p>
          <h1 style={{ fontSize: "20px", color: "#193c47", fontWeight: 400, marginBottom: "8px" }}>Sign in</h1>
          <p style={{ fontSize: "12px", color: "#777777", lineHeight: "1.6" }}>
            Enter your email and we'll send you a sign-in link. No password needed.
          </p>
        </div>

        {sent ? (
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "4px", padding: "24px" }}>
            <p className="text-sm mb-2" style={{ color: "#2e282a" }}>Check your email</p>
            <p className="text-xs leading-relaxed" style={{ color: "#777777" }}>
              We've sent a sign-in link to <strong style={{ color: "#2e282a" }}>{email}</strong>. Click the link to continue.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              style={{ marginTop: "16px", padding: "7px 16px", backgroundColor: "transparent", color: "#193c47", border: "1px solid #193c47", borderRadius: "4px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label style={{ display: "block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#777777", marginBottom: "5px", fontFamily: "'Courier New', Courier, monospace" }}>
                Email address
              </label>
              <input
                type="email"
                required
                style={{ ...inputStyle, borderColor: focused ? "#193c47" : "#d8d6d0" }}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoFocus
              />
            </div>

            {error && <p style={{ fontSize: "12px", color: "#c0392b" }}>{error}</p>}

            <button
              type="submit"
              disabled={!email || submitting}
              style={{
                width: "100%", padding: "10px 24px",
                backgroundColor: "#193c47", color: "#f3f2ee",
                border: "none", borderRadius: "4px",
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em",
                cursor: !email || submitting ? "not-allowed" : "pointer",
                opacity: !email || submitting ? 0.6 : 1,
                transition: "background-color 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}
              onMouseEnter={e => { if (email && !submitting) e.currentTarget.style.backgroundColor = "#2d6272"; }}
              onMouseLeave={e => { if (email && !submitting) e.currentTarget.style.backgroundColor = "#193c47"; }}
            >
              {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...</> : "Send sign-in link"}
            </button>
          </form>
        )}

        <p style={{ marginTop: "32px", fontSize: "11px", color: "#777777", textAlign: "center" }}>
          <a href="/" style={{ color: "#777777", textDecoration: "none" }}>← Back to Bodega</a>
        </p>
      </div>
    </div>
  );
}