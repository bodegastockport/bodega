import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const inputStyle = {
  backgroundColor: "#f3f2ee",
  border: "1px solid #d8d6d0",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "13px",
  padding: "9px 12px",
  color: "#0A242C",
  width: "100%",
  outline: "none",
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

export default function CellarClubSuccess() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirm) return;

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    setError(null);

    // Set password via Edge Function using service role
    const res = await fetch(
      "https://yzrjtjcqviudjbddvepq.supabase.co/functions/v1/set-member-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await res.json();

    if (!res.ok || data.error) {
      setSubmitting(false);
      setError("Could not set password. Make sure you're using the email address you signed up with.");
      return;
    }

    // Sign them in immediately
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });

    if (signInErr) {
      setSubmitting(false);
      setError("Password set but couldn't sign in automatically. Please log in manually.");
      return;
    }

    navigate("/my-cellar");
  };

  return (
    <div
      style={{
        backgroundColor: "#f3f2ee",
        fontFamily: "'Courier New', Courier, monospace",
        minHeight: "calc(100vh - 56px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#1E4D5A" }}>
          Cellar Club
        </p>
        <h1 className="text-3xl mb-3" style={{ color: "#0A242C", fontWeight: 400, lineHeight: 1.2 }}>
          You're in.
        </h1>
        <p className="text-xs leading-relaxed mb-8" style={{ color: "#0A242C", letterSpacing: "-0.02em" }}>
          Your membership is confirmed. Set a password to access your member account.
        </p>

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label style={labelStyle}>Email address</label>
            <input
              type="email"
              required
              style={inputStyle}
              placeholder="The email you signed up with"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Choose a password</label>
            <input
              type="password"
              required
              style={inputStyle}
              placeholder="At least 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Confirm password</label>
            <input
              type="password"
              required
              style={inputStyle}
              placeholder="Repeat your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
          </div>

          {error && <p style={{ fontSize: "12px", color: "#c0392b" }}>{error}</p>}

          <button
            type="submit"
            disabled={submitting || !email || !password || !confirm}
            style={{
              width: "100%",
              padding: "10px 24px",
              backgroundColor: "#1E4D5A",
              color: "#f3f2ee",
              border: "none",
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              cursor: submitting || !email || !password || !confirm ? "not-allowed" : "pointer",
              opacity: submitting || !email || !password || !confirm ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Set password and go to my account →
          </button>
        </form>

        <p style={{ marginTop: "24px", fontSize: "11px", color: "#777777" }}>
          <a href="/" style={{ color: "#777777", textDecoration: "none" }}>← Back to Bodega</a>
        </p>
      </div>
    </div>
  );
}