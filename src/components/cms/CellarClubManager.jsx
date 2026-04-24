import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const inputStyle = {
  backgroundColor: "#f3f2ee",
  border: "1px solid #d8d6d0",
  borderRadius: "6px",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "13px",
  padding: "9px 12px",
  color: "#2e282a",
  width: "100%",
  outline: "none"
};

const labelStyle = {
  display: "block",
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#777777",
  marginBottom: "5px",
  fontFamily: "'Courier New', Courier, monospace"
};

const BLANK = {
  name: "",
  email: "",
  phone: "",
  membership_start: "",
  membership_tier: "",
  status: "pending",
  notes: ""
};

const VAULT_CAPACITY = 1152;

export default function CellarClubManager() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);

    const { data: membersData } = await supabase.from("cellar_members").select("*");
    const { data: bottlesData } = await supabase.from("cellar_bottles").select("member_id");

    const withCounts = (membersData || []).map((m) => ({
      ...m,
      bottle_count: bottlesData?.filter((b) => b.member_id === m.id).length || 0
    }));

    setMembers(withCounts);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setForm(BLANK);
    setEditing("new");
  };

  const openEdit = (m) => {
    setForm({
      name: m.name || "",
      email: m.email || "",
      phone: m.phone || "",
      membership_start: m.membership_start || "",
      membership_tier: m.membership_tier || "",
      status: m.status || "pending",
      notes: m.notes || ""
    });
    setEditing(m);
  };

  const close = () => setEditing(null);

  const f = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return;

    setSaving(true);

    const payload = { ...form };

    if (editing === "new") {
      const { error } = await supabase.from("cellar_members").insert(payload);
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("cellar_members")
        .update(payload)
        .eq("id", editing.id);

      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
    }

    await load();
    setSaving(false);
    setEditing(null);
    toast.success("Saved");
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("cellar_members").delete().eq("id", id);
    if (!error) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Removed");
    }
  };

  const totalBottles = members
    .filter((m) => m.status === "active")
    .reduce((s, m) => s + (m.bottle_count || 0), 0);

  const filtered = members.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (m.name || "").toLowerCase().includes(q) ||
      (m.email || "").toLowerCase().includes(q) ||
      (m.phone || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#193c47" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "'Courier New', Courier, monospace" }}>

      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "#777777" }}>
          {members.filter(m => m.status === "active").length} active members · {totalBottles} / {VAULT_CAPACITY} bottles stored
        </p>

        <button onClick={openNew} style={{
          padding: "8px 16px",
          backgroundColor: "#193c47",
          color: "#f3f2ee",
          border: "none",
          borderRadius: "6px",
          fontSize: "12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          <Plus className="h-3.5 w-3.5" /> Add member
        </button>
      </div>

      <div style={{
        backgroundColor: "#eceae4",
        border: "1px solid #d8d6d0",
        borderRadius: "6px",
        padding: "16px"
      }}>
        <div className="flex justify-between text-xs mb-2" style={{ color: "#777777" }}>
          <span>Vault capacity</span>
          <span>{totalBottles} / {VAULT_CAPACITY}</span>
        </div>

        <div style={{ height: "4px", backgroundColor: "#d8d6d0", borderRadius: "2px" }}>
          <div style={{
            height: "100%",
            width: `${Math.min((totalBottles / VAULT_CAPACITY) * 100, 100)}%`,
            backgroundColor: "#193c47"
          }} />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "#777777" }} />
        <input
          style={{ ...inputStyle, paddingLeft: "34px" }}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {editing && (
  <div style={{
    backgroundColor: "#eceae4",
    border: "1px solid #d8d6d0",
    borderRadius: "6px",
    padding: "24px"
  }}>
    <div className="flex items-center justify-between mb-5">
      <p className="text-sm" style={{ color: "#2e282a" }}>
        {editing === "new" ? "New member" : "Edit member"}
      </p>
      <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "#777777" }}>
        <X className="h-4 w-4" />
      </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      
      <div>
        <label style={labelStyle}>Full name *</label>
        <input
          type="text"
          style={inputStyle}
          placeholder="Member name"
          value={form.name}
          onChange={(e) => f("name", e.target.value)}
        />
      </div>

      <div>
        <label style={labelStyle}>Email *</label>
        <input
          type="email"
          style={inputStyle}
          placeholder="email@example.com"
          value={form.email}
          onChange={(e) => f("email", e.target.value)}
        />
      </div>

      <div>
        <label style={labelStyle}>Phone</label>
        <input
          type="text"
          style={inputStyle}
          placeholder="Phone number"
          value={form.phone}
          onChange={(e) => f("phone", e.target.value)}
        />
      </div>

      <div>
        <label style={labelStyle}>Membership start</label>
        <input
          type="date"
          style={inputStyle}
          value={form.membership_start}
          onChange={(e) => f("membership_start", e.target.value)}
        />
      </div>

      <div>
        <label style={labelStyle}>Membership tier</label>
        <input
          type="text"
          style={inputStyle}
          placeholder="e.g. Cellar 6"
          value={form.membership_tier}
          onChange={(e) => f("membership_tier", e.target.value)}
        />
      </div>

      <div>
        <label style={labelStyle}>Status</label>
        <select
          style={inputStyle}
          value={form.status}
          onChange={(e) => f("status", e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="sm:col-span-2">
        <label style={labelStyle}>Notes</label>
        <textarea
          style={{ ...inputStyle, minHeight: "72px", resize: "none" }}
          placeholder="Any notes about this member..."
          value={form.notes}
          onChange={(e) => f("notes", e.target.value)}
        />
      </div>

    </div>

    <div className="flex gap-2 mt-4">
      <button
        onClick={handleSave}
        disabled={saving || !form.name || !form.email}
        style={{
          padding: "8px 20px",
          backgroundColor: saving || !form.name || !form.email ? "#d8d6d0" : "#193c47",
          color: saving || !form.name || !form.email ? "#777777" : "#f3f2ee",
          border: "none",
          borderRadius: "6px",
          fontSize: "12px",
          cursor: saving || !form.name || !form.email ? "not-allowed" : "pointer"
        }}
      >
        {saving ? "Saving..." : "Save member"}
      </button>

      <button
        onClick={close}
        style={{
          padding: "8px 16px",
          backgroundColor: "transparent",
          color: "#193c47",
          border: "1px solid #193c47",
          borderRadius: "6px",
          fontSize: "12px",
          cursor: "pointer"
        }}
      >
        Cancel
      </button>
    </div>
  </div>
)}

      {filtered.map((m) => (
        <div key={m.id} style={{ backgroundColor: "#eceae4", padding: "12px", borderRadius: "6px" }}>
          <div className="flex justify-between">
            <div>
              <p>{m.name}</p>
              <p className="text-xs">{m.email}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(m)}><Pencil size={14} /></button>
              <button onClick={() => handleDelete(m.id)}><Trash2 size={14} /></button>
            </div>
          </div>
        </div>
      ))}

    </div>
  );
}