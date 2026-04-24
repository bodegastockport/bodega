import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Loader2, Plus, Pencil, Trash2, X, Search, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const inputStyle = { backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "13px", padding: "9px 12px", color: "#2e282a", width: "100%", outline: "none", transition: "border-color 0.15s" };
const labelStyle = { display: "block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#777777", marginBottom: "5px", fontFamily: "'Courier New', Courier, monospace" };

const STATUS_LABEL = { active: "Active", pending: "Pending", inactive: "Inactive" };
const STATUS_STYLE = {
  active:   { backgroundColor: "#eaf0ec", color: "#2e6b45", border: "1px solid #c8dace" },
  pending:  { backgroundColor: "#f0ede8", color: "#777777", border: "1px solid #d8d6d0" },
  inactive: { backgroundColor: "#eceae4", color: "#777777", border: "1px solid #d8d6d0" },
};

const BLANK = { name: "", email: "", phone: "", membership_start: "", notes: "", status: "pending", membership_tier: "" };
const VAULT_CAPACITY = 1152;

export default function CellarClubManager() {
  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(BLANK);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState("");

  const load = async () => {
    const { data } = await supabase
      .from('cellar_members')
      .select()
      .order('created_at', { ascending: false });
    setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew  = () => { setForm(BLANK); setEditing("new"); };
  const openEdit = (m) => {
    setForm({
      name:             m.name,
      email:            m.email,
      phone:            m.phone            || "",
      membership_start: m.membership_start || "",
      notes:            m.notes            || "",
      status:           m.status           || "pending",
      membership_tier:  m.membership_tier  || "",
    });
    setEditing(m);
  };
  const close = () => setEditing(null);
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    if (editing === "new") {
      const { error } = await supabase.from('cellar_members').insert(form);
      if (error) { toast.error("Failed to add member"); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('cellar_members').update(form).eq('id', editing.id);
      if (error) { toast.error("Failed to update member"); setSaving(false); return; }
    }
    await load();
    setSaving(false);
    setEditing(null);
    toast.success(editing === "new" ? "Member added" : "Member updated");
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('cellar_members').delete().eq('id', id);
    if (!error) {
      setMembers((p) => p.filter((m) => m.id !== id));
      toast.success("Member removed");
    }
  };

  const totalBottles = members
    .filter(m => m.status === "active")
    .reduce((s, m) => s + (m.bottles_stored || 0), 0);

  const filtered = members.filter(m => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (m.name  || "").toLowerCase().includes(q) ||
      (m.email || "").toLowerCase().includes(q) ||
      (m.phone || "").toLowerCase().includes(q)
    );
  });

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#193c47" }} />
    </div>
  );

  return (
    <div className="space-y-6" style={{ fontFamily: "'Courier New', Courier, monospace" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "#777777" }}>
          {members.filter(m => m.status === "active").length} active members · {totalBottles} / {VAULT_CAPACITY} bottles stored
        </p>
        <button
          onClick={openNew}
          style={{ padding: "8px 16px", backgroundColor: "#193c47", color: "#f3f2ee", border: "none", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", transition: "background-color 0.15s", display: "flex", alignItems: "center", gap: "6px" }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2d6272"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#193c47"}
        >
          <Plus className="h-3.5 w-3.5" /> Add member
        </button>
      </div>

      {/* Vault capacity bar */}
      <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "16px" }}>
        <div className="flex justify-between text-xs mb-2" style={{ color: "#777777" }}>
          <span>Vault capacity</span>
          <span>{totalBottles} / {VAULT_CAPACITY} bottles</span>
        </div>
        <div style={{ height: "4px", backgroundColor: "#d8d6d0", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ height: "100%", backgroundColor: "#193c47", borderRadius: "2px", width: `${Math.min((totalBottles / VAULT_CAPACITY) * 100, 100)}%`, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "#777777" }} />
        <input
          style={{ ...inputStyle, paddingLeft: "34px" }}
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ background: "none", border: "none", cursor: "pointer", color: "#777777" }}>
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Form */}
      {editing && (
        <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "24px" }}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm" style={{ color: "#2e282a" }}>{editing === "new" ? "New member" : "Edit member"}</p>
            <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "#777777" }}><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "name",             label: "Full name *",       type: "text",  placeholder: "Member name" },
              { key: "email",            label: "Email *",           type: "email", placeholder: "email@example.com" },
              { key: "phone",            label: "Phone",             type: "text",  placeholder: "Phone number" },
              { key: "membership_start", label: "Membership start",  type: "date",  placeholder: "" },
              { key: "membership_tier",  label: "Tier",              type: "text",  placeholder: "e.g. Cellar 12" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input type={type} style={inputStyle} value={form[key]} onChange={(e) => f(key, e.target.value)} placeholder={placeholder} />
              </div>
            ))}
            <div>
              <label style={labelStyle}>Status</label>
              <Select value={form.status} onValueChange={(v) => f("status", v)}>
                <SelectTrigger style={{ ...inputStyle, height: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...inputStyle, minHeight: "72px", resize: "none" }} value={form.notes} onChange={(e) => f("notes", e.target.value)} placeholder="Any notes about this member..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.email}
              style={{ padding: "8px 20px", backgroundColor: saving || !form.name || !form.email ? "#d8d6d0" : "#193c47", color: saving || !form.name || !form.email ? "#777777" : "#f3f2ee", border: "none", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: saving || !form.name || !form.email ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save member
            </button>
            <button onClick={close} style={{ padding: "8px 16px", backgroundColor: "transparent", color: "#193c47", border: "1px solid #193c47", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Members list */}
      {members.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#777777" }}>
          <p className="text-sm">No members yet.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: "#777777" }}>
          <p className="text-sm">No members match "{search}"</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <div key={m.id} style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "16px" }} className="flex items-center gap-4">
              <div className="h-9 w-9 rounded shrink-0 flex items-center justify-center" style={{ backgroundColor: "#d8d6d0" }}>
                <span style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: "14px", color: "#193c47" }}>{m.name?.[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm" style={{ color: "#2e282a" }}>{m.name}</p>
                  <span style={{ ...STATUS_STYLE[m.status || "pending"], fontSize: "10px", padding: "2px 8px", borderRadius: "3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {STATUS_LABEL[m.status || "pending"]}
                  </span>
                  {m.membership_tier && <span className="text-xs" style={{ color: "#777777" }}>· {m.membership_tier}</span>}
                </div>
                <p className="text-xs mt-0.5" style={{ color: "#777777" }}>{m.email}{m.phone ? ` · ${m.phone}` : ""}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Link to={`/cellar/${m.id}`}>
                  <button style={{ padding: "4px 10px", backgroundColor: "transparent", color: "#193c47", border: "1px solid #193c47", borderRadius: "4px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                    <ExternalLink className="h-3 w-3" /> View
                  </button>
                </Link>
                <button onClick={() => openEdit(m)} style={{ padding: "4px 8px", backgroundColor: "transparent", border: "1px solid #d8d6d0", borderRadius: "4px", cursor: "pointer", color: "#777777" }}>
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(m.id)} style={{ padding: "4px 8px", backgroundColor: "transparent", border: "1px solid #d8d6d0", borderRadius: "4px", cursor: "pointer", color: "#777777" }}>
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