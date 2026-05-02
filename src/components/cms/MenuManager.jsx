import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

export default function MenuManager() {
  const [menuUrl, setMenuUrl] = useState(null);
  const [menuFileName, setMenuFileName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.storage.from("menu").list("");
    if (data && data.length > 0) {
      const file = data.find(f => f.name.endsWith(".pdf")) || data[0];
      const { data: urlData } = supabase.storage.from("menu").getPublicUrl(file.name);
      setMenuUrl(urlData.publicUrl);
      setMenuFileName(file.name);
    } else {
      setMenuUrl(null);
      setMenuFileName(null);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setUploading(true);

    // Delete existing file first if there is one
    if (menuFileName) {
      await supabase.storage.from("menu").remove([menuFileName]);
    }

    const { error } = await supabase.storage
      .from("menu")
      .upload("menu.pdf", file, { upsert: true, contentType: "application/pdf" });

    if (error) {
      toast.error("Upload failed. Please try again.");
    } else {
      toast.success("Menu uploaded successfully");
      await load();
    }
    setUploading(false);
    // Reset input so same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async () => {
    if (!menuFileName) return;
    if (!window.confirm("Are you sure you want to remove the menu PDF?")) return;
    setDeleting(true);
    const { error } = await supabase.storage.from("menu").remove([menuFileName]);
    if (error) {
      toast.error("Failed to remove menu");
    } else {
      toast.success("Menu removed");
      setMenuUrl(null);
      setMenuFileName(null);
    }
    setDeleting(false);
  };

  const inputStyle = {
    backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0",
    fontFamily: "'Courier New', Courier, monospace", fontSize: "13px",
    padding: "8px 11px", color: "#0A242C", width: "100%", outline: "none",
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#1E4D5A" }} />
    </div>
  );

  return (
    <div style={{ fontFamily: "'Courier New', Courier, monospace", maxWidth: "600px" }}>
      <div style={{ borderBottom: "1px solid #d8d6d0", paddingBottom: "10px", marginBottom: "24px" }}>
        <p className="text-xs uppercase tracking-widest" style={{ color: "#777777" }}>Menu PDF</p>
      </div>

      {/* Current menu */}
      {menuUrl ? (
        <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "16px", marginBottom: "20px" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>Current menu</p>
              <p className="text-sm" style={{ color: "#0A242C" }}>{menuFileName}</p>
            </div>
            <div className="flex gap-2">
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: "7px 14px", backgroundColor: "transparent", color: "#1E4D5A", border: "1px solid #1E4D5A", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "5px" }}
              >
                View ↗
              </a>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ padding: "7px 10px", backgroundColor: "transparent", color: "#777777", border: "1px solid #d8d6d0", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          {/* Preview */}
          <iframe
            src={menuUrl}
            title="Menu preview"
            style={{ width: "100%", height: "400px", border: "1px solid #d8d6d0" }}
          />
        </div>
      ) : (
        <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "24px", marginBottom: "20px", textAlign: "center" }}>
          <p className="text-xs" style={{ color: "#777777" }}>No menu uploaded yet.</p>
        </div>
      )}

      {/* Upload */}
      <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "20px" }}>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>
          {menuUrl ? "Replace menu" : "Upload menu"}
        </p>
        <p className="text-xs mb-4" style={{ color: "#777777" }}>PDF files only. Uploading a new file will replace the existing one.</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleUpload}
          style={{ display: "none" }}
          id="menu-upload"
        />
        <label
          htmlFor="menu-upload"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 20px", backgroundColor: uploading ? "#0A242C" : "#1E4D5A", color: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.7 : 1, transition: "background-color 0.15s" }}
        >
          {uploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...</> : <><Upload className="h-3.5 w-3.5" /> {menuUrl ? "Replace PDF" : "Upload PDF"}</>}
        </label>
      </div>
    </div>
  );
}
