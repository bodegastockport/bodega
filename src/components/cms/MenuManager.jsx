import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

const MENU_TYPES = [
  { key: "drinks", fileName: "drinks-menu.pdf", label: "Drinks Menu" },
  { key: "food", fileName: "food-menu.pdf", label: "Food Menu" },
];

export default function MenuManager() {
  const [menus, setMenus] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [deletingKey, setDeletingKey] = useState(null);
  const fileInputRefs = useRef({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.storage.from("menu").list("");
    const next = {};
    MENU_TYPES.forEach(({ key, fileName }) => {
      const file = data?.find(f => f.name === fileName);
      if (file) {
        const { data: urlData } = supabase.storage.from("menu").getPublicUrl(fileName);
        next[key] = { url: urlData.publicUrl, fileName };
      } else {
        next[key] = null;
      }
    });
    setMenus(next);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (key, fileName, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setUploadingKey(key);

    const { error } = await supabase.storage
      .from("menu")
      .upload(fileName, file, { upsert: true, contentType: "application/pdf" });

    if (error) {
      toast.error("Upload failed. Please try again.");
    } else {
      toast.success("Menu uploaded successfully");
      await load();
    }
    setUploadingKey(null);
    if (fileInputRefs.current[key]) fileInputRefs.current[key].value = "";
  };

  const handleDelete = async (key, fileName, label) => {
    if (!window.confirm(`Are you sure you want to remove the ${label}?`)) return;
    setDeletingKey(key);
    const { error } = await supabase.storage.from("menu").remove([fileName]);
    if (error) {
      toast.error("Failed to remove menu");
    } else {
      toast.success("Menu removed");
      setMenus(prev => ({ ...prev, [key]: null }));
    }
    setDeletingKey(null);
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#1E4D5A" }} />
    </div>
  );

  return (
    <div style={{ fontFamily: "'Courier New', Courier, monospace", maxWidth: "600px" }}>
      <div style={{ borderBottom: "1px solid #d8d6d0", paddingBottom: "10px", marginBottom: "24px" }}>
        <p className="text-xs uppercase tracking-widest" style={{ color: "#777777" }}>Menu PDFs</p>
      </div>

      <div className="space-y-8">
        {MENU_TYPES.map(({ key, fileName, label }) => {
          const menu = menus[key];
          const isUploading = uploadingKey === key;
          const isDeleting = deletingKey === key;

          return (
            <div key={key}>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#0A242C" }}>{label}</p>

              {menu ? (
                <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "16px", marginBottom: "12px" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>Current file</p>
                      <p className="text-sm" style={{ color: "#0A242C" }}>{menu.fileName}</p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={menu.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: "7px 14px", backgroundColor: "transparent", color: "#1E4D5A", border: "1px solid #1E4D5A", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "5px" }}
                      >
                        View ↗
                      </a>
                      <button
                        onClick={() => handleDelete(key, fileName, label)}
                        disabled={isDeleting}
                        style={{ padding: "7px 10px", backgroundColor: "transparent", color: "#777777", border: "1px solid #d8d6d0", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                      >
                        {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "20px", marginBottom: "12px", textAlign: "center" }}>
                  <p className="text-xs" style={{ color: "#777777" }}>No {label.toLowerCase()} uploaded yet.</p>
                </div>
              )}

              <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "16px" }}>
                <p className="text-xs mb-3" style={{ color: "#777777" }}>PDF files only. Uploading a new file will replace the existing one.</p>
                <input
                  ref={el => (fileInputRefs.current[key] = el)}
                  type="file"
                  accept="application/pdf"
                  onChange={e => handleUpload(key, fileName, e)}
                  style={{ display: "none" }}
                  id={`menu-upload-${key}`}
                />
                <label
                  htmlFor={`menu-upload-${key}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 20px", backgroundColor: isUploading ? "#0A242C" : "#1E4D5A", color: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: isUploading ? "not-allowed" : "pointer", opacity: isUploading ? 0.7 : 1, transition: "background-color 0.15s" }}
                >
                  {isUploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...</> : <><Upload className="h-3.5 w-3.5" /> {menu ? "Replace PDF" : "Upload PDF"}</>}
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}