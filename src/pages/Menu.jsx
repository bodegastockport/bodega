import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function Menu() {
  const [menuUrl, setMenuUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const canvasRef = useRef(null);
  const canvasMobileRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.storage.from("menu").list("");
      if (data && data.length > 0) {
        const file = data.find(f => f.name.endsWith(".pdf")) || data[0];
        const { data: urlData } = supabase.storage.from("menu").getPublicUrl(file.name);
        setMenuUrl(urlData.publicUrl);
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!menuUrl) return;

    const renderPDF = async () => {
      setRendering(true);
      try {
        const pdfjsLib = await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        const pdf = await pdfjsLib.getDocument(menuUrl).promise;
        const page = await pdf.getPage(1);

        // Render to desktop canvas
        if (canvasRef.current) {
          const container = canvasRef.current.parentElement;
          const containerWidth = container.clientWidth;
          const viewport = page.getViewport({ scale: 1 });
          const scale = containerWidth / viewport.width;
          const scaledViewport = page.getViewport({ scale });

          canvasRef.current.width = scaledViewport.width;
          canvasRef.current.height = scaledViewport.height;

          await page.render({
            canvasContext: canvasRef.current.getContext("2d"),
            viewport: scaledViewport,
          }).promise;
        }

        // Render to mobile canvas
        if (canvasMobileRef.current) {
          const container = canvasMobileRef.current.parentElement;
          const containerWidth = container.clientWidth;
          const viewport = page.getViewport({ scale: 1 });
          const scale = containerWidth / viewport.width;
          const scaledViewport = page.getViewport({ scale });

          canvasMobileRef.current.width = scaledViewport.width;
          canvasMobileRef.current.height = scaledViewport.height;

          await page.render({
            canvasContext: canvasMobileRef.current.getContext("2d"),
            viewport: scaledViewport,
          }).promise;
        }
      } catch (err) {
        console.error("PDF render error:", err);
      }
      setRendering(false);
    };

    renderPDF();
  }, [menuUrl]);

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ backgroundColor: "#f3f2ee", minHeight: "calc(100vh - 56px)" }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#1E4D5A" }} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace" }}>

      {/* Desktop: split column */}
      <div className="hidden lg:grid lg:grid-cols-2" style={{ minHeight: "calc(100vh - 56px)" }}>

        {/* Left — PDF canvas */}
        <div className="flex flex-col" style={{ borderRight: "1px solid #d8d6d0", overflow: "hidden", position: "relative" }}>
          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "#f3f2ee", zIndex: 2 }}>
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#1E4D5A" }} />
            </div>
          )}
          {menuUrl ? (
            <>
              <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "flex-start" }}>
                <canvas ref={canvasRef} style={{ width: "100%", display: "block" }} />
              </div>
              <div style={{ padding: "12px 16px", borderTop: "1px solid #d8d6d0", display: "flex", justifyContent: "flex-end" }}>
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: "7px 16px", backgroundColor: "#1E4D5A", color: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0A242C"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1E4D5A"}
                >
                  Download menu ↓
                </a>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center" style={{ flex: 1 }}>
              <p className="text-xs" style={{ color: "#0A242C" }}>Menu coming soon.</p>
            </div>
          )}
        </div>

        {/* Right — food image */}
        <div style={{ position: "relative" }}>
          <img
            src="/images/menu.jpg"
            alt="Food at Bodega"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* Mobile: stacked */}
      <div className="lg:hidden flex flex-col">
        <div style={{ position: "relative", height: "40vw", minHeight: "200px", flexShrink: 0 }}>
          <img
            src="/images/menu.jpg"
            alt="Food at Bodega"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div style={{ padding: "24px", position: "relative" }}>
          {rendering && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#1E4D5A" }} />
            </div>
          )}
          {menuUrl ? (
            <>
              <canvas ref={canvasMobileRef} style={{ width: "100%", display: "block", marginBottom: "16px" }} />
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", padding: "10px 0", backgroundColor: "#1E4D5A", color: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none", textAlign: "center" }}
              >
                Download menu ↓
              </a>
            </>
          ) : (
            <div className="flex items-center justify-center" style={{ padding: "48px 24px", border: "1px solid #d8d6d0" }}>
              <p className="text-xs" style={{ color: "#0A242C" }}>Menu coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}