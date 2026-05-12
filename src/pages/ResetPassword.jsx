import { useState, useEffect } from "react";
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

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setSessionReady(true);
      }
    });

    const hash = window.location.hash;
    if (!hash.includes("type=recovery") && !hash.includes("access_token")) {
      setInvalidLink(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) return;
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setSubmitting(true);
    setError(null);

    const { error: err } = await supabase.auth.updateUser({ password });

    if (err) {
      setSubmitting(false);
      setError("Something went wrong. Please try again or request a new link.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role;

    setSubmitting(false);
    setDone(true);

    setTimeout(() => {
      if (role === "admin" || role === "team") {
        navigate("/admin");
      } else {
        navigate("/my-cellar");
      }
    }, 2500);
  };

  const isValid = password && confirm && password === confirm && password.length >= 8;

  if (invalidLink) {
    return (
      <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#777777", marginBottom: "8px" }}>Bodega</p>
          <h1 style={{ fontSize: "20px", color: "#1E4D5A", fontWeight: 400, marginBottom: "12px" }}>Invalid link</h1>
          <p style={{ fontSize: "12px", color: "#0A242C", lineHeight: "1.6", marginBottom: "24px" }}>
            This link is invalid or has expired. Please request a new one from the sign in page.
          </p>
          <a
            href="/team-login"
            style={{ fontSize: "11px", color: "#1E4D5A", fontFamily: "'Courier New', Courier, monospace", textDecoration: "underline" }}
          >
            ← Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>

        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#777777", marginBottom: "8px" }}>Bodega</p>
          <h1 style={{ fontSize: "20px", color: "#1E4D5A", fontWeight: 400, marginBottom: "8px" }}>Set a new password</h1>
          <p style={{ fontSize: "12px", color: "#0A242C", lineHeight: "1.6" }}>
            Choose a new password for your account.
          </p>
        </div>

        {done ? (
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "24px" }}>
            <p style={{ fontSize: "13px", color: "#0A242C", marginBottom: "6px" }}>Password updated</p>
            <p style={{ fontSize: "12px", color: "#0A242C", lineHeight: "1.6" }}>
              Taking you to your account now.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label style={labelStyle}>New password</label>
              <input
                type="password"
                required
                style={{ ...inputStyle, borderColor: focusedField === "password" ? "#1E4D5A" : "#d8d6d0" }}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                autoFocus
              />
            </div>
            <div>
              <label style={labelStyle}>Confirm password</label>
              <input
                type="password"
                required
                style={{ ...inputStyle, borderColor: focusedField === "confirm" ? "#1E4D5A" : "#d8d6d0" }}
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onFocus={() => setFocusedField("confirm")}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {error && <p style={{ fontSize: "12px", color: "#c0392b" }}>{error}</p>}

            <button
              type="submit"
              disabled={!isValid || submitting}
              style={{
                width: "100%", padding: "10px 24px",
                backgroundColor: "#1E4D5A", color: "#f3f2ee",
                border: "none", borderRadius: "0px",
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em",
                cursor: !isValid || submitting ? "not-allowed" : "pointer",
                opacity: !isValid || submitting ? 0.6 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}
              onMouseEnter={e => { if (isValid && !submitting) e.currentTarget.style.backgroundColor = "#0A242C"; }}
              onMouseLeave={e => { if (isValid && !submitting) e.currentTarget.style.backgroundColor = "#1E4D5A"; }}
            >
              {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating...</> : "Set password"}
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