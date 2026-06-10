import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, X, QrCode, Camera, Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import BottleQRModal from "./BottleQRModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BLANK = { wine_name: "", producer: "", vintage: "", type: "Red", notes: "" };
const TYPES = ["Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified", "Other"];

const inputStyle = { backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "13px", padding: "8px 11px", color: "#0A242C", width: "100%", outline: "none", transition: "border-color 0.15s" };
const labelStyle = { display: "block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#777777", marginBottom: "4px", fontFamily: "'Courier New', Courier, monospace" };

function slotLabel(slot) {
  return `${slot.section}-${slot.row_label}${String(slot.column_number).padStart(2, "0")}`;
}

function PhotoUploadField({ label, file, previewUrl, onChange, required = false }) {
  const inputRef = useRef(null);
  return (
    <div>
      <label style={labelStyle}>{label}{required ? " *" : ""}</label>
      <div
        onClick={() => inputRef.current?.click()}
        style={{ border: "1px dashed #d8d6d0", backgroundColor: "#f3f2ee", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80px", overflow: "hidden" }}
      >
        {previewUrl ? (
          <img src={previewUrl} alt={label} style={{ width: "100%", height: "80px", objectFit: "cover" }} />
        ) : (
          <div style={{ textAlign: "center", padding: "12px" }}>
            <Camera className="h-4 w-4 mx-auto mb-1" style={{ color: "#777777" }} />
            <p style={{ fontSize: "10px", color: "#777777", fontFamily: "'Courier New', Courier, monospace", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {file ? file.name : "Upload photo"}
            </p>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onChange(e.target.files?.[0] || null)} />
      </div>
    </div>
  );
}

function BottleModal({ slot, bottle, assignedSlots, storedBottles, member, onClose, onSaved, uploadImage }) {
  const isEdit = !!bottle;
  const [form, setForm] = useState(
    isEdit
      ? { wine_name: bottle.wine_name || "", producer: bottle.producer || "", vintage: bottle.vintage || "", type: bottle.type || "Red", notes: bottle.notes || "" }
      : { ...BLANK }
  );
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState(isEdit ? bottle.image_front_url || null : null);
  const [backPreview, setBackPreview] = useState(isEdit ? bottle.image_back_url || null : null);
  const [saving, setSaving] = useState(false);

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const canSave = form.wine_name && (isEdit || (frontFile && backFile));

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);

    if (isEdit) {
      const { error } = await supabase.from("cellar_bottles").update({
        wine_name: form.wine_name,
        producer: form.producer || null,
        vintage: form.vintage || null,
        type: form.type,
        notes: form.notes || null,
      }).eq("id", bottle.id);

      if (error) { toast.error("Failed to update bottle"); setSaving(false); return; }

      if (frontFile || backFile) {
        try {
          const updates = {};
          if (frontFile) updates.image_front_url = await uploadImage(frontFile, bottle.id, "front");
          if (backFile) updates.image_back_url = await uploadImage(backFile, bottle.id, "back");
          if (Object.keys(updates).length > 0) {
            await supabase.from("cellar_bottles").update(updates).eq("id", bottle.id);
          }
        } catch { toast.error("Details saved but photos failed to upload"); }
      }

      toast.success("Bottle updated");
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("cellar_bottles")
        .insert({ ...form, slot_id: slot.id, member_id: member.id, status: "stored", quantity: 1 })
        .select()
        .single();

      if (insertError || !inserted) { toast.error("Failed to add bottle"); setSaving(false); return; }

      try {
        const frontUrl = await uploadImage(frontFile, inserted.id, "front");
        const backUrl = await uploadImage(backFile, inserted.id, "back");
        await supabase.from("cellar_bottles").update({ image_front_url: frontUrl, image_back_url: backUrl }).eq("id", inserted.id);
      } catch { toast.error("Bottle saved but photos failed to upload"); }

      toast.success("Bottle added");
    }

    setSaving(false);
    onSaved();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(10,36,44,0.6)" }} />
      <div
        style={{ position: "relative", backgroundColor: "#f3f2ee", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto", padding: "28px", fontFamily: "'Courier New', Courier, monospace" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: "#777777" }}>{isEdit ? "Edit bottle" : "Add bottle"}</p>
            <p className="text-sm mt-0.5" style={{ color: "#1E4D5A" }}>{slotLabel(slot)}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#777777" }}><X className="h-4 w-4" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label style={labelStyle}>Wine name *</label>
            <input style={inputStyle} value={form.wine_name} onChange={(e) => f("wine_name", e.target.value)} placeholder="e.g. Château Margaux" />
          </div>
          <div>
            <label style={labelStyle}>Producer</label>
            <input style={inputStyle} value={form.producer} onChange={(e) => f("producer", e.target.value)} placeholder="Producer" />
          </div>
          <div>
            <label style={labelStyle}>Vintage</label>
            <input style={inputStyle} value={form.vintage} onChange={(e) => f("vintage", e.target.value)} placeholder="e.g. 2018" />
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
          <div>
            <PhotoUploadField
              label="Front label"
              file={frontFile}
              previewUrl={frontPreview}
              onChange={(file) => { setFrontFile(file); setFrontPreview(file ? URL.createObjectURL(file) : null); }}
              required={!isEdit}
            />
          </div>
          <div>
            <PhotoUploadField
              label="Back label"
              file={backFile}
              previewUrl={backPreview}
              onChange={(file) => { setBackFile(file); setBackPreview(file ? URL.createObjectURL(file) : null); }}
              required={!isEdit}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={handleSave}
            disabled={saving || !canSave}
            style={{ padding: "8px 20px", backgroundColor: saving || !canSave ? "#d8d6d0" : "#1E4D5A", color: saving || !canSave ? "#777777" : "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: saving || !canSave ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "5px" }}
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} {isEdit ? "Save changes" : "Add bottle"}
          </button>
          <button onClick={onClose} style={{ padding: "8px 16px", backgroundColor: "transparent", color: "#777777", border: "1px solid #d8d6d0", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function MemberBottles({ member, onBottleCountChange }) {
  const [storedBottles, setStoredBottles] = useState([]);
  const [consumedBottles, setConsumedBottles] = useState([]);
  const [assignedSlots, setAssignedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalSlot, setModalSlot] = useState(null);
  const [modalBottle, setModalBottle] = useState(null);
  const [qrBottle, setQrBottle] = useState(null);
  const [qrSlotLabel, setQrSlotLabel] = useState("");

  const load = async () => {
    const [{ data: bottleData }, { data: slotData }] = await Promise.all([
      supabase.from("cellar_bottles").select().eq("member_id", member.id).order("created_at", { ascending: false }),
      supabase.from("vault_slots").select("id, section, row_label, column_number, status").eq("member_id", member.id).in("status", ["assigned", "pending_release"]).order("row_label", { ascending: true }).order("column_number", { ascending: true }),
    ]);

    const all = bottleData || [];
    const stored = all.filter(b => b.status === "stored");
    const consumed = all.filter(b => b.status === "consumed" || b.status === "checked_out");

    setStoredBottles(stored);
    setConsumedBottles(consumed);
    setAssignedSlots(slotData || []);
    setLoading(false);

    const count = stored.length;
    onBottleCountChange?.(count);

    await supabase.from("cellar_members").update({ bottles_stored: count }).eq("id", member.id);
  };

  useEffect(() => { load(); }, [member.id]);

  const uploadImage = async (file, bottleId, side) => {
    const ext = file.name.split(".").pop();
    const path = `bottles/${bottleId}/${side}.${ext}`;
    const { error } = await supabase.storage.from("cellar-bottles").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("cellar-bottles").getPublicUrl(path);
    return data.publicUrl;
  };

  const getBottleForSlot = (slotId) => storedBottles.find(b => b.slot_id === slotId) || null;

  const handleCheckOut = async (bottleId, slotId) => {
    const { error } = await supabase.from("cellar_bottles").update({ status: "consumed", checked_out_at: new Date().toISOString() }).eq("id", bottleId);
    if (!error) {
      await load();
      toast.success("Bottle checked out");

      if (member.status === "inactive") {
        const { data: remaining } = await supabase.from("cellar_bottles").select("id").eq("member_id", member.id).eq("status", "stored");
        if (!remaining || remaining.length === 0) {
          await supabase.from("vault_slots").update({ status: "available", member_id: null, updated_at: new Date().toISOString() }).eq("member_id", member.id).eq("status", "pending_release");
          toast.success("All bottles collected — vault slots released");
        }
      }
    }
  };

  const closeModal = () => { setModalSlot(null); setModalBottle(null); };

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin" style={{ color: "#1E4D5A" }} /></div>;

  const total = storedBottles.length;

  return (
    <div className="space-y-5" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      {(modalSlot || modalBottle) && (
        <BottleModal
          slot={modalSlot}
          bottle={modalBottle}
          assignedSlots={assignedSlots}
          storedBottles={storedBottles}
          member={member}
          onClose={closeModal}
          onSaved={() => { closeModal(); load(); }}
          uploadImage={uploadImage}
        />
      )}
      {qrBottle && (
        <BottleQRModal
          bottle={qrBottle}
          member={member}
          slotLabel={qrSlotLabel}
          onClose={() => { setQrBottle(null); setQrSlotLabel(""); }}
        />
      )}

      <p className="text-xs" style={{ color: "#777777" }}>{total} bottle{total !== 1 ? "s" : ""} stored · {assignedSlots.length} slot{assignedSlots.length !== 1 ? "s" : ""} assigned</p>

      {assignedSlots.length === 0 ? (
        <p className="text-xs text-center py-8" style={{ color: "#777777" }}>No vault slots assigned to this member.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {assignedSlots.map((slot) => {
            const bottle = getBottleForSlot(slot.id);
            const label = slotLabel(slot);

            if (bottle) {
              return (
                <div key={slot.id} style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", overflow: "hidden" }}>
                  <div
                    style={{ position: "relative", paddingBottom: "130%", backgroundColor: "#d8d6d0", overflow: "hidden", cursor: "pointer" }}
                    onClick={() => { setModalSlot(slot); setModalBottle(bottle); }}
                  >
                    {bottle.image_front_url ? (
                      <img src={bottle.image_front_url} alt={bottle.wine_name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <p style={{ fontSize: "10px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em" }}>No image</p>
                      </div>
                    )}
                    <div style={{ position: "absolute", top: "6px", left: "6px", backgroundColor: "rgba(10,36,44,0.7)", padding: "2px 6px" }}>
                      <p style={{ fontSize: "9px", color: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", letterSpacing: "0.06em" }}>{label}</p>
                    </div>
                  </div>
                  <div style={{ padding: "8px" }}>
                    <p style={{ fontSize: "11px", color: "#0A242C", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{bottle.wine_name}</p>
                    <p style={{ fontSize: "10px", color: "#777777" }}>{[bottle.vintage, bottle.type].filter(Boolean).join(" · ")}</p>
                    <div className="flex items-center gap-2 mt-2" style={{ borderTop: "1px solid #d8d6d0", paddingTop: "8px" }}>
                      <button onClick={() => { setModalSlot(slot); setModalBottle(bottle); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#777777", padding: "2px" }} title="Edit bottle">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => { setQrBottle(bottle); setQrSlotLabel(label); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#777777", padding: "2px" }}
                        title="QR label"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleCheckOut(bottle.id, slot.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#777777", padding: "2px" }} title="Check out">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={slot.id}
                onClick={() => setModalSlot(slot)}
                style={{ backgroundColor: "#f3f2ee", border: "1px dashed #d8d6d0", overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "180px", transition: "border-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#1E4D5A"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#d8d6d0"}
              >
                <p style={{ fontSize: "10px", color: "#1E4D5A", fontFamily: "'Courier New', Courier, monospace", letterSpacing: "0.06em", marginBottom: "8px" }}>{label}</p>
                <div style={{ width: "28px", height: "28px", border: "1px solid #d8d6d0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plus className="h-3.5 w-3.5" style={{ color: "#777777" }} />
                </div>
                <p style={{ fontSize: "9px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "6px" }}>Add bottle</p>
              </div>
            );
          })}
        </div>
      )}

      {consumedBottles.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest mb-3 mt-4" style={{ color: "#777777" }}>History</p>
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
                    <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>Checked out {format(parseISO(b.checked_out_at), "d MMM yyyy")}</p>
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