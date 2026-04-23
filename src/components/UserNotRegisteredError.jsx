export default function UserNotRegisteredError() {
  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
        <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#777777", marginBottom: "16px" }}>Access restricted</p>
        <h1 style={{ fontSize: "20px", color: "#193c47", fontWeight: 400, marginBottom: "12px" }}>You don't have access</h1>
        <p style={{ fontSize: "13px", color: "#777777", lineHeight: "1.7", marginBottom: "24px" }}>
          Your account isn't registered for this application. Please contact the Bodega team to request access.
        </p>
        <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "4px", padding: "16px", textAlign: "left", marginBottom: "24px" }}>
          <p style={{ fontSize: "12px", color: "#777777", marginBottom: "6px" }}>Things to check:</p>
          <ul style={{ fontSize: "12px", color: "#777777", paddingLeft: "16px", lineHeight: "1.8" }}>
            <li>You're signed in with the correct email address</li>
            <li>Your account has been set up by the admin</li>
          </ul>
        </div>
        <button
          onClick={() => window.location.href = '/'}
          style={{ padding: "8px 20px", backgroundColor: "transparent", color: "#193c47", border: "1px solid #193c47", borderRadius: "4px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
        >
          Back to site
        </button>
      </div>
    </div>
  );
}
