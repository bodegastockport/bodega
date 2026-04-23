import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Trash2, X, QrCode } from "lucide-react";
import { toast } from "sonner";
import BottleQRModal from "./BottleQRModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BLANK = { wine_name: "", producer: "", vintage: "", cellar_location: "", type: "Red", quantity: 1, notes: "" };
const TYPES = ["Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified", "Other"];

const inputStyle = { backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "13px", padding: "8px 11px", color: "#2e282a", width: "100%", outline: "none", transition: "border-color 0.15s" };
const labelStyle = { display: "block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#777777", marginBottom: "4px", fontFamily: "'Courier New', Courier, monospace" };

export default function MemberBottles({ member, onBottleCountChange }) {
  const [bottles, setBottles] = useState([]);
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
      .eq('status', 'stored')
      .order('created_at', { ascending: false });
    const bottles = data || [];
    setBottles(bottles);
    setLoading(false);
    onBottleCountChange?.(bottles.reduce((s, b) => s + (b.quantity || 1), 0));
  };

  useEffect(() => { load(); }, [member.id]);

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleAdd = async () => {
    if (!form.wine_name) return;
    setSaving(true);
    const { error } = await supabase
      .from('cellar_bottles')
      .insert({ ...form, member_id: member.id, status: "stored" });
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

  // Marks bottle as consumed rather than deleting
  const handleCheckOut = async (id) => {
    const { error } = await supabase
      .from('cellar_bottles')
      .update({ status: "consumed", checked_out_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      const updated = bottles.filter((b) => b.id !== id);
      setBottles(updated);
      onBottleCountChange?.(updated.reduce((s, b) => s + (b.quantity || 1), 0));
      toast.success("Bottle checked out");
    }
  };

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin" style={{ color: "#193c47" }} /></div>;

  const total = bottles.reduce((s, b) => s + (b.quantity || 1), 0);

  return (
    <div className="space-y-4" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      {qrBottle && <BottleQRModal bottle={qrBottle} member={member} onClose={() => setQrBottle(null)} />}

      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "#777777" }}>{total} bottle{total !== 1 ? "s" : ""} stored</p>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 12px", backgroundColor: "transparent", color: "#193c47", border: "1px solid #193c47", borderRadius: "4px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}
          >
            <Plus className="h-3 w-3" /> Add bottle
          </button>
        )}
      </div>

      {adding && (
        <div style={{ backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "4px", padding: "14px" }}>
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
            <div>
              <label style={labelStyle}>Cellar location</label>
              <input style={inputStyle} value={form.cellar_location} onChange={(e) => f("cellar_location", e.target.value)} placeholder="e.g. A20" />
            </div>
            <div>
              <label style={labelStyle}>Quantity</label>
              <input type="number" min="1" style={inputStyle} value={form.quantity} onChange={(e) => f("quantity", Number(e.target.value))} />
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
              disabled={saving || !form.wine_name}
              style={{ padding: "6px 14px", backgroundColor: saving || !form.wine_name ? "#d8d6d0" : "#193c47", color: saving || !form.wine_name ? "#777777" : "#f3f2ee", border: "none", borderRadius: "4px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: saving || !form.wine_name ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "5px" }}
            >
              {saving && <Loader2 className="h-3 w-3 animate-spin" />} Save
            </button>
            <button onClick={() => setAdding(false)} style={{ padding: "6px 14px", backgroundColor: "transparent", color: "#777777", border: "1px solid #d8d6d0", borderRadius: "4px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {bottles.length === 0 && !adding ? (
        <div className="text-center py-6" style={{ color: "#777777" }}>
          <p className="text-xs">No bottles stored yet</p>
        </div>
      ) : (
        <div className="space-y-0" style={{ borderTop: "1px solid #d8d6d0" }}>
          {bottles.map((b) => (
            <div key={b.id} className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid #d8d6d0" }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs" style={{ color: "#2e282a" }}>{b.wine_name}</p>
                  {b.vintage && <span className="text-xs" style={{ color: "#777777" }}>{b.vintage}</span>}
                  {b.type && <span className="text-xs" style={{ color: "#777777" }}>· {b.type}</span>}
                  {b.cellar_location && <span className="text-xs" style={{ color: "#193c47" }}>· {b.cellar_location}</span>}
                </div>
                {b.notes && <p className="text-xs mt-0.5" style={{ color: "#777777" }}>{b.notes}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs" style={{ color: "#2e282a", backgroundColor: "#d8d6d0", padding: "2px 7px", borderRadius: "3px" }}>×{b.quantity}</span>
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
  );
}
