import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { toast } from "sonner";

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

      {/* Header */}
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

      {/* Vault bar */}
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "#777777" }} />
        <input
          style={{ ...inputStyle, paddingLeft: "34px" }}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Form */}
      {editing && (
        <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "20px" }}>
          {["name","email","phone","membership_start","membership_tier"].map((key) => (
            <div key={key}>
              <label style={labelStyle}>{key}</label>
              <input style={inputStyle} value={form[key]} onChange={(e) => f(key, e.target.value)} />
            </div>
          ))}

          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} style={{ padding: "8px 16px", background: "#193c47", color: "#fff" }}>
              Save
            </button>
            <button onClick={close}>Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
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