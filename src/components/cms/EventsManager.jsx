import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const inputStyle = { backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "13px", padding: "9px 12px", color: "#2e282a", width: "100%", outline: "none", transition: "border-color 0.15s" };
const labelStyle = { display: "block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#777777", marginBottom: "5px", fontFamily: "'Courier New', Courier, monospace" };
const BLANK = { title: "", date: "", time: "", price: "", description: "", image_url: "", published: true };

export default function EventsManager() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('events')
      .select()
      .order('date', { ascending: false });
    setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(BLANK); setEditing("new"); };
  const openEdit = (ev) => { setForm({ title: ev.title, date: ev.date, time: ev.time || "", price: ev.price || "", description: ev.description, image_url: ev.image_url || "", published: ev.published ?? true }); setEditing(ev); };
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
    if (editing === "new") {
      const { error } = await supabase.from('events').insert(form);
      if (error) { toast.error("Failed to save"); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('events').update(form).eq('id', editing.id);
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

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" style={{ color: "#193c47" }} /></div>;

  const btnPrimary = { padding: "8px 16px", backgroundColor: "#193c47", color: "#f3f2ee", border: "none", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" };

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
              <label style={labelStyle}>Price</label>
              <input style={inputStyle} value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="e.g. Free, £15 per person" />
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
          {events.map((ev) => (
            <div key={ev.id} style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "16px" }} className="flex gap-4 items-start">
              {ev.image_url && <img src={ev.image_url} alt="" className="h-14 w-20 object-cover shrink-0" style={{ borderRadius: "4px", border: "1px solid #d8d6d0" }} />}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm" style={{ color: "#2e282a" }}>{ev.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#777777" }}>
                      {format(parseISO(ev.date), "EEE d MMM yyyy")}
                      {ev.time && ` · ${ev.time}`}
                      {ev.price && ` · ${ev.price}`}
                    </p>
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
          ))}
        </div>
      )}
    </div>
  );
}