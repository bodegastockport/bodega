import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const inputStyle = {
  backgroundColor: "#f3f2ee",
  border: "1px solid #d8d6d0",
  borderRadius: "4px",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "13px",
  padding: "9px 12px",
  color: "#0A242C",
  width: "100%",
  outline: "none",
  transition: "border-color 0.15s",
};

const labelStyle = {
  display: "block",
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#777777",
  marginBottom: "5px",
  fontFamily: "'Courier New', Courier, monospace",
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    setError(null);

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });

    setSubmitting(false);
    if (err) {
      setError("Incorrect email or password.");
      return;
    }
    navigate("/my-cellar");
  };

  const handlePasswordReset = async () => {
    if (!email) { setError("Enter your email address first."); return; }
    setSubmitting(true);
    setError(null);

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setSubmitting(false);
    if (err) { setError("Something went wrong. Please try again."); return; }
    setResetSent(true);
  };

  const handleMagicLink = async () => {
    if (!email) { setError("Enter your email address first."); return; }
    setSubmitting(true);
    setError(null);

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/my-cellar` },
    });

    setSubmitting(false);
    if (err) { setError("Something went wrong. Please try again."); return; }
    setMagicSent(true);
  };

  const reset = () => {
    setResetSent(false);
    setMagicSent(false);
    setEmail("");
    setPassword("");
    setError(null);
  };

  if (resetSent) {
    return (
      <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "24px" }}>
            <p style={{ fontSize: "13px", color: "#0A242C", marginBottom: "8px" }}>Check your email</p>
            <p style={{ fontSize: "12px", color: "#0A242C", lineHeight: "1.6" }}>
              We've sent a password reset link to <strong>{email}</strong>. Click it to set a new password.
            </p>
            <button
              onClick={reset}
              style={{ marginTop: "16px", padding: "7px 16px", backgroundColor: "transparent", color: "#1E4D5A", border: "1px solid #1E4D5A", borderRadius: "0px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
            >
              Back to login
            </button>
          </div>
          <p style={{ marginTop: "32px", fontSize: "11px", color: "#777777", textAlign: "center" }}>
            <a href="/" style={{ color: "#777777", textDecoration: "none" }}>← Back to Bodega</a>
          </p>
        </div>
      </div>
    );
  }

  if (magicSent) {
    return (
      <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "24px" }}>
            <p style={{ fontSize: "13px", color: "#0A242C", marginBottom: "8px" }}>Check your email</p>
            <p style={{ fontSize: "12px", color: "#0A242C", lineHeight: "1.6" }}>
              We've sent a sign-in link to <strong>{email}</strong>. Click it to access your cellar.
            </p>
            <button
              onClick={reset}
              style={{ marginTop: "16px", padding: "7px 16px", backgroundColor: "transparent", color: "#1E4D5A", border: "1px solid #1E4D5A", borderRadius: "0px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
            >
              Back to login
            </button>
          </div>
          <p style={{ marginTop: "32px", fontSize: "11px", color: "#777777", textAlign: "center" }}>
            <a href="/" style={{ color: "#777777", textDecoration: "none" }}>← Back to Bodega</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>

        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#777777", marginBottom: "8px" }}>Cellar Club</p>
          <h1 style={{ fontSize: "20px", color: "#1E4D5A", fontWeight: 400, marginBottom: "8px" }}>Member login</h1>
          <p style={{ fontSize: "12px", color: "#0A242C", lineHeight: "1.6" }}>
            Sign in with your email and password.
          </p>
        </div>

        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label style={labelStyle}>Email address</label>
            <input
              type="email"
              required
              style={{ ...inputStyle, borderColor: focusedField === "email" ? "#1E4D5A" : "#d8d6d0" }}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              autoFocus
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              required
              style={{ ...inputStyle, borderColor: focusedField === "password" ? "#1E4D5A" : "#d8d6d0" }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          {error && <p style={{ fontSize: "12px", color: "#c0392b" }}>{error}</p>}

          <button
            type="submit"
            disabled={!email || !password || submitting}
            style={{
              width: "100%", padding: "10px 24px",
              backgroundColor: "#1E4D5A", color: "#f3f2ee",
              border: "none", borderRadius: "0px",
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em",
              cursor: !email || !password || submitting ? "not-allowed" : "pointer",
              opacity: !email || !password || submitting ? 0.6 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}
            onMouseEnter={e => { if (email && password && !submitting) e.currentTarget.style.backgroundColor = "#0A242C"; }}
            onMouseLeave={e => { if (email && password && !submitting) e.currentTarget.style.backgroundColor = "#1E4D5A"; }}
          >
            {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Signing in...</> : "Sign in"}
          </button>

          <div style={{ borderTop: "1px solid #d8d6d0", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div>
              <p style={{ fontSize: "11px", color: "#777777", marginBottom: "4px" }}>Forgotten your password?</p>
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={submitting}
                style={{ fontSize: "11px", color: "#1E4D5A", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "'Courier New', Courier, monospace", textDecoration: "underline" }}
              >
                Send a reset link →
              </button>
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "#777777", marginBottom: "4px" }}>Don't have your password to hand?</p>
              <button
                type="button"
                onClick={handleMagicLink}
                disabled={submitting}
                style={{ fontSize: "11px", color: "#1E4D5A", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "'Courier New', Courier, monospace", textDecoration: "underline" }}
              >
                Sign in with a magic link →
              </button>
            </div>
          </div>
        </form>

        <p style={{ marginTop: "32px", fontSize: "11px", color: "#777777", textAlign: "center" }}>
          <a href="/" style={{ color: "#777777", textDecoration: "none" }}>← Back to Bodega</a>
        </p>
      </div>
    </div>
  );
}