import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Loader2, Plus, Pencil, Trash2, X, Search, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const inputStyle = { backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "13px", padding: "9px 12px", color: "#0A242C", width: "100%", outline: "none", transition: "border-color 0.15s" };
const labelStyle = { display: "block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#777777", marginBottom: "5px", fontFamily: "'Courier New', Courier, monospace" };

const BLANK = { name: "", email: "", phone: "", membership_start: "", notes: "", status: "active", membership_tier: "" };
const VAULT_CAPACITY = 780;

export default function CellarClubManager() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [totalBottles, setTotalBottles] = useState(0);
  const [assignedSlots, setAssignedSlots] = useState(0);

  const load = async () => {
    const { data } = await supabase
      .from("cellar_members")
      .select()
      .eq("status", "active")
      .order("created_at", { ascending: false });
    setMembers(data || []);

    const { count: bottleCount } = await supabase
      .from("cellar_bottles")
      .select("*", { count: "exact", head: true })
      .eq("status", "stored");
    setTotalBottles(bottleCount || 0);

    const { count: slotCount } = await supabase
      .from("vault_slots")
      .select("*", { count: "exact", head: true })
      .eq("status", "assigned");
    setAssignedSlots(slotCount || 0);

    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(BLANK); setEditing("new"); };
  const openEdit = (m) => {
    setForm({ name: m.name, email: m.email, phone: m.phone || "", membership_start: m.membership_start || "", notes: m.notes || "", status: m.status || "active", membership_tier: m.membership_tier || "" });
    setEditing(m);
  };
  const close = () => setEditing(null);
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    if (editing === "new") {
      const { error } = await supabase.from("cellar_members").insert(form);
      if (error) { toast.error("Failed to add member"); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("cellar_members").update(form).eq("id", editing.id);
      if (error) { toast.error("Failed to update member"); setSaving(false); return; }
    }
    await load();
    setSaving(false);
    setEditing(null);
    toast.success(editing === "new" ? "Member added" : "Member updated");
  };

  const handleDeactivate = async (id) => {
    const { data: storedBottles } = await supabase
      .from("cellar_bottles")
      .select("id")
      .eq("member_id", id)
      .eq("status", "stored");

    const bottleCount = storedBottles?.length || 0;

    const { error: memberErr } = await supabase
      .from("cellar_members")
      .update({ status: "inactive" })
      .eq("id", id);

    if (memberErr) { toast.error("Failed to deactivate member"); return; }

    if (bottleCount === 0) {
      await supabase
        .from("vault_slots")
        .update({ status: "available", member_id: null, updated_at: new Date().toISOString() })
        .eq("member_id", id)
        .eq("status", "assigned");
      toast.success("Member deactivated — vault slots released");
    } else {
      await supabase
        .from("vault_slots")
        .update({ status: "pending_release", updated_at: new Date().toISOString() })
        .eq("member_id", id)
        .eq("status", "assigned");
      toast.success(`Member deactivated — ${bottleCount} bottle${bottleCount !== 1 ? "s" : ""} still in vault, slots marked pending release`);
    }

    setMembers((p) => p.filter((m) => m.id !== id));
    await load();
  };

  const filtered = members.filter(m => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (m.name || "").toLowerCase().includes(q) || (m.email || "").toLowerCase().includes(q) || (m.phone || "").toLowerCase().includes(q);
  });

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" style={{ color: "#1E4D5A" }} /></div>;

  return (
    <div className="space-y-6" style={{ fontFamily: "'Courier New', Courier, monospace" }}>

      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "#777777" }}>
          {members.length} active members · {totalBottles} bottles stored · {assignedSlots} / {VAULT_CAPACITY} slots assigned
        </p>
        <button
          onClick={openNew}
          style={{ padding: "8px 16px", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0A242C"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1E4D5A"}
        >
          <Plus className="h-3.5 w-3.5" /> Add member
        </button>
      </div>

      <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "16px" }}>
        <div className="flex justify-between text-xs mb-2" style={{ color: "#777777" }}>
          <span>Vault capacity</span>
          <span>{assignedSlots} / {VAULT_CAPACITY} slots assigned</span>
        </div>
        <div style={{ height: "4px", backgroundColor: "#d8d6d0", overflow: "hidden" }}>
          <div style={{ height: "100%", backgroundColor: "#1E4D5A", width: `${Math.min((assignedSlots / VAULT_CAPACITY) * 100, 100)}%`, transition: "width 0.3s" }} />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "#777777" }} />
        <input style={{ ...inputStyle, paddingLeft: "34px" }} placeholder="Search by name, email or phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ background: "none", border: "none", cursor: "pointer", color: "#777777" }}>
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {editing && (
        <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "24px" }}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm" style={{ color: "#0A242C" }}>{editing === "new" ? "New member" : "Edit member"}</p>
            <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "#777777" }}><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "name",             label: "Full name *",      type: "text",  placeholder: "Member name" },
              { key: "email",            label: "Email *",          type: "email", placeholder: "email@example.com" },
              { key: "phone",            label: "Phone",            type: "text",  placeholder: "Phone number" },
              { key: "membership_start", label: "Membership start", type: "date" },
              { key: "membership_tier",  label: "Tier",             type: "text",  placeholder: "e.g. Cellar 12" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input type={type} style={inputStyle} value={form[key]} onChange={(e) => f(key, e.target.value)} placeholder={placeholder} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...inputStyle, minHeight: "72px", resize: "none" }} value={form.notes} onChange={(e) => f("notes", e.target.value)} placeholder="Any notes about this member..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.email}
              style={{ padding: "8px 20px", backgroundColor: saving || !form.name || !form.email ? "#d8d6d0" : "#1E4D5A", color: saving || !form.name || !form.email ? "#777777" : "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: saving || !form.name || !form.email ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save member
            </button>
            <button onClick={close} style={{ padding: "8px 16px", backgroundColor: "transparent", color: "#1E4D5A", border: "1px solid #1E4D5A", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {members.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#777777" }}>
          <p className="text-sm">No active members.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: "#777777" }}>
          <p className="text-sm">No members match "{search}"</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <div key={m.id} style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "16px" }} className="flex items-center gap-4">
              <div className="h-9 w-9 shrink-0 flex items-center justify-center" style={{ backgroundColor: "#d8d6d0" }}>
                <span style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: "14px", color: "#1E4D5A" }}>{m.name?.[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm" style={{ color: "#0A242C" }}>{m.name}</p>
                  {m.membership_tier && <span className="text-xs" style={{ color: "#777777" }}>· {m.membership_tier}</span>}
                </div>
                <p className="text-xs mt-0.5" style={{ color: "#777777" }}>{m.email}{m.phone ? ` · ${m.phone}` : ""}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Link to={`/cellar/${m.id}`}>
                  <button style={{ padding: "4px 10px", backgroundColor: "transparent", color: "#1E4D5A", border: "1px solid #1E4D5A", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                    <ExternalLink className="h-3 w-3" /> View
                  </button>
                </Link>
                <button onClick={() => openEdit(m)} style={{ padding: "4px 8px", backgroundColor: "transparent", border: "1px solid #d8d6d0", cursor: "pointer", color: "#777777" }}>
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDeactivate(m.id)} style={{ padding: "4px 8px", backgroundColor: "transparent", border: "1px solid #d8d6d0", cursor: "pointer", color: "#777777" }}>
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