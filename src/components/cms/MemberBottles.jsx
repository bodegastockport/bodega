import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Trash2, X, QrCode, Camera, ZoomIn } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import BottleQRModal from "./BottleQRModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BLANK = { wine_name: "", producer: "", vintage: "", cellar_location: "", type: "Red", notes: "" };
const TYPES = ["Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified", "Other"];

const inputStyle = { backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "13px", padding: "8px 11px", color: "#0A242C", width: "100%", outline: "none", transition: "border-color 0.15s" };
const labelStyle = { display: "block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#777777", marginBottom: "4px", fontFamily: "'Courier New', Courier, monospace" };

function ImageLightbox({ url, label, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(10,36,44,0.92)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", cursor: "pointer" }}
    >
      <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", opacity: 0.6 }}>{label}</p>
      <img
        src={url}
        alt={label}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain", cursor: "default" }}
      />
      <p className="text-xs mt-4" style={{ color: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", opacity: 0.4 }}>Click anywhere to close</p>
    </div>
  );
}

function PhotoUploadField({ label, file, previewUrl, onChange }) {
  const inputRef = useRef(null);
  return (
    <div>
      <label style={labelStyle}>{label} *</label>
      <div
        onClick={() => inputRef.current?.click()}
        style={{ border: "1px dashed #d8d6d0", backgroundColor: "#f3f2ee", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80px", overflow: "hidden", position: "relative" }}
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

function BottleThumbnails({ bottle, onOpen }) {
  if (!bottle.image_front_url && !bottle.image_back_url) return null;
  return (
    <div className="flex gap-1.5 mt-1.5">
      {bottle.image_front_url && (
        <div
          onClick={() => onOpen(bottle.image_front_url, "Front label")}
          style={{ width: "36px", height: "48px", cursor: "pointer", overflow: "hidden", border: "1px solid #d8d6d0", position: "relative", flexShrink: 0 }}
          title="View front label"
        >
          <img src={bottle.image_front_url} alt="Front" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(10,36,44,0)", transition: "background-color 0.15s", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(10,36,44,0.3)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(10,36,44,0)"}
          >
            <ZoomIn className="h-3 w-3" style={{ color: "#f3f2ee", opacity: 0 }} />
          </div>
        </div>
      )}
      {bottle.image_back_url && (
        <div
          onClick={() => onOpen(bottle.image_back_url, "Back label")}
          style={{ width: "36px", height: "48px", cursor: "pointer", overflow: "hidden", border: "1px solid #d8d6d0", position: "relative", flexShrink: 0 }}
          title="View back label"
        >
          <img src={bottle.image_back_url} alt="Back" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(10,36,44,0)", transition: "background-color 0.15s", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(10,36,44,0.3)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(10,36,44,0)"}
          >
            <ZoomIn className="h-3 w-3" style={{ color: "#f3f2ee", opacity: 0 }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function MemberBottles({ member, onBottleCountChange }) {
  const [storedBottles, setStoredBottles] = useState([]);
  const [consumedBottles, setConsumedBottles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [qrBottle, setQrBottle] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [photoBottleId, setPhotoBottleId] = useState(null);
  const [replaceFront, setReplaceFront] = useState(null);
  const [replaceBack, setReplaceBack] = useState(null);
  const [replaceFrontPreview, setReplaceFrontPreview] = useState(null);
  const [replaceBackPreview, setReplaceBackPreview] = useState(null);
  const [replaceSaving, setReplaceSaving] = useState(false);

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

    const count = stored.length;
    onBottleCountChange?.(count);

    await supabase
      .from('cellar_members')
      .update({ bottles_stored: count })
      .eq('id', member.id);
  };

  useEffect(() => { load(); }, [member.id]);

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleFrontChange = (file) => {
    setFrontFile(file);
    setFrontPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleBackChange = (file) => {
    setBackFile(file);
    setBackPreview(file ? URL.createObjectURL(file) : null);
  };

  const uploadImage = async (file, bottleId, side) => {
    const ext = file.name.split('.').pop();
    const path = `bottles/${bottleId}/${side}.${ext}`;
    const { error } = await supabase.storage
      .from('cellar-assets')
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('cellar-assets').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAdd = async () => {
    if (!form.wine_name || !form.cellar_location || !frontFile || !backFile) return;
    setSaving(true);

    const { data: inserted, error: insertError } = await supabase
      .from('cellar_bottles')
      .insert({ ...form, member_id: member.id, status: "stored", quantity: 1 })
      .select()
      .single();

    if (insertError || !inserted) {
      toast.error("Failed to add bottle");
      setSaving(false);
      return;
    }

    try {
      const frontUrl = await uploadImage(frontFile, inserted.id, "front");
      const backUrl = await uploadImage(backFile, inserted.id, "back");

      await supabase
        .from('cellar_bottles')
        .update({ image_front_url: frontUrl, image_back_url: backUrl })
        .eq('id', inserted.id);

      setForm(BLANK);
      setFrontFile(null);
      setBackFile(null);
      setFrontPreview(null);
      setBackPreview(null);
      setAdding(false);
      await load();
      toast.success("Bottle added");
    } catch {
      toast.error("Bottle saved but photos failed to upload");
      await load();
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

  const openPhotoReplace = (bottleId) => {
    setPhotoBottleId(bottleId);
    setReplaceFront(null);
    setReplaceBack(null);
    setReplaceFrontPreview(null);
    setReplaceBackPreview(null);
  };

  const handleReplaceFrontChange = (file) => {
    setReplaceFront(file);
    setReplaceFrontPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleReplaceBackChange = (file) => {
    setReplaceBack(file);
    setReplaceBackPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSavePhotos = async () => {
    if (!replaceFront || !replaceBack) return;
    setReplaceSaving(true);
    try {
      const frontUrl = await uploadImage(replaceFront, photoBottleId, "front");
      const backUrl = await uploadImage(replaceBack, photoBottleId, "back");
      await supabase
        .from('cellar_bottles')
        .update({ image_front_url: frontUrl, image_back_url: backUrl })
        .eq('id', photoBottleId);
      setPhotoBottleId(null);
      await load();
      toast.success("Photos updated");
    } catch {
      toast.error("Failed to update photos");
    }
    setReplaceSaving(false);
  };

  const cancelAdd = () => {
    setAdding(false);
    setForm(BLANK);
    setFrontFile(null);
    setBackFile(null);
    setFrontPreview(null);
    setBackPreview(null);
  };

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin" style={{ color: "#1E4D5A" }} /></div>;

  const total = storedBottles.length;
  const canSave = form.wine_name && form.cellar_location && frontFile && backFile;

  return (
    <div className="space-y-6" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      {lightbox && <ImageLightbox url={lightbox.url} label={lightbox.label} onClose={() => setLightbox(null)} />}
      {qrBottle && <BottleQRModal bottle={qrBottle} member={member} onClose={() => setQrBottle(null)} />}

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
              <button onClick={cancelAdd} style={{ background: "none", border: "none", cursor: "pointer", color: "#777777" }}><X className="h-3.5 w-3.5" /></button>
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
              <div>
                <PhotoUploadField label="Front label" file={frontFile} previewUrl={frontPreview} onChange={handleFrontChange} />
              </div>
              <div>
                <PhotoUploadField label="Back label" file={backFile} previewUrl={backPreview} onChange={handleBackChange} />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAdd}
                disabled={saving || !canSave}
                style={{ padding: "6px 14px", backgroundColor: saving || !canSave ? "#d8d6d0" : "#1E4D5A", color: saving || !canSave ? "#777777" : "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: saving || !canSave ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "5px" }}
              >
                {saving && <Loader2 className="h-3 w-3 animate-spin" />} Save
              </button>
              <button onClick={cancelAdd} style={{ padding: "6px 14px", backgroundColor: "transparent", color: "#777777", border: "1px solid #d8d6d0", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>Cancel</button>
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
              <div key={b.id} style={{ borderBottom: "1px solid #d8d6d0" }}>
                <div className="flex items-start gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs" style={{ color: "#0A242C" }}>{b.wine_name}</p>
                      {b.vintage && <span className="text-xs" style={{ color: "#777777" }}>{b.vintage}</span>}
                      {b.type && <span className="text-xs" style={{ color: "#777777" }}>· {b.type}</span>}
                      {b.cellar_location && <span className="text-xs" style={{ color: "#1E4D5A" }}>· {b.cellar_location}</span>}
                    </div>
                    {b.notes && <p className="text-xs mt-0.5" style={{ color: "#777777" }}>{b.notes}</p>}
                    <BottleThumbnails bottle={b} onOpen={(url, label) => setLightbox({ url, label })} />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => photoBottleId === b.id ? setPhotoBottleId(null) : openPhotoReplace(b.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: photoBottleId === b.id ? "#1E4D5A" : "#777777", padding: "2px" }}
                      title="Update photos"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setQrBottle(b)} style={{ background: "none", border: "none", cursor: "pointer", color: "#777777", padding: "2px" }} title="Generate QR label">
                      <QrCode className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleCheckOut(b.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#777777", padding: "2px" }} title="Check out (consumed)">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {photoBottleId === b.id && (
                  <div style={{ backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", padding: "12px", marginBottom: "10px" }}>
                    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#777777" }}>Replace photos</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <PhotoUploadField label="Front label" file={replaceFront} previewUrl={replaceFrontPreview} onChange={handleReplaceFrontChange} />
                      <PhotoUploadField label="Back label" file={replaceBack} previewUrl={replaceBackPreview} onChange={handleReplaceBackChange} />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSavePhotos}
                        disabled={replaceSaving || !replaceFront || !replaceBack}
                        style={{ padding: "6px 14px", backgroundColor: replaceSaving || !replaceFront || !replaceBack ? "#d8d6d0" : "#1E4D5A", color: replaceSaving || !replaceFront || !replaceBack ? "#777777" : "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: replaceSaving || !replaceFront || !replaceBack ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "5px" }}
                      >
                        {replaceSaving && <Loader2 className="h-3 w-3 animate-spin" />} Save photos
                      </button>
                      <button
                        onClick={() => setPhotoBottleId(null)}
                        style={{ padding: "6px 14px", backgroundColor: "transparent", color: "#777777", border: "1px solid #d8d6d0", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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