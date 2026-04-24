import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, Pencil, Check, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MemberBottles from "../components/cms/MemberBottles";

const inputStyle = {
  backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "6px",
  fontFamily: "'Courier New', Courier, monospace", fontSize: "13px",
  padding: "8px 11px", color: "#2e282a", width: "100%", outline: "none",
};
const labelStyle = {
  display: "block", fontSize: "10px", textTransform: "uppercase",
  letterSpacing: "0.08em", color: "#777777", marginBottom: "4px",
  fontFamily: "'Courier New', Courier, monospace",
};

const STATUS_STYLE = {
  active:   { backgroundColor: "#eaf0ec", color: "#2e6b45", border: "1px solid #c8dace" },
  pending:  { backgroundColor: "#eceae4", color: "#777777", border: "1px solid #d8d6d0" },
  inactive: { backgroundColor: "#eceae4", color: "#777777", border: "1px solid #d8d6d0" },
};

export default function CellarMemberDetail() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [fieldValue, setFieldValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [bottleCount, setBottleCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('cellar_members')
        .select()
        .eq('id', id)
        .single();
      setMember(data || null);
      setLoading(false);
    };
    load();
  }, [id]);

  const startEdit = (field, value) => { setEditingField(field); setFieldValue(value ?? ""); };
  const cancelEdit = () => setEditingField(null);

  const saveField = async (field) => {
    setSaving(true);
    const { error } = await supabase
      .from('cellar_members')
      .update({ [field]: fieldValue })
      .eq('id', member.id);
    if (!error) {
      setMember((m) => ({ ...m, [field]: fieldValue }));
      toast.success("Updated");
    } else {
      toast.error("Failed to save");
    }
    setSaving(false);
    setEditingField(null);
  };

  if (loading) return (
    <div className="flex justify-center py-24">
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#193c47" }} />
    </div>
  );
  if (!member) return (
    <div className="text-center py-24 text-sm" style={{ color: "#777777", fontFamily: "'Courier New', Courier, monospace" }}>
      Member not found.
    </div>
  );

  const fields = [
    { key: "name",             label: "Full name",        type: "text" },
    { key: "email",            label: "Email",            type: "email" },
    { key: "phone",            label: "Phone",            type: "text" },
    { key: "membership_tier",  label: "Membership tier",  type: "text" },
    { key: "membership_start", label: "Membership start", type: "date" },
  ];

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh" }}>
      <div className="max-w-[1100px] mx-auto px-6 py-10">

        <Link
          to="/admin"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#777777", textDecoration: "none", marginBottom: "24px", transition: "color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#2e282a"}
          onMouseLeave={e => e.currentTarget.style.color = "#777777"}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to admin
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <div className="h-14 w-14 rounded shrink-0 flex items-center justify-center" style={{ backgroundColor: "#d8d6d0" }}>
            <span style={{ fontSize: "22px", color: "#193c47" }}>{member.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl" style={{ color: "#2e282a", fontWeight: 400 }}>{member.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span style={{ ...STATUS_STYLE[member.status || "pending"], fontSize: "10px", padding: "2px 9px", borderRadius: "3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {member.status || "pending"}
              </span>
              {member.membership_tier && <span className="text-xs" style={{ color: "#777777" }}>· {member.membership_tier}</span>}
              <span className="text-xs" style={{ color: "#777777" }}>· {bottleCount} bottles stored</span>
            </div>
          </div>
          <div>
            <Select
              value={member.status || "pending"}
              onValueChange={async (v) => {
                const { error } = await supabase
                  .from('cellar_members')
                  .update({ status: v })
                  .eq('id', member.id);
                if (!error) {
                  setMember((m) => ({ ...m, status: v }));
                  toast.success("Status updated");
                }
              }}
            >
              <SelectTrigger style={{ ...inputStyle, width: "140px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Member details */}
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "24px" }}>
            <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "#777777" }}>Member details</p>
            <div className="space-y-4">
              {fields.map(({ key, label, type }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  {editingField === key ? (
                    <div className="flex gap-2">
                      <input
                        type={type}
                        style={{ ...inputStyle, flex: 1 }}
                        value={fieldValue}
                        onChange={(e) => setFieldValue(e.target.value)}
                        autoFocus
                      />
                      <button
                        onClick={() => saveField(key)}
                        disabled={saving}
                        style={{ padding: "6px 10px", backgroundColor: "#193c47", color: "#f3f2ee", border: "none", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center" }}
                      >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{ padding: "6px 10px", backgroundColor: "transparent", color: "#777777", border: "1px solid #d8d6d0", borderRadius: "4px", cursor: "pointer" }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group">
                      <p className="text-sm" style={{ color: member[key] ? "#2e282a" : "#777777" }}>
                        {member[key]
                          ? (key === "membership_start" ? format(parseISO(member[key]), "d MMM yyyy") : member[key])
                          : <span style={{ color: "#777777" }}>Not set</span>
                        }
                      </p>
                      <button
                        onClick={() => startEdit(key, member[key])}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#777777" }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Notes */}
              <div>
                <label style={labelStyle}>Notes</label>
                {editingField === "notes" ? (
                  <div className="space-y-2">
                    <textarea
                      style={{ ...inputStyle, minHeight: "72px", resize: "none" }}
                      value={fieldValue}
                      onChange={(e) => setFieldValue(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveField("notes")}
                        disabled={saving}
                        style={{ padding: "6px 14px", backgroundColor: "#193c47", color: "#f3f2ee", border: "none", borderRadius: "4px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
                      >
                        {saving && <Loader2 className="h-3 w-3 animate-spin" />} Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{ padding: "6px 14px", backgroundColor: "transparent", color: "#777777", border: "1px solid #d8d6d0", borderRadius: "4px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between group">
                    <p className="text-sm leading-relaxed" style={{ color: member.notes ? "#2e282a" : "#777777" }}>
                      {member.notes || "No notes"}
                    </p>
                    <button
                      onClick={() => startEdit("notes", member.notes)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 ml-2 shrink-0"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#777777" }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottle inventory */}
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "24px" }}>
            <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "#777777" }}>Bottle inventory</p>
            <MemberBottles member={member} onBottleCountChange={setBottleCount} />
          </div>
        </div>
      </div>
    </div>
  );
}