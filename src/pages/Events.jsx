import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const EVENT_TYPES = [
  { title: "Small group bookings", desc: "Got a group of 8 or more? Reserved areas, pre-selected sharing boards and tailored wine pairings." },
  { title: "Full venue hire", desc: "Take over the whole of Bodega. Corporate entertaining, launches, celebrations. Capacity up to 60 guests." },
  { title: "Tastings & wine nights", desc: "Curated tasting evenings led by our sommelier — or a private tasting for your group." },
];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [bookingEvent, setBookingEvent] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", event_type: "", date: "", guests: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
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

    await supabase.from("hire_enquiries").insert({ ...form, status: "new" });

    setSubmitting(false);
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
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#777777" }}>Private events</p>
            <h1 className="text-xl mb-3" style={{ color: "#193c47", fontWeight: 400 }}>Events & private hire</h1>
            <p className="text-xs leading-relaxed mb-5" style={{ color: "#777777" }}>
              From intimate tastings to full venue hire, Bodega is the perfect backdrop for memorable occasions.
            </p>
            <div className="space-y-4">
              {EVENT_TYPES.map(({ title, desc }) => (
                <div key={title} style={{ borderLeft: "2px solid #193c47", paddingLeft: "12px" }}>
                  <p className="text-xs mb-0.5" style={{ color: "#2e282a" }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#777777" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="enquiry-form">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#777777" }}>Enquiries</p>
            <h2 className="text-xl mb-1" style={{ color: "#193c47", fontWeight: 400 }}>Make an enquiry</h2>
            <p className="text-xs mb-4" style={{ color: "#777777" }}>Tell us about your event and we'll get back to you within 24 hours.</p>

            {sent ? (
              <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "4px", padding: "24px" }}>
                <p className="text-sm mb-1" style={{ color: "#2e282a" }}>Enquiry received</p>
                <p className="text-xs mb-4" style={{ color: "#777777" }}>Thanks, {form.name}. We'll be in touch very soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input style={getInputStyle("name")} value={form.name} onChange={(e) => update("name", e.target.value)} />
                  <input style={getInputStyle("email")} value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>
              </form>
            )}
          </div>
        </div>

        {events.length > 0 && (
          <div className="mt-12">
            <div style={{ borderTop: "1px solid #d8d6d0", paddingTop: "32px" }}>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#777777" }}>Upcoming</p>
              <h2 className="text-xl mb-6" style={{ color: "#193c47", fontWeight: 400 }}>Events at Bodega</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {events.map((event) => (
                  <div key={event.id} style={{ border: "1px solid #d8d6d0", borderRadius: "4px", overflow: "hidden", backgroundColor: "#eceae4" }}>
                    {event.image_url && (
                      <div style={{ height: "180px", overflow: "hidden" }}>
                        <img src={event.image_url} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}

                    <div style={{ padding: "16px" }}>
                      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>
                        {new Date(event.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </p>

                      <p className="text-sm mb-2" style={{ color: "#193c47", fontWeight: 400 }}>
                        {event.title}
                      </p>

                      <p className="text-xs leading-relaxed mb-4" style={{ color: "#777777" }}>
                        {event.description}
                      </p>

                      <button
                        onClick={() => {
                          setBookingEvent(event);
                          update("event_type", "Other");
                          update("message", `I'd like to book a place at: ${event.title} (${new Date(event.date).toLocaleDateString("en-GB")})`);
                          document.getElementById("enquiry-form")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        style={{
                          padding: "7px 16px",
                          backgroundColor: "#193c47",
                          color: "#f3f2ee",
                          border: "none",
                          borderRadius: "4px",
                          fontFamily: "'Courier New', Courier, monospace",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          cursor: "pointer"
                        }}
                      >
                        Book a place →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}