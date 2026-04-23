import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function GalleryManager() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('gallery_photos')
      .select()
      .order('sort_order');
    setPhotos(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);

    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('gallery')
        .upload(path, file, { upsert: true });

      if (uploadErr) { toast.error(`Failed to upload ${file.name}`); continue; }

      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);

      await supabase.from('gallery_photos').insert({
        url: publicUrl,
        caption: file.name.replace(/\.[^/.]+$/, ""),
        sort_order: photos.length,
      });
    }

    await load();
    setUploading(false);
    toast.success(`${files.length} photo${files.length > 1 ? "s" : ""} uploaded`);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('gallery_photos').delete().eq('id', id);
    if (!error) { setPhotos((p) => p.filter((ph) => ph.id !== id)); toast.success("Photo removed"); }
  };

  const updateCaption = async (id, caption) => {
    setPhotos((p) => p.map((ph) => ph.id === id ? { ...ph, caption } : ph));
    await supabase.from('gallery_photos').update({ caption }).eq('id', id);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" style={{ color: "#193c47" }} /></div>;

  return (
    <div className="space-y-6" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "#777777" }}>{photos.length} photo{photos.length !== 1 ? "s" : ""} in the gallery</p>
        <label style={{ cursor: "pointer" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", backgroundColor: "#193c47", color: "#f3f2ee", border: "none", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload photos
          </span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {photos.length === 0 ? (
        <label style={{ cursor: "pointer", display: "block" }}>
          <div style={{ border: "1px dashed #d8d6d0", borderRadius: "6px", padding: "60px", textAlign: "center" }}>
            {uploading
              ? <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3" style={{ color: "#193c47" }} />
              : <Upload className="h-6 w-6 mx-auto mb-3" style={{ color: "#d8d6d0" }} />
            }
            <p className="text-sm" style={{ color: "#2e282a" }}>{uploading ? "Uploading..." : "Upload your first photos"}</p>
            <p className="text-xs mt-1" style={{ color: "#777777" }}>Select multiple images at once</p>
          </div>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative space-y-2">
              <div className="relative overflow-hidden" style={{ borderRadius: "4px", border: "1px solid #d8d6d0", aspectRatio: "1/1" }}>
                <img src={photo.url} alt={photo.caption} className="object-cover w-full h-full" />
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: "rgba(46,40,42,0.7)", color: "#f3f2ee", borderRadius: "3px", border: "none", cursor: "pointer" }}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <input
                style={{ backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "4px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", padding: "4px 8px", color: "#777777", width: "100%", outline: "none" }}
                value={photo.caption || ""}
                placeholder="Caption..."
                onChange={(e) => updateCaption(photo.id, e.target.value)}
                onBlur={(e) => supabase.from('gallery_photos').update({ caption: e.target.value }).eq('id', photo.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
