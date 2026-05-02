import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Trash2, X, QrCode } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import BottleQRModal from "./BottleQRModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BLANK = { wine_name: "", producer: "", vintage: "", cellar_location: "", type: "Red", notes: "" };
const TYPES = ["Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified", "Other"];

const inputStyle = { backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "13px", padding: "8px 11px", color: "#0A242C", width: "100%", outline: "none", transition: "border-color 0.15s" };
const labelStyle = { display: "block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#777777", marginBottom: "4px", fontFamily: "'Courier New', Courier, monospace" };

export default function MemberBottles({ member, onBottleCountChange }) {
  const [storedBottles, setStoredBottles] = useState([]);
  const [consumedBottles, setConsumedBottles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [qrBottle, setQrBottle] = useState(null);

  const load = async () => {
    const { data } = await supabase
      .from('cellar_bottles')
      .select()
      .eq('member_id', member.id)
      .order('created_at', { ascending: false });

    const all = data || [];
    const stored = all.filter(b => b.status === 'stored');
    const consumed = all.filter(b => b.status === 'consumed' || b.status === 'checked_out');

    setStoredBottles(stored);
    setConsumedBottles(consumed);
    setLoading(false);

    // Update parent with live count
    const count = stored.length;
    onBottleCountChange?.(count);

    // Update bottles_stored on cellar_members to keep vault bar in sync
    await supabase
      .from('cellar_members')
      .update({ bottles_stored: count })
      .eq('id', member.id);
  };

  useEffect(() => { load(); }, [member.id]);

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleAdd = async () => {
    if (!form.wine_name || !form.cellar_location) return;
    setSaving(true);
    const { error } = await supabase
      .from('cellar_bottles')
      .insert({ ...form, member_id: member.id, status: "stored", quantity: 1 });
    if (!error) {
      setForm(BLANK);
      setAdding(false);
      await load();
      toast.success("Bottle added");
    } else {
      toast.error("Failed to add bottle");
    }
    setSaving(false);
  };

  const handleCheckOut = async (id) => {
    const { error } = await supabase
      .from('cellar_bottles')
      .update({ status: "consumed", checked_out_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      await load();
      toast.success("Bottle checked out");
    }
  };

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin" style={{ color: "#1E4D5A" }} /></div>;

  const total = storedBottles.length;

  return (
    <div className="space-y-6" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      {qrBottle && <BottleQRModal bottle={qrBottle} member={member} onClose={() => setQrBottle(null)} />}

      {/* Current inventory */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs" style={{ color: "#777777" }}>{total} bottle{total !== 1 ? "s" : ""} stored</p>
          {!adding && (
            <button
              onClick={() => setAdding(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 12px", backgroundColor: "transparent", color: "#1E4D5A", border: "1px solid #1E4D5A", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}
            >
              <Plus className="h-3 w-3" /> Add bottle
            </button>
          )}
        </div>

        {adding && (
          <div style={{ backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", padding: "14px", marginBottom: "12px" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest" style={{ color: "#777777" }}>New bottle</p>
              <button onClick={() => setAdding(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#777777" }}><X className="h-3.5 w-3.5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label style={labelStyle}>Wine name *</label>
                <input style={inputStyle} value={form.wine_name} onChange={(e) => f("wine_name", e.target.value)} placeholder="e.g. Château Margaux" />
              </div>
              <div>
                <label style={labelStyle}>Producer</label>
                <input style={inputStyle} value={form.producer} onChange={(e) => f("producer", e.target.value)} placeholder="e.g. Château Margaux" />
              </div>
              <div>
                <label style={labelStyle}>Vintage</label>
                <input style={inputStyle} value={form.vintage} onChange={(e) => f("vintage", e.target.value)} placeholder="e.g. 2018" />
              </div>
              <div className="col-span-2">
                <label style={labelStyle}>Cellar location *</label>
                <input style={inputStyle} value={form.cellar_location} onChange={(e) => f("cellar_location", e.target.value)} placeholder="e.g. A20" />
              </div>
              <div className="col-span-2">
                <label style={labelStyle}>Type</label>
                <Select value={form.type} onValueChange={(v) => f("type", v)}>
                  <SelectTrigger style={{ ...inputStyle, height: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label style={labelStyle}>Notes</label>
                <input style={inputStyle} value={form.notes} onChange={(e) => f("notes", e.target.value)} placeholder="Optional notes..." />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAdd}
                disabled={saving || !form.wine_name || !form.cellar_location}
                style={{ padding: "6px 14px", backgroundColor: saving || !form.wine_name || !form.cellar_location ? "#d8d6d0" : "#1E4D5A", color: saving || !form.wine_name || !form.cellar_location ? "#777777" : "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: saving || !form.wine_name || !form.cellar_location ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "5px" }}
              >
                {saving && <Loader2 className="h-3 w-3 animate-spin" />} Save
              </button>
              <button onClick={() => setAdding(false)} style={{ padding: "6px 14px", backgroundColor: "transparent", color: "#777777", border: "1px solid #d8d6d0", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}

        {storedBottles.length === 0 && !adding ? (
          <div className="text-center py-6" style={{ color: "#777777" }}>
            <p className="text-xs">No bottles stored yet</p>
          </div>
        ) : (
          <div style={{ borderTop: "1px solid #d8d6d0" }}>
            {storedBottles.map((b) => (
              <div key={b.id} className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid #d8d6d0" }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs" style={{ color: "#0A242C" }}>{b.wine_name}</p>
                    {b.vintage && <span className="text-xs" style={{ color: "#777777" }}>{b.vintage}</span>}
                    {b.type && <span className="text-xs" style={{ color: "#777777" }}>· {b.type}</span>}
                    {b.cellar_location && <span className="text-xs" style={{ color: "#1E4D5A" }}>· {b.cellar_location}</span>}
                  </div>
                  {b.notes && <p className="text-xs mt-0.5" style={{ color: "#777777" }}>{b.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setQrBottle(b)} style={{ background: "none", border: "none", cursor: "pointer", color: "#777777", padding: "2px" }} title="Generate QR label">
                    <QrCode className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleCheckOut(b.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#777777", padding: "2px" }} title="Check out (consumed)">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {consumedBottles.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#777777" }}>History</p>
          <div style={{ borderTop: "1px solid #d8d6d0" }}>
            {consumedBottles.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3 gap-3" style={{ borderBottom: "1px solid #d8d6d0" }}>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs" style={{ color: "#777777" }}>{b.wine_name}</p>
                    {b.vintage && <span className="text-xs" style={{ color: "#aaa" }}>{b.vintage}</span>}
                    {b.type && <span className="text-xs" style={{ color: "#aaa" }}>· {b.type}</span>}
                  </div>
                  {b.checked_out_at && (
                    <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>
                      Checked out {format(parseISO(b.checked_out_at), "d MMM yyyy")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}