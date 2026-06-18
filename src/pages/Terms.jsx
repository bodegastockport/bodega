const sections = [
  {
    title: "1. Introduction",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. These Terms of Use govern your use of the Bodega website at bodegawine.co.uk.",
  },
  {
    title: "2. Use of This Website",
    body: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    title: "3. Bookings and Cellar Club Membership",
    body: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Cellar Club Membership is additionally governed by our separate Cellar Club Terms & Conditions.",
  },
  {
    title: "4. Intellectual Property",
    body: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  },
  {
    title: "5. Limitation of Liability",
    body: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
  },
  {
    title: "6. Governing Law",
    body: "These Terms of Use shall be governed by and construed in accordance with the laws of England and Wales, and any dispute shall be subject to the exclusive jurisdiction of the courts of England and Wales.",
  },
];

export default function Terms() {
  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "64px 36px" }}>

        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#0A242C", opacity: 0.5 }}>Bodega Wine Bar</p>
        <h1 className="text-2xl mb-2" style={{ color: "#1E4D5A", fontWeight: 400 }}>Terms of Use</h1>
        <p className="text-xs mb-10" style={{ color: "#0A242C", opacity: 0.5 }}>Last updated: June 2026</p>

        {sections.map(({ title, body }) => (
          <div key={title} style={{ marginBottom: "32px" }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#1E4D5A" }}>{title}</p>
            <p className="text-sm leading-relaxed" style={{ color: "#0A242C" }}>{body}</p>
          </div>
        ))}

        <div style={{ borderTop: "1px solid #d8d6d0", paddingTop: "24px", marginTop: "24px" }}>
          <p className="text-xs" style={{ color: "#0A242C", opacity: 0.6 }}>
            For any questions about these terms, please contact us at{" "}
            <a href="mailto:hello@bodegawine.co.uk" style={{ color: "#1E4D5A" }}>hello@bodegawine.co.uk</a>.
          </p>
        </div>

      </div>
    </div>
  );
}
