import SEO from "../components/SEO";

const schema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Bodega Gift Card",
  "description": "Gift cards for Bodega, a neighbourhood wine bar in the heart of Stockport. Redeemable in person for drinks, boards and Cellar Club membership.",
  "url": "https://bodegawine.co.uk/gift-cards",
  "brand": {
    "@type": "Brand",
    "name": "Bodega"
  }
};

const GIFT_CARD_URL = "https://app.squareup.com/gift/MLHJBE5B4M011/order";

export default function GiftCards() {
  return (
    <>
      <SEO
        title="Gift Cards — Bodega, Stockport"
        description="Give the gift of good wine. Bodega gift cards are redeemable in person for drinks, boards and more at our Stockport wine bar."
        canonical="/gift-cards"
        schema={schema}
      />

      <div className="hidden lg:block">
        <div style={{ position: "fixed", top: 0, left: 0, width: "50vw", height: "100vh", zIndex: 0 }}>
          <img
            src="/images/cellar-club.webp"
            alt="Gift cards at Bodega, Stockport"
            width="1600"
            height="2000"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <div style={{ marginLeft: "50vw", width: "50vw", minHeight: "100vh", backgroundColor: "#f3f2ee", borderLeft: "1px solid #d8d6d0", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, padding: "32px 36px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: "400px" }}>
              <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#1E4D5A", marginBottom: "10px", fontFamily: "'Courier New', Courier, monospace" }}>
                Gift Cards
              </p>
              <h1 style={{ fontSize: "28px", color: "#1E4D5A", fontWeight: 400, fontFamily: "'Courier New', Courier, monospace", lineHeight: "1.3", marginBottom: "14px" }}>
                Good wine makes a good gift.
              </h1>
              <p style={{ fontSize: "14px", color: "#0A242C", fontWeight: 400, fontFamily: "'Courier New', Courier, monospace", lineHeight: "1.7", marginBottom: "20px", letterSpacing: "-0.02em" }}>
                A Bodega gift card is redeemable in person for drinks, boards, and anything else on the menu. No expiry, no small print, just good taste.
              </p>
              <p style={{ fontSize: "14px", color: "#0A242C", fontWeight: 400, fontFamily: "'Courier New', Courier, monospace", lineHeight: "1.7", marginBottom: "32px", letterSpacing: "-0.02em" }}>
                Choose your amount and buy securely below.
              </p>
              <a
                href={GIFT_CARD_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-block", padding: "10px 24px", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", borderRadius: "0px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", textDecoration: "none", transition: "background-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0A242C"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1E4D5A"}
              >
                Buy a gift card →
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden flex flex-col" style={{ backgroundColor: "#f3f2ee" }}>
        <div style={{ position: "relative", width: "100%", height: "50vh", flexShrink: 0 }}>
          <img
            src="/images/cellar-club.webp"
            alt="Gift cards at Bodega, Stockport"
            width="1600"
            height="2000"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <div style={{ padding: "32px 24px" }}>
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#1E4D5A", marginBottom: "10px", fontFamily: "'Courier New', Courier, monospace" }}>
            Gift Cards
          </p>
          <h1 style={{ fontSize: "22px", color: "#1E4D5A", fontWeight: 400, fontFamily: "'Courier New', Courier, monospace", lineHeight: "1.3", marginBottom: "12px" }}>
            Good wine makes a good gift.
          </h1>
          <p style={{ fontSize: "13px", color: "#0A242C", fontWeight: 400, fontFamily: "'Courier New', Courier, monospace", lineHeight: "1.7", marginBottom: "16px", letterSpacing: "-0.02em" }}>
            A Bodega gift card is redeemable in person for drinks, boards, and anything else on the menu. No expiry, no small print, just good taste.
          </p>
          <p style={{ fontSize: "13px", color: "#0A242C", fontWeight: 400, fontFamily: "'Courier New', Courier, monospace", lineHeight: "1.7", marginBottom: "24px", letterSpacing: "-0.02em" }}>
            Choose your amount and buy securely below.
          </p>
          <a
            href={GIFT_CARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-block", padding: "10px 24px", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", borderRadius: "0px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", textDecoration: "none" }}
          >
            Buy a gift card →
          </a>
        </div>
      </div>
    </>
  );
}
