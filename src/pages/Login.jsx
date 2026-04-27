import { useState } from "react";
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

export default function Login() {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);
  const [focused, setFocused]       = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setSubmitting(false);

    if (authError) {
      setError("Incorrect email or password.");
      return;
    }

    // Redirect based on role — admin/team go to admin panel, members go to their cellar
    const role = data.user?.user_metadata?.role;
    if (role === "admin" || role === "team") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/my-cellar";
    }
  };

  const getStyle = (field) => ({
    ...inputStyle,
    borderColor: focused === field ? "#1E4D5A" : "#d8d6d0",
  });

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>

        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#777777", marginBottom: "8px" }}>Bodega</p>
          <h1 style={{ fontSize: "20px", color: "#1E4D5A", fontWeight: 400, marginBottom: "8px" }}>Sign in</h1>
          <p style={{ fontSize: "12px", color: "#777777", lineHeight: "1.6" }}>
            Members: sign in to access your cellar. Team: use your staff credentials.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label style={{ display: "block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#777777", marginBottom: "5px", fontFamily: "'Courier New', Courier, monospace" }}>
              Email address
            </label>
            <input
              type="email"
              required
              style={getStyle("email")}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              autoFocus
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#777777", marginBottom: "5px", fontFamily: "'Courier New', Courier, monospace" }}>
              Password
            </label>
            <input
              type="password"
              required
              style={getStyle("password")}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
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
              transition: "background-color 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}
            onMouseEnter={e => { if (email && password && !submitting) e.currentTarget.style.backgroundColor = "#0A242C"; }}
            onMouseLeave={e => { if (email && password && !submitting) e.currentTarget.style.backgroundColor = "#1E4D5A"; }}
          >
            {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Signing in...</> : "Sign in"}
          </button>
        </form>

        <p style={{ marginTop: "32px", fontSize: "11px", color: "#777777", textAlign: "center" }}>
          <a href="/" style={{ color: "#777777", textDecoration: "none" }}>← Back to Bodega</a>
        </p>
      </div>
    </div>
  );
}