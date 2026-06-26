import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, ArrowLeft, Pencil, Check, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import MemberBottles from "../components/cms/MemberBottles";

const CORPORATE_LIMITS = {
  "Corporate 6": 1,
  "Corporate 12": 2,
  "Corporate 18": 3,
  "Corporate 24": 4,
};

const inputStyle = {
  backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "6px",
  fontFamily: "'Courier New', Courier, monospace", fontSize: "13px",
  padding: "8px 11px", color: "#0A242C", width: "100%", outline: "none",
};
const labelStyle = {
  display: "block", fontSize: "10px", textTransform: "uppercase",
  letterSpacing: "0.08em", color: "#777777", marginBottom: "4px",
  fontFamily: "'Courier New', Courier, monospace",
};

export default function CellarMemberDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [fieldValue, setFieldValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [bottleCount, setBottleCount] = useState(0);
  const [authorisedUsers, setAuthorisedUsers] = useState([]);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotForm, setSlotForm] = useState({ name: "", email: "", mobile: "" });
  const [savingSlot, setSavingSlot] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('cellar_members')
        .select()
        .eq('id', id)
        .single();
      setMember(data || null);
      if (data) {
        const { data: authUsers } = await supabase
          .from('cellar_authorised_users')
          .select()
          .eq('member_id', data.id)
          .order('added_at', { ascending: true });
        setAuthorisedUsers(authUsers || []);
      }
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

  const isAdmin = user?.user_metadata?.role === "admin";
  const isCorporate = member ? Object.prototype.hasOwnProperty.call(CORPORATE_LIMITS, member.membership_tier) : false;
  const slotLimit = member ? (CORPORATE_LIMITS[member.membership_tier] || 0) : 0;

  const isLocked = (row) => {
    if (!row?.last_changed_at) return false;
    const unlockTime = new Date(row.last_changed_at).getTime() + 28 * 24 * 60 * 60 * 1000;
    return Date.now() < unlockTime;
  };

  const unlockDateLabel = (row) => {
    const unlockTime = new Date(row.last_changed_at).getTime() + 28 * 24 * 60 * 60 * 1000;
    return format(new Date(unlockTime), "d MMM yyyy");
  };

  const startEditSlot = (index, row) => {
    setEditingSlot(index);
    setSlotForm({ name: row?.name || "", email: row?.email || "", mobile: row?.mobile || "" });
  };

  const cancelEditSlot = () => {
    setEditingSlot(null);
    setSlotForm({ name: "", email: "", mobile: "" });
  };

  const saveSlot = async (index) => {
    if (!slotForm.name.trim() || !slotForm.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setSavingSlot(true);
    const existing = authorisedUsers[index];
    const now = new Date().toISOString();

    if (existing) {
      const { error } = await supabase
        .from("cellar_authorised_users")
        .update({ name: slotForm.name, email: slotForm.email, mobile: slotForm.mobile || null, last_changed_at: now })
        .eq("id", existing.id);
      if (error) {
        toast.error("Failed to save");
      } else {
        setAuthorisedUsers((prev) => {
          const next = [...prev];
          next[index] = { ...existing, name: slotForm.name, email: slotForm.email, mobile: slotForm.mobile || null, last_changed_at: now };
          return next;
        });
        toast.success("Saved");
        setEditingSlot(null);
      }
    } else {
      const { data, error } = await supabase
        .from("cellar_authorised_users")
        .insert({ member_id: member.id, name: slotForm.name, email: slotForm.email, mobile: slotForm.mobile || null, added_at: now, last_changed_at: now })
        .select()
        .single();
      if (error) {
        toast.error("Failed to save");
      } else {
        setAuthorisedUsers((prev) => {
          const next = [...prev];
          next[index] = data;
          return next;
        });
        toast.success("Saved");
        setEditingSlot(null);
      }
    }
    setSavingSlot(false);
  };

  if (loading) return (
    <div className="flex justify-center py-24">
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#1E4D5A" }} />
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
    { key: "birthday",         label: "Date of birth",    type: "date" },
    { key: "address_line1",    label: "Address",          type: "text" },
    { key: "postcode",         label: "Postcode",         type: "text" },
    { key: "membership_tier",  label: "Membership tier",  type: "text" },
    { key: "membership_start", label: "Membership start", type: "date" },
  ];

  const formatValue = (key, val) => {
    if (!val) return null;
    if (key === "membership_start" || key === "birthday") {
      try { return format(parseISO(val), "d MMM yyyy"); } catch { return val; }
    }
    return val;
  };

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh" }}>
      <div className="max-w-[1100px] mx-auto px-6 py-10">

        <Link
          to="/admin"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#777777", textDecoration: "none", marginBottom: "24px", transition: "color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#0A242C"}
          onMouseLeave={e => e.currentTarget.style.color = "#777777"}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to admin
        </Link>

        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <div className="h-14 w-14 shrink-0 flex items-center justify-center" style={{ backgroundColor: "#d8d6d0" }}>
            <span style={{ fontSize: "22px", color: "#1E4D5A" }}>{member.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl" style={{ color: "#0A242C", fontWeight: 400 }}>{member.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span style={{ backgroundColor: "#eaf0ec", color: "#2e6b45", border: "1px solid #c8dace", fontSize: "10px", padding: "2px 9px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Active
              </span>
              {member.membership_tier && <span className="text-xs" style={{ color: "#777777" }}>· {member.membership_tier}</span>}
              {member.billing_interval && <span className="text-xs" style={{ color: "#777777" }}>· {member.billing_interval === "year" ? "Annual" : "Monthly"}</span>}
              <span className="text-xs" style={{ color: "#777777" }}>· {bottleCount} bottles stored</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "24px" }}>
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
                        style={{ padding: "6px 10px", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
                      >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{ padding: "6px 10px", backgroundColor: "transparent", color: "#777777", border: "1px solid #d8d6d0", cursor: "pointer" }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group">
                      <p className="text-sm" style={{ color: member[key] ? "#0A242C" : "#777777" }}>
                        {formatValue(key, member[key]) || <span style={{ color: "#777777" }}>Not set</span>}
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
                        style={{ padding: "6px 14px", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
                      >
                        {saving && <Loader2 className="h-3 w-3 animate-spin" />} Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{ padding: "6px 14px", backgroundColor: "transparent", color: "#777777", border: "1px solid #d8d6d0", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between group">
                    <p className="text-sm leading-relaxed" style={{ color: member.notes ? "#0A242C" : "#777777" }}>
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

          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "24px" }}>
            <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "#777777" }}>Bottle inventory</p>
            <MemberBottles member={member} onBottleCountChange={setBottleCount} />
          </div>
        </div>

        {isAdmin && isCorporate && (
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "24px", marginTop: "24px" }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#777777" }}>Authorised users</p>
            <p className="text-xs mb-5" style={{ color: "#777777" }}>
              {member.membership_tier} allows {slotLimit} authorised user{slotLimit !== 1 ? "s" : ""}. Adding or changing an authorised user locks that slot for 28 days.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {Array.from({ length: slotLimit }).map((_, index) => {
                const row = authorisedUsers[index] || null;
                const locked = row && isLocked(row);
                const isEditing = editingSlot === index;

                return (
                  <div key={index} style={{ backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", padding: "16px" }}>
                    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#777777" }}>Authorised user {index + 1}</p>

                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label style={labelStyle}>Name</label>
                          <input style={inputStyle} value={slotForm.name} onChange={(e) => setSlotForm((f) => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div>
                          <label style={labelStyle}>Email</label>
                          <input type="email" style={inputStyle} value={slotForm.email} onChange={(e) => setSlotForm((f) => ({ ...f, email: e.target.value }))} />
                        </div>
                        <div>
                          <label style={labelStyle}>Mobile</label>
                          <input style={inputStyle} value={slotForm.mobile} onChange={(e) => setSlotForm((f) => ({ ...f, mobile: e.target.value }))} />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveSlot(index)}
                            disabled={savingSlot}
                            style={{ padding: "8px 18px", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                          >
                            {savingSlot && <Loader2 className="h-3 w-3 animate-spin" />} Save
                          </button>
                          <button
                            onClick={cancelEditSlot}
                            style={{ padding: "8px 16px", backgroundColor: "transparent", color: "#777777", border: "1px solid #d8d6d0", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : row ? (
                      <div>
                        <p className="text-sm" style={{ color: "#0A242C" }}>{row.name}</p>
                        <p className="text-xs mt-1" style={{ color: "#777777" }}>{row.email}{row.mobile ? ` · ${row.mobile}` : ""}</p>
                        {locked ? (
                          <p className="text-xs mt-2" style={{ color: "#777777" }}>Locked until {unlockDateLabel(row)}</p>
                        ) : (
                          <button
                            onClick={() => startEditSlot(index, row)}
                            style={{ marginTop: "8px", fontSize: "11px", color: "#1E4D5A", background: "none", border: "none", cursor: "pointer", fontFamily: "'Courier New', Courier, monospace", textTransform: "uppercase", letterSpacing: "0.06em", textDecoration: "underline", padding: 0 }}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditSlot(index, null)}
                        style={{ fontSize: "11px", color: "#1E4D5A", background: "none", border: "none", cursor: "pointer", fontFamily: "'Courier New', Courier, monospace", textTransform: "uppercase", letterSpacing: "0.06em", textDecoration: "underline", padding: 0 }}
                      >
                        Add authorised user
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}