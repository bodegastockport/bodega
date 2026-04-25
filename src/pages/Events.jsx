import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

const inputStyle = {
  backgroundColor: "#f3f2ee",
  border: "1px solid #d8d6d0",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "12px",
  padding: "7px 10px",
  color: "#2e282a",
  width: "100%",
  outline: "none",
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

const EVENT_TYPES = [
  { title: "Small group bookings", desc: "Got a group of 8 or more? Reserved areas, pre-selected sharing boards and tailored wine pairings." },
  { title: "Full venue hire", desc: "Take over the whole of Bodega. Corporate entertaining, launches, celebrations. Capacity up to 60 guests." },
  { title: "Tastings & wine nights", desc: "Curated tasting evenings led by our sommelier — or a private tasting for your group." },
];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", event_type: "", date: "", guests: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [focused, setFocused] = useState(null);

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

  const getInputStyle = (field) => ({
    ...inputStyle,
    borderColor: focused === field ? "#193c47" : "#d8d6d0",
  });

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: "calc(100vh - 56px)" }}>

        {/* Left — copy + bullets + form */}
        <div className="flex flex-col px-8 py-8" style={{ borderRight: "1px solid #d8d6d0" }}>

          {/* Header */}
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>Private events</p>
          <h1 className="text-2xl mb-3" style={{ color: "#193c47", fontWeight: 400 }}>Events & private hire</h1>
          <p className="text-xs leading-relaxed mb-6" style={{ color: "#777777" }}>
            From intimate tastings to full venue hire, Bodega is the perfect backdrop for memorable occasions.
          </p>

          {/* Bullets — no border lines, teal headings */}
          <div className="space-y-4 mb-8">
            {EVENT_TYPES.map(({ title, desc }) => (
              <div key={title}>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#193c47" }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "#777777" }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #d8d6d0", marginBottom: "24px" }} />

          {/* Enquiry form */}
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>Enquiries</p>
          <h2 className="text-lg mb-1" style={{ color: "#193c47", fontWeight: 400 }}>Make an enquiry</h2>
          <p className="text-xs mb-4" style={{ color: "#777777" }}>Tell us about your event and we'll get back to you within 24 hours.</p>

          {sent ? (
            <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "24px" }}>
              <p className="text-sm mb-1" style={{ color: "#2e282a" }}>Enquiry received</p>
              <p className="text-xs mb-4" style={{ color: "#777777" }}>Thanks, {form.name}. We'll be in touch very soon.</p>
              <button
                onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", event_type: "", date: "", guests: "", message: "" }); }}
                style={{ padding: "7px 16px", backgroundColor: "transparent", color: "#193c47", border: "1px solid #193c47", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
              >
                Send another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Your name</label>
                  <input style={getInputStyle("name")} placeholder="Full name" value={form.name} onChange={e => update("name", e.target.value)} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" style={getInputStyle("email")} placeholder="your@email.com" value={form.email} onChange={e => update("email", e.target.value)} onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={getInputStyle("phone")} placeholder="Optional" value={form.phone} onChange={e => update("phone", e.target.value)} onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)} />
                </div>
                <div>
                  <label style={labelStyle}>Event type</label>
                  <Select value={form.event_type} onValueChange={v => update("event_type", v)}>
                    <SelectTrigger style={{ ...getInputStyle("event_type"), height: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Small Group Booking">Small group booking</SelectItem>
                      <SelectItem value="Full Venue Hire">Full venue hire</SelectItem>
                      <SelectItem value="Private Tasting">Private tasting</SelectItem>
                      <SelectItem value="Wine Night">Wine night</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label style={labelStyle}>Preferred date</label>
                  <input type="date" style={getInputStyle("date")} value={form.date} onChange={e => update("date", e.target.value)} onFocus={() => setFocused("date")} onBlur={() => setFocused(null)} />
                </div>
                <div>
                  <label style={labelStyle}>Approx. guests</label>
                  <input type="number" min="1" style={getInputStyle("guests")} placeholder="Number" value={form.guests} onChange={e => update("guests", e.target.value)} onFocus={() => setFocused("guests")} onBlur={() => setFocused(null)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Tell us more</label>
                <textarea style={{ ...getInputStyle("message"), minHeight: "80px", resize: "none" }} placeholder="Any specific requirements, ideas or questions..." value={form.message} onChange={e => update("message", e.target.value)} onFocus={() => setFocused("message")} onBlur={() => setFocused(null)} />
              </div>
              {error && <p style={{ fontSize: "12px", color: "#c0392b" }}>{error}</p>}
              <button
                type="submit"
                disabled={!isValid || submitting}
                style={{ padding: "8px 20px", backgroundColor: "#193c47", color: "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: isValid && !submitting ? "pointer" : "not-allowed", opacity: !isValid || submitting ? 0.6 : 1, display: "flex", alignItems: "center", gap: "6px" }}
              >
                {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...</> : "Send enquiry"}
              </button>
            </form>
          )}
        </div>

        {/* Right — 2-column events grid */}
        <div className="px-8 py-8">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>Upcoming</p>
          <h2 className="text-2xl mb-6" style={{ color: "#193c47", fontWeight: 400 }}>Events at Bodega</h2>

          {events.length === 0 ? (
            <p className="text-xs" style={{ color: "#777777" }}>No upcoming events at the moment. Check back soon.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {events.map((event) => (
                <div key={event.id} style={{ overflow: "hidden", borderBottom: "1px solid #d8d6d0", paddingBottom: "16px" }}>
                  {event.image_url && (
                    <div style={{ aspectRatio: "3 / 2", overflow: "hidden", marginBottom: "12px" }}>
                      <img
                        src={event.image_url}
                        alt={event.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </div>
                  )}
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>
                    {new Date(event.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <p className="text-sm mb-1" style={{ color: "#193c47", fontWeight: 400 }}>{event.title}</p>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: "#777777" }}>{event.description}</p>
                  <button
                    onClick={() => {
                      update("event_type", "Other");
                      update("message", `I'd like to book a place at: ${event.title} (${new Date(event.date).toLocaleDateString("en-GB")})`);
                    }}
                    style={{ fontSize: "11px", color: "#193c47", textTransform: "uppercase", letterSpacing: "0.08em", background: "none", border: "none", cursor: "pointer", fontFamily: "'Courier New', Courier, monospace", padding: 0, borderBottom: "1px solid #193c47", paddingBottom: "1px" }}
                  >
                    Book a place →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}