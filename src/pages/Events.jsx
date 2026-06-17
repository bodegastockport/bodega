import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import SEO from "../components/SEO";

const schema = {
  "@context": "https://schema.org",
  "@type": "EventVenue",
  "name": "Bodega Wine Vault",
  "description": "Private hire venue in Stockport for wine tastings, celebrations and corporate events. Full venue hire up to 70 guests.",
  "url": "https://bodegawine.co.uk/events",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Engine Room, Weir Mill",
    "addressLocality": "Stockport",
    "postalCode": "SK3 0AG",
    "addressCountry": "GB"
  },
  "maximumAttendeeCapacity": 70
}

const getOptimisedImageUrl = (url, width = 400, quality = 75) => {
  if (!url) return "";
  if (url.includes("/render/image/public/")) {
    const [base] = url.split("?");
    return `${base}?width=${width}&quality=${quality}`;
  }
  if (url.includes("/object/public/")) {
    return `${url.replace("/object/public/", "/render/image/public/")}?width=${width}&quality=${quality}`;
  }
  return url;
};

const useOriginalIfOptimisedFails = (event, originalUrl) => {
  if (!originalUrl) return;
  const image = event.currentTarget;
  if (image.src !== originalUrl) {
    image.src = originalUrl;
  }
};

const inputStyle = {
  backgroundColor: "#f3f2ee",
  border: "1px solid #d8d6d0",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "12px",
  padding: "7px 10px",
  color: "#0A242C",
  width: "100%",
  outline: "none",
};

const labelStyle = {
  display: "block",
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#0A242C",
  marginBottom: "3px",
  fontFamily: "'Courier New', Courier, monospace",
};

const EVENT_TYPES = [
  { title: "Full venue hire", desc: "Take over the whole of Bodega, from parties to celebrations. 70 capacity." },
  { title: "Private tasting", desc: "Join one of our tastings, or book a private one for your group." },
];

const PER_PAGE = 9;

export default function Events() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", event_type: "", date: "", guests: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [focused, setFocused] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const loadEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("published", true)
        .order("date", { ascending: true });
      setEvents(data || []);
    };
    loadEvents();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const isValid = form.name && form.email && form.event_type && form.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    const { error: err } = await supabase
      .from("hire_enquiries")
      .insert({ ...form, status: "new" });
    setSubmitting(false);
    if (err) { setError("Something went wrong. Please try again."); return; }
    setSent(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    if (sent) {
      setSent(false);
      setForm({ name: "", email: "", phone: "", event_type: "", date: "", guests: "", message: "" });
    }
    setError(null);
  };

  const getInputStyle = (field) => ({
    ...inputStyle,
    borderColor: focused === field ? "#1E4D5A" : "#d8d6d0",
  });

  const totalPages = Math.ceil(events.length / PER_PAGE);
  const visibleEvents = events.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  const handlePrev = () => setPage((p) => Math.max(0, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <>
      <SEO
        title="What's On — Events & Private Hire | Bodega Stockport"
        description="Upcoming events, wine tastings and private hire at Bodega, Stockport. Full venue hire for up to 70 guests. Book a private tasting for your group."
        canonical="/events"
        schema={schema}
      />
      <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: "calc(100vh - 56px)" }}>

          <div className="flex flex-col" style={{ borderRight: "1px solid #d8d6d0", padding: "32px" }}>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#0A242C" }}>Upcoming</p>
            <h1 className="text-2xl mb-6" style={{ color: "#1E4D5A", fontWeight: 400 }}>What's On</h1>

            {events.length === 0 ? (
              <p className="text-xs" style={{ color: "#0A242C" }}>No upcoming events at the moment. Check back soon.</p>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                  {visibleEvents.map((event) => (
                    <div key={event.id} style={{ borderBottom: "1px solid #d8d6d0", paddingBottom: "16px" }}>
                      {event.image_url && (
                        <div style={{ aspectRatio: "4 / 5", overflow: "hidden", marginBottom: "12px" }}>
                          <img
                            src={getOptimisedImageUrl(event.image_url, 400, 75)}
                            alt={event.title}
                            width="400"
                            height="500"
                            loading="lazy"
                            decoding="async"
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            onError={(eventObject) => useOriginalIfOptimisedFails(eventObject, event.image_url)}
                          />
                        </div>
                      )}
                      <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px", color: "#0A242C" }}>
                        {new Date(event.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      {(event.time || event.price) && (
                        <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px", color: "#777777" }}>
                          {event.time && <span>{event.time}</span>}
                          {event.time && event.price && <span> · </span>}
                          {event.price && <span>{event.price}</span>}
                        </p>
                      )}
                      <p style={{ fontSize: "12px", marginBottom: "4px", color: "#1E4D5A", fontWeight: 400 }}>{event.title}</p>
                      <p style={{ fontSize: "11px", lineHeight: "1.5", marginBottom: "10px", color: "#0A242C" }}>{event.description}</p>
                      <button
                        style={{ fontSize: "10px", color: "#1E4D5A", textTransform: "uppercase", letterSpacing: "0.08em", background: "none", border: "none", cursor: "pointer", fontFamily: "'Courier New', Courier, monospace", padding: 0, borderBottom: "1px solid #1E4D5A", paddingBottom: "1px" }}
                      >
                        Book a place →
                      </button>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "32px" }}>
                    <button
                      onClick={handlePrev}
                      disabled={page === 0}
                      style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", background: "none", border: "none", cursor: page === 0 ? "default" : "pointer", fontFamily: "'Courier New', Courier, monospace", color: "#1E4D5A", opacity: page === 0 ? 0.3 : 1, padding: 0 }}
                    >
                      ← Prev
                    </button>
                    <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#0A242C" }}>
                      {page + 1} / {totalPages}
                    </p>
                    <button
                      onClick={handleNext}
                      disabled={page === totalPages - 1}
                      style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", background: "none", border: "none", cursor: page === totalPages - 1 ? "default" : "pointer", fontFamily: "'Courier New', Courier, monospace", color: "#1E4D5A", opacity: page === totalPages - 1 ? 0.3 : 1, padding: 0 }}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="hidden lg:flex items-center justify-center" style={{ padding: "10%" }}>
            <div style={{ maxWidth: "340px", width: "100%" }}>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#0A242C" }}>Private events</p>
              <h2 className="text-2xl mb-4" style={{ color: "#1E4D5A", fontWeight: 400 }}>Events & private hire</h2>
              <p className="text-xs leading-relaxed mb-8" style={{ color: "#0A242C" }}>
                From intimate tastings to full venue hire, Bodega is the perfect backdrop for memorable occasions.
              </p>

              <div className="space-y-6 mb-10">
                {EVENT_TYPES.map(({ title, desc }) => (
                  <div key={title}>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#1E4D5A" }}>{title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "#0A242C" }}>{desc}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setModalOpen(true)}
                style={{ padding: "10px 24px", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
              >
                Make a private hire enquiry
              </button>
            </div>
          </div>

          <div className="flex lg:hidden flex-col px-8 py-8" style={{ borderTop: "1px solid #d8d6d0" }}>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#0A242C" }}>Private events</p>
            <h2 className="text-2xl mb-4" style={{ color: "#1E4D5A", fontWeight: 400 }}>Events & private hire</h2>
            <p className="text-xs leading-relaxed mb-6" style={{ color: "#0A242C" }}>
              From intimate tastings to full venue hire, Bodega is the perfect backdrop for memorable occasions.
            </p>
            <div className="space-y-4 mb-8">
              {EVENT_TYPES.map(({ title, desc }) => (
                <div key={title}>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#1E4D5A" }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#0A242C" }}>{desc}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setModalOpen(true)}
              style={{ padding: "10px 24px", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", alignSelf: "flex-start" }}
            >
              Make a private hire enquiry
            </button>
          </div>
        </div>

        {modalOpen && (
          <div
            style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(10, 36, 44, 0.6)" }}
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          >
            <div style={{ backgroundColor: "#1E4D5A", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", margin: "16px", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "28px 28px 0 28px" }}>
                <div>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#f3f2ee", opacity: 0.6 }}>Private events</p>
                  <h2 className="text-xl" style={{ color: "#f3f2ee", fontWeight: 400 }}>Private hire enquiry</h2>
                </div>
                <button
                  onClick={handleClose}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#f3f2ee", opacity: 0.7, padding: "4px", marginTop: "2px" }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: "20px 28px 28px 28px" }}>
                {sent ? (
                  <div>
                    <p className="text-sm mb-2" style={{ color: "#f3f2ee" }}>Enquiry received</p>
                    <p className="text-xs mb-6" style={{ color: "#f3f2ee", opacity: 0.8 }}>Thanks, {form.name}. We'll be in touch very soon.</p>
                    <button
                      onClick={handleClose}
                      style={{ padding: "8px 20px", backgroundColor: "transparent", color: "#f3f2ee", border: "1px solid rgba(243,242,238,0.4)", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <p className="text-xs mb-4" style={{ color: "#f3f2ee", opacity: 0.75 }}>Tell us what you've got in mind and we'll get back to you.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label style={{ ...labelStyle, color: "#f3f2ee", opacity: 0.7 }}>Your name</label>
                        <input
                          style={{ ...getInputStyle("name"), backgroundColor: "rgba(243,242,238,0.1)", borderColor: focused === "name" ? "#f3f2ee" : "rgba(243,242,238,0.25)", color: "#f3f2ee" }}
                          placeholder="Full name"
                          value={form.name}
                          onChange={e => update("name", e.target.value)}
                          onFocus={() => setFocused("name")}
                          onBlur={() => setFocused(null)}
                        />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, color: "#f3f2ee", opacity: 0.7 }}>Email</label>
                        <input
                          type="email"
                          style={{ ...getInputStyle("email"), backgroundColor: "rgba(243,242,238,0.1)", borderColor: focused === "email" ? "#f3f2ee" : "rgba(243,242,238,0.25)", color: "#f3f2ee" }}
                          placeholder="your@email.com"
                          value={form.email}
                          onChange={e => update("email", e.target.value)}
                          onFocus={() => setFocused("email")}
                          onBlur={() => setFocused(null)}
                        />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, color: "#f3f2ee", opacity: 0.7 }}>Phone</label>
                        <input
                          style={{ ...getInputStyle("phone"), backgroundColor: "rgba(243,242,238,0.1)", borderColor: focused === "phone" ? "#f3f2ee" : "rgba(243,242,238,0.25)", color: "#f3f2ee" }}
                          placeholder="Optional"
                          value={form.phone}
                          onChange={e => update("phone", e.target.value)}
                          onFocus={() => setFocused("phone")}
                          onBlur={() => setFocused(null)}
                        />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, color: "#f3f2ee", opacity: 0.7 }}>Event type</label>
                        <Select value={form.event_type} onValueChange={v => update("event_type", v)}>
                          <SelectTrigger style={{ ...getInputStyle("event_type"), backgroundColor: "rgba(243,242,238,0.1)", borderColor: "rgba(243,242,238,0.25)", color: "#f3f2ee", height: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full Venue Hire">Full venue hire</SelectItem>
                            <SelectItem value="Private Tasting">Private tasting</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label style={{ ...labelStyle, color: "#f3f2ee", opacity: 0.7 }}>Preferred date</label>
                        <input
                          type="date"
                          style={{ ...getInputStyle("date"), backgroundColor: "rgba(243,242,238,0.1)", borderColor: focused === "date" ? "#f3f2ee" : "rgba(243,242,238,0.25)", color: "#f3f2ee" }}
                          value={form.date}
                          onChange={e => update("date", e.target.value)}
                          onFocus={() => setFocused("date")}
                          onBlur={() => setFocused(null)}
                        />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, color: "#f3f2ee", opacity: 0.7 }}>Approx. guests</label>
                        <input
                          type="number"
                          min="1"
                          style={{ ...getInputStyle("guests"), backgroundColor: "rgba(243,242,238,0.1)", borderColor: focused === "guests" ? "#f3f2ee" : "rgba(243,242,238,0.25)", color: "#f3f2ee" }}
                          placeholder="Number"
                          value={form.guests}
                          onChange={e => update("guests", e.target.value)}
                          onFocus={() => setFocused("guests")}
                          onBlur={() => setFocused(null)}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ ...labelStyle, color: "#f3f2ee", opacity: 0.7 }}>Tell us more</label>
                      <textarea
                        style={{ ...getInputStyle("message"), backgroundColor: "rgba(243,242,238,0.1)", borderColor: focused === "message" ? "#f3f2ee" : "rgba(243,242,238,0.25)", color: "#f3f2ee", minHeight: "80px", resize: "none" }}
                        placeholder="Any specific requirements, ideas or questions..."
                        value={form.message}
                        onChange={e => update("message", e.target.value)}
                        onFocus={() => setFocused("message")}
                        onBlur={() => setFocused(null)}
                      />
                    </div>
                    {error && <p style={{ fontSize: "12px", color: "#f3f2ee", opacity: 0.8 }}>{error}</p>}
                    <button
                      type="submit"
                      disabled={!isValid || submitting}
                      style={{ padding: "8px 20px", backgroundColor: "#f3f2ee", color: "#1E4D5A", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: isValid && !submitting ? "pointer" : "not-allowed", opacity: !isValid || submitting ? 0.5 : 1, display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...</> : "Send enquiry"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}