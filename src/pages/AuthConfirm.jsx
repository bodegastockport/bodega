import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthConfirm() {
  const [tokenHash, setTokenHash] = useState("");
  const [type, setType] = useState("recovery");
  const [next, setNext] = useState("/reset-password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTokenHash(params.get("token_hash") || "");
    setType(params.get("type") || "recovery");
    setNext(params.get("next") || "/reset-password");
  }, []);

  const handleContinue = async () => {
    if (!tokenHash) return;
    setLoading(true);
    setError("");

    const { error: err } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    setLoading(false);

    if (err) {
      setError("This password reset link has expired or has already been used. Please request a new one.");
      return;
    }

    window.location.href = next;
  };

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>

        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#777777", marginBottom: "8px" }}>Bodega</p>
          <h1 style={{ fontSize: "20px", color: "#1E4D5A", fontWeight: 400, marginBottom: "8px" }}>Reset your password</h1>
          <p style={{ fontSize: "12px", color: "#0A242C", lineHeight: "1.6" }}>
            Click the button below to continue and set a new password for your account.
          </p>
        </div>

        {error && (
          <p style={{ fontSize: "12px", color: "#c0392b", marginBottom: "16px", lineHeight: "1.5" }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={!tokenHash || loading}
          style={{
            width: "100%", padding: "10px 24px",
            backgroundColor: "#1E4D5A", color: "#f3f2ee",
            border: "none", borderRadius: "0px",
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em",
            cursor: !tokenHash || loading ? "not-allowed" : "pointer",
            opacity: !tokenHash || loading ? 0.6 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}
          onMouseEnter={e => { if (tokenHash && !loading) e.currentTarget.style.backgroundColor = "#0A242C"; }}
          onMouseLeave={e => { if (tokenHash && !loading) e.currentTarget.style.backgroundColor = "#1E4D5A"; }}
        >
          {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing...</> : "Set my password →"}
        </button>

        <p style={{ marginTop: "32px", fontSize: "11px", color: "#777777", textAlign: "center" }}>
          <a href="/" style={{ color: "#777777", textDecoration: "none" }}>← Back to Bodega</a>
        </p>
      </div>
    </div>
  );
}