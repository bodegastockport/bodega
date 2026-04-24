import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const inputStyle = {
  backgroundColor: "#f3f2ee",
  border: "1px solid #d8d6d0",
  borderRadius: "4px",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "13px",
  padding: "7px 10px",
  color: "#2e282a",
  width: "100%",
  outline: "none",
  transition: "border-color 0.15s",
};

const labelStyle = {
  display: "block",
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#777777",
  marginBottom: "3px",
  fontFamily: "'Courier New', Courier, monospace",
};

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [focused, setFocused] = useState(null);

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
    if (err) {
      setError("Something went wrong. Please try again.");
      return;
    }
    setSent(true);
  };

  const getInputStyle = (field) => ({
    ...inputStyle,
    borderColor: focused === field ? "#193c47" : "#d8d6d0"
  });

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace" }}>
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#777777" }}>Get in touch</p>
            <h1 className="text-xl mb-4" style={{ color: "#193c47", fontWeight: 400 }}>Contact us</h1>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>Address</p>
                <p className="text-sm" style={{ color: "#2e282a" }}>Bodega Wine Bar<br />Stockport, Manchester</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>Email</p>
                <a href="mailto:hello@bodegawine.co.uk" className="text-sm" style={{ color: "#193c47" }}>hello@bodegawine.co.uk</a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>Opening hours</p>
                <div className="text-sm space-y-0.5" style={{ color: "#2e282a" }}>
                  <p>Monday — Closed</p>
                  <p>Tuesday – Sunday: 2pm – 9pm</p>
                </div>
              </div>
            </div>
            <div style={{ border: "1px solid #d8d6d0", borderRadius: "4px", overflow: "hidden", aspectRatio: "4/3" }}>
              <iframe
                title="Bodega Wine Bar Location"
                width="100%"
                height="100%"
                style={{ border: 0, display: "block", filter: "grayscale(100%)" }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2378.3413092342607!2d-2.1689382230294676!3d53.408721870054286!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487bb379f80925f5%3A0xc246e163d889de2c!2sWear%20Mill%2C%20Chestergate%2C%20Stockport%20SK3%200AG!5e0!3m2!1sen!2suk!4v1777044758773!5m2!1sen!2suk"
              />
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#777777" }}>Message</p>
            <h2 className="text-xl mb-1" style={{ color: "#193c47", fontWeight: 400 }}>Send a message</h2>
            <p className="text-xs mb-4" style={{ color: "#777777" }}>We aim to respond within one business day.</p>

            {sent ? (
              <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "4px", padding: "24px" }}>
                <p className="text-sm mb-1" style={{ color: "#2e282a" }}>Message sent</p>
                <p className="text-sm mb-4" style={{ color: "#777777" }}>Thanks, {form.name}. We'll be in touch soon.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", message: "" }); }}
                  style={{ padding: "7px 16px", backgroundColor: "transparent", color: "#193c47", border: "1px solid #193c47", borderRadius: "4px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label style={labelStyle}>Your name</label>
                  <input style={getInputStyle("name")} placeholder="Full name" value={form.name} onChange={(e) => update("name", e.target.value)} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" style={getInputStyle("email")} placeholder="your@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} />
                </div>
                <div>
                  <label style={labelStyle}>Message</label>
                  <textarea style={{ ...getInputStyle("message"), minHeight: "100px", resize: "none" }} placeholder="How can we help?" value={form.message} onChange={(e) => update("message", e.target.value)} onFocus={() => setFocused("message")} onBlur={() => setFocused(null)} />
                </div>
                {error && <p style={{ fontSize: "12px", color: "#c0392b" }}>{error}</p>}
                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  style={{
                    padding: "8px 20px",
                    backgroundColor: "#193c47",
                    color: "#f3f2ee",
                    border: "none",
                    borderRadius: "4px",
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: isValid && !submitting ? "pointer" : "not-allowed",
                    opacity: !isValid || submitting ? 0.6 : 1,
                    transition: "background-color 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...</> : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}