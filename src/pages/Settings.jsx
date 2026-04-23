import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Correct defaults: Mon closed, Tue–Sun 2pm–9pm, 6 tables, max 10, 4 weeks ahead
const DEFAULT_SETTINGS = {
  total_tables: "6",
  max_party_size: "10",
  slot_duration: "30",
  booking_lead_days: "28",
  open_days: JSON.stringify({
    Monday:    { open: false, from: "14:00", to: "21:00" },
    Tuesday:   { open: true,  from: "14:00", to: "21:00" },
    Wednesday: { open: true,  from: "14:00", to: "21:00" },
    Thursday:  { open: true,  from: "14:00", to: "21:00" },
    Friday:    { open: true,  from: "14:00", to: "21:00" },
    Saturday:  { open: true,  from: "14:00", to: "21:00" },
    Sunday:    { open: true,  from: "14:00", to: "21:00" },
  }),
  closed_dates: "[]",
};

const inputStyle = {
  backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "6px",
  fontFamily: "'Courier New', Courier, monospace", fontSize: "13px",
  padding: "8px 11px", color: "#2e282a", outline: "none", transition: "border-color 0.15s",
};
const labelStyle = {
  display: "block", fontSize: "10px", textTransform: "uppercase",
  letterSpacing: "0.08em", color: "#777777", marginBottom: "5px",
  fontFamily: "'Courier New', Courier, monospace",
};

export default function Settings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newClosedDate, setNewClosedDate] = useState("");

  const openDays = (() => {
    try { return JSON.parse(settings.open_days); }
    catch { return JSON.parse(DEFAULT_SETTINGS.open_days); }
  })();

  const closedDates = (() => {
    try { return JSON.parse(settings.closed_dates); }
    catch { return []; }
  })();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('bar_settings').select();
      if (data?.length) {
        const map = {};
        data.forEach((r) => { map[r.key] = r.value; });
        setSettings((prev) => ({ ...prev, ...map }));
      }
      setLoading(false);
    };
    load();
  }, []);

  const saveAll = async () => {
    setSaving(true);

    // Fetch existing keys to decide insert vs update
    const { data: existing } = await supabase.from('bar_settings').select();
    const existingMap = {};
    (existing || []).forEach((r) => { existingMap[r.key] = r.id; });

    for (const [key, value] of Object.entries(settings)) {
      if (existingMap[key]) {
        await supabase.from('bar_settings').update({ value }).eq('id', existingMap[key]);
      } else {
        await supabase.from('bar_settings').insert({ key, value });
      }
    }

    setSaving(false);
    toast.success("Settings saved");
  };

  const updateSetting = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const updateOpenDay = (day, field, value) => {
    const updated = { ...openDays, [day]: { ...openDays[day], [field]: value } };
    updateSetting("open_days", JSON.stringify(updated));
  };

  const addClosedDate = () => {
    if (!newClosedDate || closedDates.includes(newClosedDate)) return;
    updateSetting("closed_dates", JSON.stringify([...closedDates, newClosedDate].sort()));
    setNewClosedDate("");
  };

  const removeClosedDate = (date) => {
    updateSetting("closed_dates", JSON.stringify(closedDates.filter((d) => d !== date)));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#193c47" }} />
    </div>
  );

  const btnPrimary = {
    padding: "8px 20px", backgroundColor: "#193c47", color: "#f3f2ee",
    border: "none", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace",
    fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em",
    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px",
    transition: "background-color 0.15s",
  };

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh" }}>
      <div className="max-w-[800px] mx-auto px-6 py-10 sm:py-14">

        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-xl" style={{ color: "#2e282a", fontWeight: 400 }}>Venue settings</h1>
            <p className="text-xs mt-1" style={{ color: "#777777" }}>Configure capacity, hours and availability</p>
          </div>
          <button
            style={btnPrimary}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2d6272"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#193c47"}
            onClick={saveAll}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save changes
          </button>
        </div>

        {/* Capacity */}
        <section className="mb-10">
          <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "#777777", borderBottom: "1px solid #d8d6d0", paddingBottom: "10px" }}>Capacity</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { key: "total_tables", label: "Total tables", hint: "Number of bookable tables (currently 6)" },
              { key: "max_party_size", label: "Max party size", hint: "Largest group per booking (currently 10)" },
              { key: "slot_duration", label: "Time slot duration (mins)", hint: "Gap between available booking times" },
              { key: "booking_lead_days", label: "Bookings open up to (days ahead)", hint: "How far in advance customers can book (currently 28 = 4 weeks)" },
            ].map(({ key, label, hint }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input
                  type="number"
                  min="1"
                  style={{ ...inputStyle, width: "100%" }}
                  value={settings[key]}
                  onChange={(e) => updateSetting(key, e.target.value)}
                />
                <p className="text-xs mt-1" style={{ color: "#777777" }}>{hint}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Opening hours */}
        <section className="mb-10">
          <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "#777777", borderBottom: "1px solid #d8d6d0", paddingBottom: "10px" }}>Opening hours</p>
          <div className="space-y-2">
            {DAYS.map((day) => {
              const d = openDays[day] || { open: false, from: "14:00", to: "21:00" };
              return (
                <div key={day} className="flex items-center gap-4 p-3" style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px" }}>
                  <Switch checked={d.open} onCheckedChange={(v) => updateOpenDay(day, "open", v)} />
                  <span className="w-24 text-sm" style={{ color: d.open ? "#2e282a" : "#777777" }}>{day}</span>
                  {d.open ? (
                    <div className="flex items-center gap-2 ml-auto">
                      <input
                        type="time"
                        style={{ ...inputStyle, width: "110px", fontSize: "12px", padding: "6px 9px" }}
                        value={d.from}
                        onChange={(e) => updateOpenDay(day, "from", e.target.value)}
                      />
                      <span className="text-xs" style={{ color: "#777777" }}>to</span>
                      <input
                        type="time"
                        style={{ ...inputStyle, width: "110px", fontSize: "12px", padding: "6px 9px" }}
                        value={d.to}
                        onChange={(e) => updateOpenDay(day, "to", e.target.value)}
                      />
                    </div>
                  ) : (
                    <span className="ml-auto text-xs" style={{ color: "#777777" }}>Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Closed dates */}
        <section className="mb-10">
          <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "#777777", borderBottom: "1px solid #d8d6d0", paddingBottom: "10px" }}>Closed dates</p>
          <p className="text-xs mb-4" style={{ color: "#777777" }}>Block out specific dates (holidays, private events, etc.)</p>
          <div className="flex gap-2 mb-4">
            <input
              type="date"
              style={{ ...inputStyle, width: "180px" }}
              value={newClosedDate}
              onChange={(e) => setNewClosedDate(e.target.value)}
            />
            <button
              onClick={addClosedDate}
              style={{ padding: "8px 14px", backgroundColor: "transparent", color: "#193c47", border: "1px solid #193c47", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
            >
              <Plus className="h-3.5 w-3.5" /> Add date
            </button>
          </div>
          {closedDates.length === 0 ? (
            <p className="text-xs" style={{ color: "#777777" }}>No closed dates added</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {closedDates.map((d) => (
                <div key={d} className="flex items-center gap-1.5" style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "4px", padding: "4px 10px" }}>
                  <span className="text-xs" style={{ color: "#2e282a" }}>{d}</span>
                  <button onClick={() => removeClosedDate(d)} style={{ background: "none", border: "none", cursor: "pointer", color: "#777777", padding: "0 0 0 4px" }}>
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "16px" }}>
          <p className="text-xs leading-relaxed" style={{ color: "#777777" }}>
            Changes to settings affect new bookings only. Existing reservations are not modified. Remember to click <strong style={{ color: "#2e282a" }}>Save changes</strong> after editing.
          </p>
        </div>
      </div>
    </div>
  );
}
