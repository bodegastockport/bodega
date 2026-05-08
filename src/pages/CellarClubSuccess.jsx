export default function CellarClubSuccess() {
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
      <div style={{ maxWidth: "480px", width: "100%" }}>
        <p
          className="text-xs uppercase tracking-widest mb-3"
          style={{ color: "#1E4D5A" }}
        >
          Cellar Club
        </p>
        <h1
          className="text-3xl mb-6"
          style={{ color: "#0A242C", fontWeight: 400, lineHeight: 1.2 }}
        >
          You're in.
        </h1>
        <p
          className="text-xs leading-relaxed mb-4"
          style={{ color: "#0A242C", letterSpacing: "-0.02em" }}
        >
          Your membership is confirmed and your subscription is active.
        </p>
        <p
          className="text-xs leading-relaxed mb-8"
          style={{ color: "#0A242C", letterSpacing: "-0.02em" }}
        >
          We've sent a welcome email to the address you provided. Use the link
          in that email to log in and access your member account, where you can
          manage your bottles and membership details.
        </p>

        <div
          style={{
            borderTop: "1px solid #d8d6d0",
            paddingTop: "24px",
            marginBottom: "24px",
          }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-3"
            style={{ color: "#0A242C" }}
          >
            What happens next
          </p>
          <div className="space-y-3">
            {[
              "Check your email for your welcome message and login link.",
              "Log in to your member account to see your membership details.",
              "Get in touch to arrange your first bottle drop-off — appointments between 2–6pm Tue–Thu and 2–4pm Fri–Sun.",
            ].map((step, i) => (
              <div key={i} className="flex gap-3">
                <span
                  style={{
                    fontSize: "10px",
                    color: "#1E4D5A",
                    minWidth: "16px",
                    paddingTop: "1px",
                  }}
                >
                  {i + 1}.
                </span>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#0A242C", letterSpacing: "-0.02em" }}
                >
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href="/login"
            style={{
              padding: "8px 20px",
              backgroundColor: "#1E4D5A",
              color: "#f3f2ee",
              textDecoration: "none",
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Log in to my account →
          </a>
          <a
            href="/"
            style={{
              padding: "8px 20px",
              backgroundColor: "transparent",
              color: "#0A242C",
              textDecoration: "none",
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              border: "1px solid #d8d6d0",
            }}
          >
            Back to Bodega
          </a>
        </div>
      </div>
    </div>
  );
}
