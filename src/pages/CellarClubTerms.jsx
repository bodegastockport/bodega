export default function CellarClubTerms() {
  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "64px 36px" }}>

        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#777777" }}>Bodega Wine Bar</p>
        <h1 className="text-2xl mb-2" style={{ color: "#1E4D5A", fontWeight: 400 }}>Cellar Club Terms & Conditions</h1>
        <p className="text-xs mb-10" style={{ color: "#777777" }}>Last updated: June 2026</p>

        {[
          {
            title: "1. Membership",
            body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
          },
          {
            title: "2. Storage",
            body: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."
          },
          {
            title: "3. Access & Retrieval",
            body: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit."
          },
          {
            title: "4. Billing & Payment",
            body: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi."
          },
          {
            title: "5. Cancellation",
            body: "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet."
          },
          {
            title: "6. Liability",
            body: "Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          },
          {
            title: "7. Amendments",
            body: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Bodega Wine Bar reserves the right to amend these terms at any time. Members will be given 30 days notice of any material changes."
          },
        ].map(({ title, body }) => (
          <div key={title} style={{ marginBottom: "32px" }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#1E4D5A" }}>{title}</p>
            <p className="text-sm leading-relaxed" style={{ color: "#777777" }}>{body}</p>
          </div>
        ))}

        <div style={{ borderTop: "1px solid #d8d6d0", paddingTop: "24px", marginTop: "24px" }}>
          <p className="text-xs" style={{ color: "#777777" }}>
            For any questions about these terms, please contact us at{" "}
            <a href="mailto:hello@bodegawine.co.uk" style={{ color: "#1E4D5A" }}>hello@bodegawine.co.uk</a>.
          </p>
        </div>

        <div style={{ marginTop: "32px" }}>
          <a href="/cellar-club" style={{ fontSize: "11px", color: "#777777", textDecoration: "none", borderBottom: "1px solid #d8d6d0", paddingBottom: "1px" }}>
            ← Back to Cellar Club
          </a>
        </div>
      </div>
    </div>
  );
}
