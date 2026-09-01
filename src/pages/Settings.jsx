import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Save, Plus, Trash2, Pencil, X, Check } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_SETTINGS = {
  slot_duration: "30",
  booking_interval: "30",
  booking_lead_days: "28",
  min_notice_hours: "2",
  walkin_cap_enabled: "false",
  open_days: JSON.stringify({
    Monday:    { open: false, from: "14:00", to: "22:00" },
    Tuesday:   { open: true,  from: "14:00", to: "22:00" },
    Wednesday: { open: true,  from: "14:00", to: "22:00" },
    Thursday:  { open: true,  from: "14:00", to: "22:00" },
    Friday:    { open: true,  from: "14:00", to: "23:59" },
    Saturday:  { open: true,  from: "14:00", to: "23:59" },
    Sunday:    { open: true,  from: "14:00", to: "22:00" },
  }),
  closed_dates: "[]",
};

const inputStyle = {
  backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "6px",
  fontFamily: "'Courier New', Courier, monospace", fontSize: "13px",
  padding: "8px 11px", color: "#0A242C", outline: "none", transition: "border-color 0.15s",
};
const labelStyle = {
  display: "block", fontSize: "10px", textTransform: "uppercase",
  letterSpacing: "0.08em", color: "#777777", marginBottom: "5px",
  fontFamily: "'Courier New', Courier, monospace",
};
const btnPrimary = {
  padding: "8px 20px", backgroundColor: "#1E4D5A", color: "#f3f2ee",
  border: "none", borderRadius: "0px", fontFamily: "'Courier New', Courier, monospace",
  fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em",
  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px",
  transition: "background-color 0.15s",
};
const btnOutline = {
  padding: "6px 14px", backgroundColor: "transparent", color: "#1E4D5A",
  border: "1px solid #1E4D5A", borderRadius: "0px", fontFamily: "'Courier New', Courier, monospace",
  fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em",
  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px",
};

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newClosedDate, setNewClosedDate] = useState("");

  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [editingTable, setEditingTable] = useState(null);
  const [addingTable, setAddingTable] = useState(false);
  const [newTable, setNewTable] = useState({ name: "", capacity: "" });
  const [savingTable, setSavingTable] = useState(false);

  const [overrides, setOverrides] = useState([]);
  const [overridesLoading, setOverridesLoading] = useState(true);
  const [newOverride, setNewOverride] = useState({ table_id: "", date: "" });
  const [addingOverride, setAddingOverride] = useState(false);
  const [savingOverride, setSavingOverride] = useState(false);

  const openDays = (() => {
    try { return JSON.parse(settings.open_days); }
    catch { return JSON.parse(DEFAULT_SETTINGS.open_days); }
  })();

  const closedDates = (() => {
    try { return JSON.parse(settings.closed_dates); }
    catch { return []; }
  })();

  const walkinCapEnabled = settings.walkin_cap_enabled === "true";

  const loadSettings = async () => {
    const { data } = await supabase.from('bar_settings').select();
    if (data?.length) {
      const map = {};
      data.forEach((r) => { map[r.key] = r.value; });
      setSettings((prev) => ({ ...prev, ...map }));
    }
    setLoading(false);
  };

  const loadTables = async () => {
    setTablesLoading(true);
    const { data } = await supabase.from('tables').select().order('name');
    setTables(data || []);
    setTablesLoading(false);
  };

  const loadOverrides = async () => {
    setOverridesLoading(true);
    const { data } = await supabase
      .from('table_date_overrides')
      .select('*, tables(name)')
      .order('date', { ascending: true });
    setOverrides(data || []);
    setOverridesLoading(false);
  };

  useEffect(() => {
    loadSettings();
    loadTables();
    loadOverrides();
  }, []);

  const saveAll = async () => {
    setSaving(true);
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

  const saveNewTable = async () => {
    if (!newTable.name.trim() || !newTable.capacity) return;
    setSavingTable(true);
    const { error } = await supabase.from('tables').insert({ name: newTable.name.trim(), capacity: parseInt(newTable.capacity), active: true });
    if (!error) { await loadTables(); setNewTable({ name: "", capacity: "" }); setAddingTable(false); toast.success("Table added"); }
    setSavingTable(false);
  };

  const saveEditTable = async () => {
    if (!editingTable.name.trim() || !editingTable.capacity) return;
    setSavingTable(true);
    const { error } = await supabase.from('tables').update({ name: editingTable.name.trim(), capacity: parseInt(editingTable.capacity) }).eq('id', editingTable.id);
    if (!error) { await loadTables(); setEditingTable(null); toast.success("Table updated"); }
    setSavingTable(false);
  };

  const toggleTableActive = async (table) => {
    await supabase.from('tables').update({ active: !table.active }).eq('id', table.id);
    await loadTables();
  };

  const deleteTable = async (id) => {
    const { error } = await supabase.from('tables').delete().eq('id', id);
    if (!error) { await loadTables(); toast.success("Table removed"); }
    else toast.error("Cannot delete — this table has existing reservations");
  };

  const saveOverride = async () => {
    if (!newOverride.table_id || !newOverride.date) return;
    setSavingOverride(true);
    const { error } = await supabase.from('table_date_overrides').upsert({ table_id: newOverride.table_id, date: newOverride.date, available: false }, { onConflict: 'table_id,date' });
    if (!error) { await loadOverrides(); setNewOverride({ table_id: "", date: "" }); setAddingOverride(false); toast.success("Table marked unavailable for that date"); }
    setSavingOverride(false);
  };

  const deleteOverride = async (id) => {
    await supabase.from('table_date_overrides').delete().eq('id', id);
    await loadOverrides();
    toast.success("Override removed");
  };

  const role      = user?.app_metadata?.role;
  const isAdmin   = role === "admin";
  const isTeam    = role === "team";
  const hasAccess = isAdmin || isTeam;

  if (!hasAccess) {
    return (
      <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: "360px" }}>
          <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#777777", marginBottom: "12px" }}>Access denied</p>
          <h1 style={{ fontSize: "18px", color: "#1E4D5A", fontWeight: 400, marginBottom: "10px" }}>You don't have admin access</h1>
          <p style={{ fontSize: "12px", color: "#777777", lineHeight: "1.7", marginBottom: "24px" }}>
            Your account hasn't been granted admin access. Contact the Bodega team if you believe this is an error.
          </p>
          <a href="/" style={{ display: "inline-block", padding: "8px 20px", backgroundColor: "transparent", color: "#1E4D5A", border: "1px solid #1E4D5A", borderRadius: "4px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none" }}>
            Back to site
          </a>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#1E4D5A" }} />
    </div>
  );

  return (
    <div style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      <div className="max-w-[800px]">

        <div className="flex items-start justify-between mb-10">
          <div>
            <h2 className="text-lg" style={{ color: "#0A242C", fontWeight: 400 }}>Venue settings</h2>
            <p className="text-xs mt-1" style={{ color: "#777777" }}>Configure tables, hours and availability</p>
          </div>
          <button style={btnPrimary} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0A242C"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1E4D5A"} onClick={saveAll} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save changes
          </button>
        </div>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-5" style={{ borderBottom: "1px solid #d8d6d0", paddingBottom: "10px" }}>
            <p className="text-xs uppercase tracking-widest" style={{ color: "#777777" }}>Tables</p>
            <button style={btnOutline} onClick={() => { setAddingTable(true); setEditingTable(null); }}>
              <Plus className="h-3 w-3" /> Add table
            </button>
          </div>

          {addingTable && (
            <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "16px", marginBottom: "12px" }} className="flex gap-3 items-end">
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>Table name</label>
                <input style={{ ...inputStyle, width: "100%" }} placeholder="e.g. Window Table" value={newTable.name} onChange={(e) => setNewTable(p => ({ ...p, name: e.target.value }))} autoFocus />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Seats</label>
                <input type="number" min="1" max="20" style={{ ...inputStyle, width: "100%" }} placeholder="4" value={newTable.capacity} onChange={(e) => setNewTable(p => ({ ...p, capacity: e.target.value }))} />
              </div>
              <button style={btnPrimary} onClick={saveNewTable} disabled={savingTable || !newTable.name || !newTable.capacity}>
                {savingTable ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Save
              </button>
              <button style={btnOutline} onClick={() => { setAddingTable(false); setNewTable({ name: "", capacity: "" }); }}>
                <X className="h-3 w-3" /> Cancel
              </button>
            </div>
          )}

          {tablesLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-4 w-4 animate-spin" style={{ color: "#1E4D5A" }} /></div>
          ) : tables.length === 0 ? (
            <p className="text-xs py-4" style={{ color: "#777777" }}>No tables yet.</p>
          ) : (
            <div className="space-y-2">
              {tables.map((table) => (
                <div key={table.id} style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "12px 16px" }} className="flex items-center gap-4">
                  <Switch checked={table.active} onCheckedChange={() => toggleTableActive(table)} />
                  {editingTable?.id === table.id ? (
                    <>
                      <input style={{ ...inputStyle, flex: 2, padding: "5px 9px", fontSize: "12px" }} value={editingTable.name} onChange={(e) => setEditingTable(p => ({ ...p, name: e.target.value }))} autoFocus />
                      <input type="number" min="1" max="20" style={{ ...inputStyle, width: "70px", padding: "5px 9px", fontSize: "12px" }} value={editingTable.capacity} onChange={(e) => setEditingTable(p => ({ ...p, capacity: e.target.value }))} />
                      <span className="text-xs" style={{ color: "#777777" }}>seats</span>
                      <div className="flex gap-2 ml-auto">
                        <button style={{ ...btnPrimary, padding: "4px 12px", fontSize: "10px" }} onClick={saveEditTable} disabled={savingTable}>{savingTable ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}</button>
                        <button style={{ ...btnOutline, padding: "4px 10px", fontSize: "10px" }} onClick={() => setEditingTable(null)}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-xs flex-1" style={{ color: table.active ? "#0A242C" : "#777777" }}>{table.name}</span>
                      <span className="text-xs" style={{ color: "#777777" }}>{table.capacity} seats</span>
                      {!table.active && <span className="text-xs" style={{ color: "#777777", fontStyle: "italic" }}>inactive</span>}
                      <div className="flex gap-2 ml-auto">
                        <button onClick={() => setEditingTable({ id: table.id, name: table.name, capacity: table.capacity })} style={{ padding: "4px 8px", backgroundColor: "transparent", border: "1px solid #d8d6d0", cursor: "pointer", color: "#777777" }}><Pencil className="h-3 w-3" /></button>
                        <button onClick={() => deleteTable(table.id)} style={{ padding: "4px 8px", backgroundColor: "transparent", border: "1px solid #d8d6d0", cursor: "pointer", color: "#777777" }}><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-5" style={{ borderBottom: "1px solid #d8d6d0", paddingBottom: "10px" }}>
            <div>
              <p className="text-xs uppercase tracking-widest" style={{ color: "#777777" }}>Table unavailability</p>
              <p className="text-xs mt-1" style={{ color: "#777777" }}>Mark a specific table as unavailable on a specific date</p>
            </div>
            <button style={btnOutline} onClick={() => setAddingOverride(true)}><Plus className="h-3 w-3" /> Add</button>
          </div>

          {addingOverride && (
            <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "16px", marginBottom: "12px" }} className="flex gap-3 items-end flex-wrap">
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>Table</label>
                <select style={{ ...inputStyle, width: "100%" }} value={newOverride.table_id} onChange={(e) => setNewOverride(p => ({ ...p, table_id: e.target.value }))}>
                  <option value="">Select table</option>
                  {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Date</label>
                <input type="date" style={{ ...inputStyle, width: "100%" }} value={newOverride.date} onChange={(e) => setNewOverride(p => ({ ...p, date: e.target.value }))} />
              </div>
              <button style={btnPrimary} onClick={saveOverride} disabled={savingOverride || !newOverride.table_id || !newOverride.date}>
                {savingOverride ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Save
              </button>
              <button style={btnOutline} onClick={() => { setAddingOverride(false); setNewOverride({ table_id: "", date: "" }); }}>
                <X className="h-3 w-3" /> Cancel
              </button>
            </div>
          )}

          {overridesLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-4 w-4 animate-spin" style={{ color: "#1E4D5A" }} /></div>
          ) : overrides.length === 0 ? (
            <p className="text-xs py-4" style={{ color: "#777777" }}>No overrides set.</p>
          ) : (
            <div className="space-y-2">
              {overrides.map((o) => (
                <div key={o.id} style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "10px 16px" }} className="flex items-center justify-between">
                  <div>
                    <span className="text-xs" style={{ color: "#0A242C" }}>{o.tables?.name}</span>
                    <span className="text-xs mx-3" style={{ color: "#777777" }}>—</span>
                    <span className="text-xs" style={{ color: "#777777" }}>{o.date}</span>
                    <span className="text-xs ml-3" style={{ color: "#c0392b" }}>Unavailable</span>
                  </div>
                  <button onClick={() => deleteOverride(o.id)} style={{ padding: "4px 8px", backgroundColor: "transparent", border: "1px solid #d8d6d0", cursor: "pointer", color: "#777777" }}><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-10">
          <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "#777777", borderBottom: "1px solid #d8d6d0", paddingBottom: "10px" }}>Booking config</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            {[
              { key: "booking_interval", label: "Booking interval (mins)", hint: "How often a new start time is offered, e.g. every 15 or 30 mins" },
              { key: "slot_duration", label: "Booking length (mins)", hint: "How long each table booking lasts once made" },
              { key: "booking_lead_days", label: "Bookings open up to (days ahead)", hint: "How far in advance customers can book" },
              { key: "min_notice_hours", label: "Minimum notice (hours)", hint: "How far ahead a booking must be made" },
            ].map(({ key, label, hint }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input type="number" min="0" style={{ ...inputStyle, width: "100%" }} value={settings[key]} onChange={(e) => updateSetting(key, e.target.value)} />
                <p className="text-xs mt-1" style={{ color: "#777777" }}>{hint}</p>
              </div>
            ))}
          </div>
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "16px" }} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#0A242C" }}>Walk-in cap</p>
              <p className="text-xs leading-relaxed" style={{ color: "#777777" }}>
                When on, online bookings stop accepting once 14 seats are taken at any point in time, keeping the remainder free for walk-ins.
              </p>
            </div>
            <Switch
              checked={walkinCapEnabled}
              onCheckedChange={(v) => updateSetting("walkin_cap_enabled", String(v))}
            />
          </div>
        </section>

        <section className="mb-10">
          <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "#777777", borderBottom: "1px solid #d8d6d0", paddingBottom: "10px" }}>Opening hours</p>
          <div className="space-y-2">
            {DAYS.map((day) => {
              const d = openDays[day] || { open: false, from: "14:00", to: "22:00" };
              return (
                <div key={day} className="flex items-center gap-4 p-3" style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0" }}>
                  <Switch checked={d.open} onCheckedChange={(v) => updateOpenDay(day, "open", v)} />
                  <span className="w-24 text-sm" style={{ color: d.open ? "#0A242C" : "#777777" }}>{day}</span>
                  {d.open ? (
                    <div className="flex items-center gap-2 ml-auto">
                      <input type="time" style={{ ...inputStyle, width: "110px", fontSize: "12px", padding: "6px 9px" }} value={d.from} onChange={(e) => updateOpenDay(day, "from", e.target.value)} />
                      <span className="text-xs" style={{ color: "#777777" }}>to</span>
                      <input type="time" style={{ ...inputStyle, width: "110px", fontSize: "12px", padding: "6px 9px" }} value={d.to} onChange={(e) => updateOpenDay(day, "to", e.target.value)} />
                    </div>
                  ) : (
                    <span className="ml-auto text-xs" style={{ color: "#777777" }}>Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-10">
          <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "#777777", borderBottom: "1px solid #d8d6d0", paddingBottom: "10px" }}>Closed dates</p>
          <p className="text-xs mb-4" style={{ color: "#777777" }}>Block out entire days — holidays, private events, etc.</p>
          <div className="flex gap-2 mb-4">
            <input type="date" style={{ ...inputStyle, width: "180px" }} value={newClosedDate} onChange={(e) => setNewClosedDate(e.target.value)} />
            <button onClick={addClosedDate} style={btnOutline}><Plus className="h-3.5 w-3.5" /> Add date</button>
          </div>
          {closedDates.length === 0 ? (
            <p className="text-xs" style={{ color: "#777777" }}>No closed dates added</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {closedDates.map((d) => (
                <div key={d} className="flex items-center gap-1.5" style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "4px 10px" }}>
                  <span className="text-xs" style={{ color: "#0A242C" }}>{d}</span>
                  <button onClick={() => removeClosedDate(d)} style={{ background: "none", border: "none", cursor: "pointer", color: "#777777", padding: "0 0 0 4px" }}><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "16px" }}>
          <p className="text-xs leading-relaxed" style={{ color: "#777777" }}>
            Changes to opening hours, booking config and the walk-in cap require clicking <strong style={{ color: "#0A242C" }}>Save changes</strong>. Table changes save immediately.
          </p>
        </div>
      </div>
    </div>
  );
}