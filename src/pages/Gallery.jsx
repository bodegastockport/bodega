import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const loadPhotos = async () => {
      const { data } = await supabase
        .from("gallery_photos")
        .select("*")
        .order("sort_order", { ascending: true });

      setPhotos(data || []);
    };

    loadPhotos();
  }, []);

  const prev = () => setLightbox((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setLightbox((i) => (i + 1) % photos.length);

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace" }}>
      <div className="max-w-[1100px] mx-auto px-6 py-12 sm:py-16">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#777777" }}>A taste of Bodega</p>
          <h1 className="text-2xl sm:text-3xl" style={{ color: "#2e282a", fontWeight: 400 }}>Gallery</h1>
        </div>

        {photos.length === 0 ? (
          <p className="text-xs" style={{ color: "#777777" }}>No photos yet.</p>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => setLightbox(i)}
                className="block w-full overflow-hidden break-inside-avoid cursor-zoom-in"
                style={{ borderRadius: "6px" }}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || ""}
                  className="w-full object-cover"
                  style={{ display: "block" }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightbox !== null && photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(25,60,71,0.92)" }}
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 transition-opacity"
              style={{ color: "rgba(243,242,238,0.7)" }}
              onClick={() => setLightbox(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <button
              className="absolute left-4 p-2 transition-opacity"
              style={{ color: "rgba(243,242,238,0.7)" }}
              onClick={(e) => { e.stopPropagation(); prev(); }}
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <motion.div
              key={lightbox}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl max-h-[85vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos[lightbox].url}
                alt={photos[lightbox].caption || ""}
                className="max-h-[80vh] max-w-full object-contain"
                style={{ borderRadius: "6px" }}
              />
              <p className="text-center text-xs mt-3" style={{ color: "rgba(243,242,238,0.6)" }}>
                {photos[lightbox].caption || ""}
              </p>
            </motion.div>
            <button
              className="absolute right-4 p-2 transition-opacity"
              style={{ color: "rgba(243,242,238,0.7)" }}
              onClick={(e) => { e.stopPropagation(); next(); }}
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}