import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import SEO from "../components/SEO";

const schema = {
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": "Bodega Wine Bar — Gallery",
  "description": "Photos from inside Bodega wine bar at Weir Mill, Stockport.",
  "url": "https://bodegawine.co.uk/gallery",
  "author": {
    "@type": "LocalBusiness",
    "name": "Bodega Wine Vault"
  }
}

const getOptimisedImageUrl = (url, width = 400, quality = 75) => {
  if (!url) return "";
  if (url.includes("/render/image/public/")) {
    const [base] = url.split("?");
    return `${base}?width=${width}&quality=${quality}`;
  }
  if (url.includes("/object/public/")) {
    return `${url.replace("/object/public/", "/render/image/public/")}?width=${width}&quality=${quality}`;
  }
  return url;
};

const useOriginalIfOptimisedFails = (event, originalUrl) => {
  if (!originalUrl) return;
  const image = event.currentTarget;
  if (image.src !== originalUrl) {
    image.src = originalUrl;
  }
};

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
    <>
      <SEO
        title="Gallery — Bodega Wine Bar, Stockport"
        description="Photos from inside Bodega wine bar at Weir Mill, Stockport. Wine, boards, atmosphere."
        canonical="/gallery"
        schema={schema}
      />
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
                    src={getOptimisedImageUrl(photo.url, 400, 75)}
                    alt={photo.caption || "Bodega wine bar, Stockport"}
                    width="400"
                    height="600"
                    loading={i < 4 ? "eager" : "lazy"}
                    fetchPriority={i < 2 ? "high" : "auto"}
                    decoding="async"
                    className="w-full object-cover"
                    style={{ display: "block", width: "100%", height: "auto" }}
                    onError={(event) => useOriginalIfOptimisedFails(event, photo.url)}
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
                  alt={photos[lightbox].caption || "Bodega wine bar, Stockport"}
                  className="max-h-[80vh] max-w-full object-contain"
                  loading="eager"
                  decoding="async"
                  style={{ borderRadius: "6px", display: "block" }}
                />
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
    </>
  )
}