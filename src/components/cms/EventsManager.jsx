import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Pencil, Trash2, Upload, X, ChevronDown, ChevronUp, Mail, Phone, Users } from "lucide-react";
import { format, parseISO, isAfter, startOfDay } from "date-fns";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const inputStyle = { backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "13px", padding: "9px 12px", color: "#2e282a", width: "100%", outline: "none", transition: "border-color 0.15s" };
const labelStyle = { display: "block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#777777", marginBottom: "5px", fontFamily: "'Courier New', Courier, monospace" };
const BLANK = { title: "", date: "", time: "", price_per_person: "", capacity: "", description: "", image_url: "", published: true };

export default function EventsManager() {
  const [events, setEvents] = useState([]);
  const [bookingCounts, setBookingCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [expandedEventId, setExpandedEventId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [reschedulingId, setReschedulingId] = useState(null);

  const load = async () => {
    const { data } = await supabase
      .from('events')
      .select()
      .order('date', { ascending: false });
    setEvents(data || []);

    const allIds = (data || []).map((e) => e.id);
    if (allIds.length > 0) {
      const { data: bookingsData } = await supabase
        .from('event_bookings')
        .select('event_id, party_size')
        .in('event_id', allIds)
        .eq('status', 'confirmed');

      const counts = {};
      (bookingsData || []).forEach((b) => {
        counts[b.event_id] = (counts[b.event_id] || 0) + (b.party_size || 0);
      });
      setBookingCounts(counts);
    } else {
      setBookingCounts({});
    }

    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(BLANK); setEditing("new"); };
  const openEdit = (ev) => {
    setForm({
      title: ev.title,
      date: ev.date,
      time: ev.time || "",
      price_per_person: ev.price_per_person ? (ev.price_per_person / 100).toFixed(2) : "",
      capacity: ev.capacity || "",
      description: ev.description,
      image_url: ev.image_url || "",
      published: ev.published ?? true,
    });
    setEditing(ev);
  };
  const close = () => setEditing(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const ext = file.name.split('.').pop();
    const path = `events/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from('gallery').upload(path, file, { upsert: true });
    if (error) { toast.error("Upload failed"); setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);
    setForm((p) => ({ ...p, image_url: publicUrl }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.date || !form.description) return;
    setSaving(true);

    const payload = {
      title: form.title,
      date: form.date,
      time: form.time,
      description: form.description,
      image_url: form.image_url,
      published: form.published,
      price_per_person: form.price_per_person ? Math.round(parseFloat(form.price_per_person) * 100) : null,
      capacity: form.capacity ? parseInt(form.capacity, 10) : null,
    };

    if (editing === "new") {
      const { error } = await supabase.from('events').insert(payload);
      if (error) { toast.error("Failed to save"); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('events').update(payload).eq('id', editing.id);
      if (error) { toast.error("Failed to save"); setSaving(false); return; }
    }
    await load();
    setSaving(false);
    setEditing(null);
    toast.success(editing === "new" ? "Event created" : "Event updated");
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) { setEvents((p) => p.filter((e) => e.id !== id)); toast.success("Event deleted"); }
  };

  const toggleExpand = async (eventId) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
      setBookings([]);
      return;
    }
    setExpandedEventId(eventId);
    setBookingsLoading(true);
    const { data, error } = await supabase
      .from('event_bookings')
      .select('id, guest_name, email, phone, party_size, dietary_requirements, attended, event_id, created_at')
      .eq('event_id', eventId)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: true });
    if (error) {
      toast.error("Failed to load bookings");
      setBookings([]);
    } else {
      setBookings(data || []);
    }
    setBookingsLoading(false);
  };

  const handleReschedule = async (bookingId, newEventId) => {
    if (!newEventId) return;
    setReschedulingId(bookingId);

    const { error: updateErr } = await supabase
      .from('event_bookings')
      .update({ event_id: newEventId })
      .eq('id', bookingId);

    if (updateErr) {
      toast.error("Failed to reschedule booking");
      setReschedulingId(null);
      return;
    }

    const { error: notifyErr } = await supabase.functions.invoke('notify-event-booking', {
      body: { booking_id: bookingId },
    });

    if (notifyErr) {
      toast.error("Booking moved, but the new confirmation email failed to send");
    } else {
      toast.success("Booking rescheduled and new confirmation sent");
    }

    setReschedulingId(null);
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    await load();
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" style={{ color: "#193c47" }} /></div>;

  const btnPrimary = { padding: "8px 16px", backgroundColor: "#193c47", color: "#f3f2ee", border: "none", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" };

  const today = startOfDay(new Date());

  return (
    <div className="space-y-6" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "#777777" }}>{events.length} event{events.length !== 1 ? "s" : ""}</p>
        <button style={btnPrimary} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2d6272"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "#193c47"} onClick={openNew}>
          <Plus className="h-3.5 w-3.5" /> Add event
        </button>
      </div>

      {editing && (
        <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "24px" }}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm" style={{ color: "#2e282a" }}>{editing === "new" ? "New event" : "Edit event"}</p>
            <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "#777777" }}><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label style={labelStyle}>Title</label>
              <input style={inputStyle} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Event title" />
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" style={inputStyle} value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Time</label>
              <input style={inputStyle} value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} placeholder="e.g. 7:00pm" />
            </div>
            <div>
              <label style={labelStyle}>Ticket price (£ per person)</label>
              <input style={inputStyle} value={form.price_per_person} onChange={(e) => setForm((p) => ({ ...p, price_per_person: e.target.value }))} placeholder="Leave blank for a free event" inputMode="decimal" />
            </div>
            <div>
              <label style={labelStyle}>Capacity</label>
              <input style={inputStyle} value={form.capacity} onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))} placeholder="Max guests, leave blank if unlimited" inputMode="numeric" />
            </div>
          </div>
          <div className="mb-4">
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: "80px", resize: "none" }} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Event description..." />
          </div>
          <div className="mb-4">
            <label style={labelStyle}>Image</label>
            {form.image_url ? (
              <div className="flex items-center gap-3">
                <img src={form.image_url} alt="" className="h-16 w-24 object-cover" style={{ borderRadius: "4px", border: "1px solid #d8d6d0" }} />
                <button onClick={() => setForm((p) => ({ ...p, image_url: "" }))} style={{ padding: "4px 10px", backgroundColor: "transparent", color: "#777777", border: "1px solid #d8d6d0", borderRadius: "4px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", cursor: "pointer" }}>Remove</button>
              </div>
            ) : (
              <label style={{ cursor: "pointer" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", backgroundColor: "transparent", color: "#193c47", border: "1px solid #193c47", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload image
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>
          <div className="flex items-center gap-3 mb-5">
            <Switch checked={form.published} onCheckedChange={(v) => setForm((p) => ({ ...p, published: v }))} />
            <span className="text-sm" style={{ color: "#2e282a" }}>Published on website</span>
          </div>
          <div className="flex gap-2">
            <button style={{ ...btnPrimary, opacity: saving || !form.title || !form.date || !form.description ? 0.5 : 1 }} disabled={saving || !form.title || !form.date || !form.description} onClick={handleSave}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save event
            </button>
            <button onClick={close} style={{ padding: "8px 16px", backgroundColor: "transparent", color: "#193c47", border: "1px solid #193c47", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#777777" }}>
          <p className="text-sm">No events yet. Add your first one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((ev) => {
            const isTicketed = !!ev.price_per_person;
            const isExpanded = expandedEventId === ev.id;
            const hasBookingActivity = !!bookingCounts[ev.id] || !!ev.capacity;
            const otherUpcomingBookable = events.filter(
              (e) => e.id !== ev.id && isAfter(parseISO(e.date), today)
            );

            return (
              <div key={ev.id} style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px" }}>
                <div style={{ padding: "16px" }} className="flex gap-4 items-start">
                  {ev.image_url && <img src={ev.image_url} alt="" className="h-14 w-20 object-cover shrink-0" style={{ borderRadius: "4px", border: "1px solid #d8d6d0" }} />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm" style={{ color: "#2e282a" }}>{ev.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#777777" }}>
                          {format(parseISO(ev.date), "EEE d MMM yyyy")}
                          {ev.time && ` · ${ev.time}`}
                          {isTicketed ? ` · £${(ev.price_per_person / 100).toFixed(2)} per person` : ` · Free`}
                        </p>
                        {hasBookingActivity && (
                          <button
                            onClick={() => toggleExpand(ev.id)}
                            style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "6px", background: "none", border: "none", cursor: "pointer", padding: 0, color: "#193c47", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px" }}
                          >
                            {bookingCounts[ev.id] || 0}{ev.capacity ? ` / ${ev.capacity}` : ""} booked
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!ev.published && <span style={{ fontSize: "10px", backgroundColor: "#eceae4", color: "#777777", border: "1px solid #d8d6d0", padding: "2px 8px", borderRadius: "3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Draft</span>}
                        <button onClick={() => openEdit(ev)} style={{ padding: "4px 8px", backgroundColor: "transparent", border: "1px solid #d8d6d0", borderRadius: "4px", cursor: "pointer", color: "#777777" }}><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(ev.id)} style={{ padding: "4px 8px", backgroundColor: "transparent", border: "1px solid #d8d6d0", borderRadius: "4px", cursor: "pointer", color: "#777777" }}><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: "#777777" }}>{ev.description}</p>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: "1px solid #d8d6d0", padding: "16px" }}>
                    {bookingsLoading ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#193c47" }} />
                      </div>
                    ) : bookings.length === 0 ? (
                      <p className="text-xs" style={{ color: "#777777" }}>No bookings yet for this event.</p>
                    ) : (
                      <div className="space-y-3">
                        {bookings.map((b) => (
                          <div key={b.id} style={{ backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "12px" }}>
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <p className="text-sm" style={{ color: "#2e282a" }}>
                                  {b.guest_name}
                                  {b.attended && (
                                    <span style={{ marginLeft: "8px", fontSize: "9px", backgroundColor: "#193c47", color: "#f3f2ee", padding: "2px 6px", borderRadius: "3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                      Attended
                                    </span>
                                  )}
                                </p>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                  <span className="text-xs flex items-center gap-1" style={{ color: "#777777" }}><Mail className="h-3 w-3" />{b.email}</span>
                                  <span className="text-xs flex items-center gap-1" style={{ color: "#777777" }}><Phone className="h-3 w-3" />{b.phone}</span>
                                  <span className="text-xs flex items-center gap-1" style={{ color: "#777777" }}><Users className="h-3 w-3" />{b.party_size}</span>
                                </div>
                                {b.dietary_requirements && (
                                  <p className="text-xs mt-1" style={{ color: "#777777" }}>Dietary: {b.dietary_requirements}</p>
                                )}
                              </div>
                              <div>
                                {otherUpcomingBookable.length > 0 ? (
                                  <select
                                    disabled={reschedulingId === b.id}
                                    value=""
                                    onChange={(e) => handleReschedule(b.id, e.target.value)}
                                    style={{ ...inputStyle, padding: "6px 8px", fontSize: "11px", width: "auto" }}
                                  >
                                    <option value="" disabled>
                                      {reschedulingId === b.id ? "Rescheduling..." : "Reschedule to..."}
                                    </option>
                                    {otherUpcomingBookable.map((opt) => (
                                      <option key={opt.id} value={opt.id}>
                                        {opt.title} — {format(parseISO(opt.date), "d MMM yyyy")}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <p className="text-xs" style={{ color: "#777777" }}>No other upcoming events to reschedule to</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}