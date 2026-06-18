const sections = [
  {
    title: "1. Introduction",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    title: "2. Information We Collect",
    body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    title: "3. How We Use Your Information",
    body: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  },
  {
    title: "5. Third-Party Services",
    body: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit. Bodega uses third-party services including Stripe for payments and Supabase for account and booking management. Each operates under its own privacy policy.",
  },
  {
    title: "6. Data Retention",
    body: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.",
  },
  {
    title: "7. Your Rights",
    body: "Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. You have the right to access, correct or request deletion of your personal data at any time.",
  },
  {
    title: "8. Contact Us",
    body: "If you have any questions about this Privacy Policy or how we handle your personal data, please contact us at hello@bodegawine.co.uk.",
  },
];

export default function Privacy() {
  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "64px 36px" }}>

        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#0A242C", opacity: 0.5 }}>Bodega Wine Bar</p>
        <h1 className="text-2xl mb-2" style={{ color: "#1E4D5A", fontWeight: 400 }}>Privacy Policy</h1>
        <p className="text-xs mb-10" style={{ color: "#0A242C", opacity: 0.5 }}>Last updated: June 2026</p>

        {sections.slice(0, 3).map(({ title, body }) => (
          <div key={title} style={{ marginBottom: "32px" }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#1E4D5A" }}>{title}</p>
            <p className="text-sm leading-relaxed" style={{ color: "#0A242C" }}>{body}</p>
          </div>
        ))}

        <div style={{ marginBottom: "32px" }}>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#1E4D5A" }}>4. Cookies and Tracking Technologies</p>
          <p className="text-sm leading-relaxed mb-3" style={{ color: "#0A242C" }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. We use cookies and similar technologies, including Google Analytics (GA4) and the Meta Pixel, to understand how visitors use our website and to measure the effectiveness of our marketing.
          </p>
          <p className="text-sm leading-relaxed mb-3" style={{ color: "#0A242C" }}>
            These cookies are only set if you accept them. You can change your preference at any time.
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("bodega-open-cookie-settings"))}
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              backgroundColor: "transparent",
              color: "#0A242C",
              border: "1px solid #0A242C",
              padding: "9px 18px",
              cursor: "pointer",
            }}
          >
            Manage Cookie Preferences
          </button>
        </div>

        {sections.slice(3).map(({ title, body }) => (
          <div key={title} style={{ marginBottom: "32px" }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#1E4D5A" }}>{title}</p>
            <p className="text-sm leading-relaxed" style={{ color: "#0A242C" }}>{body}</p>
          </div>
        ))}

        <div style={{ borderTop: "1px solid #d8d6d0", paddingTop: "24px", marginTop: "24px" }}>
          <p className="text-xs" style={{ color: "#0A242C", opacity: 0.6 }}>
            For any questions about this policy, please contact us at{" "}
            <a href="mailto:hello@bodegawine.co.uk" style={{ color: "#1E4D5A" }}>hello@bodegawine.co.uk</a>.
          </p>
        </div>

      </div>
    </div>
  );
}
