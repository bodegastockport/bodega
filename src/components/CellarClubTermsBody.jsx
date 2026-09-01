const renderBody = (lines) => {
  const blocks = [];
  let currentBullets = null;

  lines.forEach((line, i) => {
    if (line.startsWith("\u2022")) {
      if (!currentBullets) {
        currentBullets = [];
        blocks.push({ type: "ul", items: currentBullets });
      }
      currentBullets.push(line.replace(/^\u2022\s*/, ""));
    } else {
      currentBullets = null;
      blocks.push({ type: "p", text: line, key: i });
    }
  });

  return blocks.map((block, i) => {
    if (block.type === "ul") {
      return (
        <ul key={`ul-${i}`} style={{ margin: "0 0 8px 0", paddingLeft: "18px" }}>
          {block.items.map((item, j) => (
            <li key={j} className="text-sm leading-relaxed" style={{ color: "#0A242C", marginBottom: "4px" }}>
              {item}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={`p-${i}`} className="text-sm leading-relaxed" style={{ color: "#0A242C", marginBottom: "8px" }}>
        {block.text}
      </p>
    );
  });
};

export default function CellarClubTermsBody({ sections, declaration, updatedLabel, showUpdatedLabel = true, showContact = true }) {
  return (
    <>
      {showUpdatedLabel && updatedLabel && (
        <p className="text-xs mb-6" style={{ color: "#0A242C", opacity: 0.5 }}>Last updated: {updatedLabel}</p>
      )}

      {sections.map(({ title, body }) => (
        <div key={title} style={{ marginBottom: "32px" }}>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#1E4D5A" }}>{title}</p>
          {renderBody(body)}
        </div>
      ))}

      <div style={{ marginBottom: "24px", paddingTop: "24px", borderTop: "1px solid #d8d6d0" }}>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#1E4D5A" }}>{declaration.title}</p>
        <p className="text-sm leading-relaxed mb-2" style={{ color: "#0A242C" }}>{declaration.intro}</p>
        <ul style={{ margin: "0 0 8px 0", paddingLeft: "18px" }}>
          {declaration.bullets.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed" style={{ color: "#0A242C", marginBottom: "4px" }}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {showContact && (
        <div style={{ borderTop: "1px solid #d8d6d0", paddingTop: "20px" }}>
          <p className="text-xs" style={{ color: "#0A242C", opacity: 0.6 }}>
            For any questions about these terms, please contact us at{" "}
            <a href="mailto:hello@bodegawine.co.uk" style={{ color: "#1E4D5A" }}>hello@bodegawine.co.uk</a>.
          </p>
        </div>
      )}
    </>
  );
}
