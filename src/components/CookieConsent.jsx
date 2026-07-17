import { useState, useEffect } from "react";

const CONSENT_KEY = "bodega_cookie_consent";

const GA4_ID = "G-M85D4YVWSZ";
const META_PIXEL_ID = "0000000000000000";

const loadGA4 = () => {
  if (document.getElementById("ga4-script")) return;

  const script = document.createElement("script");
  script.id = "ga4-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA4_ID);
};

const loadMetaPixel = () => {
  if (window.fbq) return;

  const script = document.createElement("script");
  script.id = "meta-pixel-script";
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window,document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${META_PIXEL_ID}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
};

const applyConsent = (value) => {
  if (value === "accepted") {
    loadGA4();
    loadMetaPixel();
  }
};

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);

    if (stored) {
      applyConsent(stored);
    } else {
      setVisible(true);
    }

    const handleReopen = () => setVisible(true);
    window.addEventListener("bodega-open-cookie-settings", handleReopen);
    return () => window.removeEventListener("bodega-open-cookie-settings", handleReopen);
  }, []);

  const handleChoice = (value) => {
    localStorage.setItem(CONSENT_KEY, value);
    applyConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: "#0A242C",
        borderTop: "1px solid #1E4D5A",
        fontFamily: "'Courier New', Courier, monospace",
      }}
    >
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 24px" }}
      >
        <p className="text-xs leading-relaxed" style={{ color: "#f3f2ee", margin: 0 }}>
          We use cookies for analytics and marketing to help us understand how the site is used. You can accept or reject these at any time.{" "}
          <a href="/privacy" style={{ color: "#f3f2ee", textDecoration: "underline" }}>
            Read our Privacy Policy
          </a>.
        </p>
        <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
          <button
            onClick={() => handleChoice("rejected")}
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              backgroundColor: "transparent",
              color: "#f3f2ee",
              border: "1px solid rgba(243,242,238,0.45)",
              padding: "9px 18px",
              cursor: "pointer",
            }}
          >
            Reject All
          </button>
          <button
            onClick={() => handleChoice("accepted")}
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              backgroundColor: "#1E4D5A",
              color: "#f3f2ee",
              border: "none",
              padding: "9px 18px",
              cursor: "pointer",
            }}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}