import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const PHOTOS = [
  { src: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80", caption: "The bar" },
  { src: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80", caption: "Inside Bodega" },
  { src: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&q=80", caption: "Wine selection" },
  { src: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80", caption: "Sharing boards" },
  { src: "https://images.unsplash.com/photo-1543253687-c931c8e01820?w=800&q=80", caption: "Cheese board" },
  { src: "https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800&q=80", caption: "Wine cellar" },
  { src: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800&q=80", caption: "Evening atmosphere" },
  { src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80", caption: "Private event" },
  { src: "https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?w=800&q=80", caption: "Tasting evening" },
  { src: "https://images.unsplash.com/photo-1486334795651-23a56ba68ef3?w=800&q=80", caption: "Charcuterie" },
  { src: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80", caption: "Pouring wine" },
  { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", caption: "Dining" },
];

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null);

  const prev = () => setLightbox((i) => (i - 1 + PHOTOS.length) % PHOTOS.length);
  const next = () => setLightbox((i) => (i + 1) % PHOTOS.length);

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace" }}>
      <div className="max-w-[1100px] mx-auto px-6 py-12 sm:py-16">

        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#777777" }}>A taste of Bodega</p>
          <h1 className="text-2xl sm:text-3xl" style={{ color: "#2e282a", fontWeight: 400 }}>Gallery</h1>
        </div>

        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {PHOTOS.map((photo, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className="block w-full overflow-hidden break-inside-avoid cursor-zoom-in"
              style={{ borderRadius: "6px" }}
            >
              <img
                src={photo.src}
                alt={photo.caption}
                className="w-full object-cover"
                style={{ display: "block" }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
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
                src={PHOTOS[lightbox].src}
                alt={PHOTOS[lightbox].caption}
                className="max-h-[80vh] max-w-full object-contain"
                style={{ borderRadius: "6px" }}
              />
              <p className="text-center text-xs mt-3" style={{ color: "rgba(243,242,238,0.6)" }}>{PHOTOS[lightbox].caption}</p>
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