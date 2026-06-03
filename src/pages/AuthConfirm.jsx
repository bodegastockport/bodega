import { useEffect, useState } from "react";

export default function AuthConfirm() {
  const [confirmationUrl, setConfirmationUrl] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("confirmation_url");
    if (url) setConfirmationUrl(decodeURIComponent(url));
  }, []);

  const handleContinue = () => {
    if (confirmationUrl) {
      window.location.href = confirmationUrl;
    }
  };

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>

        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#777777", marginBottom: "8px" }}>Bodega</p>
          <h1 style={{ fontSize: "20px", color: "#1E4D5A", fontWeight: 400, marginBottom: "8px" }}>Reset your password</h1>
          <p style={{ fontSize: "12px", color: "#0A242C", lineHeight: "1.6" }}>
            Click the button below to set a new password for your account.
          </p>
        </div>

        <button
          onClick={handleContinue}
          disabled={!confirmationUrl}
          style={{
            width: "100%", padding: "10px 24px",
            backgroundColor: "#1E4D5A", color: "#f3f2ee",
            border: "none", borderRadius: "0px",
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em",
            cursor: !confirmationUrl ? "not-allowed" : "pointer",
            opacity: !confirmationUrl ? 0.6 : 1,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onMouseEnter={e => { if (confirmationUrl) e.currentTarget.style.backgroundColor = "#0A242C"; }}
          onMouseLeave={e => { if (confirmationUrl) e.currentTarget.style.backgroundColor = "#1E4D5A"; }}
        >
          Set my password →
        </button>

        <p style={{ marginTop: "32px", fontSize: "11px", color: "#777777", textAlign: "center" }}>
          <a href="/" style={{ color: "#777777", textDecoration: "none" }}>← Back to Bodega</a>
        </p>
      </div>
    </div>
  );
}