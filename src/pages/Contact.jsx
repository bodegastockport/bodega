import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import SEO from "../components/SEO";

const schema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Bodega — Wine Bar, Weir Mill, Stockport",
  "url": "https://bodegawine.co.uk/contact",
  "mainEntity": {
    "@type": "LocalBusiness",
    "name": "Bodega Wine Vault",
    "telephone": "01618260168",
    "email": "hello@bodegawine.co.uk",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Unit 12, Weir Mill, 3 Woodhead Lane",
      "addressLocality": "Stockport",
      "postalCode": "SK3 0GR",
      "addressCountry": "GB"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "14:00",
        "closes": "23:59"
      }
    ]
  }
}

const overlayInput = {
  backgroundColor: "rgba(243,242,238,0.12)",
  border: "1px solid rgba(243,242,238,0.25)",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "12px",
  padding: "7px 10px",
  color: "#f3f2ee",
  width: "100%",
  outline: "none",
};

const overlayLabel = {
  display: "block",
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "rgba(243,242,238,0.55)",
  marginBottom: "3px",
  fontFamily: "'Courier New', Courier, monospace",
};

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const isValid = form.name && form.email && form.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setError(null);

    const { error: err } = await supabase
      .from("contact_submissions")
      .insert({ ...form, status: "new" });

    setSubmitting(false);
    if (err) { setError("Something went wrong. Please try again."); return; }
    setSent(true);
  };

  return (
    <>
      <SEO
        title="Contact Bodega — Wine Bar, Weir Mill, Stockport"
        description="Get in touch with Bodega. Find us at Unit 12, Weir Mill, Stockport, SK3 0GR. Open Tuesday to Sunday from 2pm."
        canonical="/contact"
        schema={schema}
      />
      <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: "calc(100vh - 56px)" }}>

          <div className="flex flex-col justify-center items-center" style={{ borderRight: "1px solid #d8d6d0" }}>
            <div style={{ width: "100%", maxWidth: "520px", padding: "48px 64px" }}>

              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#0A242C" }}>Get in touch</p>
              <h1 className="text-2xl mb-6" style={{ color: "#1E4D5A", fontWeight: 400 }}>Contact us</h1>

              <div className="space-y-5 mb-8">
                <div>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#0A242C" }}>Address</p>
                  <p className="text-sm" style={{ color: "#0A242C" }}>Unit 12, Weir Mill<br />3 Woodhead Lane<br />Stockport, SK3 0GR</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#0A242C" }}>Telephone</p>
                  <p className="text-sm" style={{ color: "#0A242C" }}>0161 826 0168</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#0A242C" }}>Email</p>
                  <a href="mailto:hello@bodegawine.co.uk" className="text-sm" style={{ color: "#1E4D5A", textDecoration: "none" }}>hello@bodegawine.co.uk</a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#0A242C" }}>Opening hours</p>
                  <div className="text-sm space-y-0.5" style={{ color: "#0A242C" }}>
                    <p>Monday — Closed</p>
                    <p>Tuesday – Sunday — 2pm to late</p>
                  </div>
                </div>
              </div>

              <div style={{ overflow: "hidden", aspectRatio: "4 / 3" }}>
                <iframe
                  title="Bodega Wine Bar Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: "block", filter: "grayscale(100%)" }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d151927.59308463306!2d-2.3701670120673004!3d53.48867683235631!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487bb389eaee63c3%3A0x13328c94a4e9b595!2sBodega%20Wine!5e0!3m2!1sen!2suk!4v1778341405304!5m2!1sen!2suk"
                />
              </div>

            </div>
          </div>

          <div className="flex flex-col justify-center items-center" style={{ backgroundColor: "#1E4D5A", minHeight: "50vh" }}>
            <div style={{ width: "100%", maxWidth: "360px", padding: "48px 36px" }}>

              {sent ? (
                <div>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(243,242,238,0.6)" }}>Message sent</p>
                  <h2 className="text-xl mb-2" style={{ color: "#f3f2ee", fontWeight: 400 }}>Thanks, {form.name.split(" ")[0]}.</h2>
                  <p className="text-xs leading-relaxed mb-6" style={{ color: "rgba(243,242,238,0.7)" }}>
                    We'll be in touch within one business day.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: "", email: "", message: "" }); }}
                    style={{ fontSize: "11px", color: "rgba(243,242,238,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", background: "none", border: "none", cursor: "pointer", fontFamily: "'Courier New', Courier, monospace", padding: 0, borderBottom: "1px solid rgba(243,242,238,0.3)", paddingBottom: "1px" }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(243,242,238,0.6)" }}>Message</p>
                  <h2 className="text-xl mb-1" style={{ color: "#f3f2ee", fontWeight: 400 }}>Send a message</h2>
                  <p className="text-xs mb-6" style={{ color: "rgba(243,242,238,0.6)" }}>We aim to respond within one business day.</p>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label style={overlayLabel}>Your name</label>
                      <input style={overlayInput} placeholder="Full name" value={form.name} onChange={e => update("name", e.target.value)} />
                    </div>
                    <div>
                      <label style={overlayLabel}>Email</label>
                      <input type="email" style={overlayInput} placeholder="your@email.com" value={form.email} onChange={e => update("email", e.target.value)} />
                    </div>
                    <div>
                      <label style={overlayLabel}>Message</label>
                      <textarea style={{ ...overlayInput, minHeight: "100px", resize: "none" }} placeholder="How can we help?" value={form.message} onChange={e => update("message", e.target.value)} />
                    </div>
                    {error && <p style={{ fontSize: "12px", color: "#e88" }}>{error}</p>}
                    <button
                      type="submit"
                      disabled={!isValid || submitting}
                      style={{
                        padding: "8px 20px",
                        backgroundColor: "#f3f2ee",
                        color: "#1E4D5A",
                        border: "none",
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        cursor: isValid && !submitting ? "pointer" : "not-allowed",
                        opacity: !isValid || submitting ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        width: "100%",
                        justifyContent: "center",
                      }}
                    >
                      {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...</> : "Send message"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}