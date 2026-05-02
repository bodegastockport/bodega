import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function Menu() {
  const [menuUrl, setMenuUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const desktopCanvasRef = useRef(null);
  const mobileCanvasRef = useRef(null);

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

    const render = async () => {
      setRendering(true);
      try {
        const pdf = await pdfjsLib.getDocument(menuUrl).promise;
        const page = await pdf.getPage(1);

        const renderToCanvas = async (canvas) => {
          if (!canvas) return;
          const containerWidth = canvas.parentElement?.clientWidth || 600;
          const viewport = page.getViewport({ scale: 1 });
          const scale = containerWidth / viewport.width;
          const scaled = page.getViewport({ scale });
          canvas.width = scaled.width;
          canvas.height = scaled.height;
          await page.render({
            canvasContext: canvas.getContext("2d"),
            viewport: scaled,
          }).promise;
        };

        await renderToCanvas(desktopCanvasRef.current);
        await renderToCanvas(mobileCanvasRef.current);
      } catch (e) {
        console.error("PDF render failed:", e);
      }
      setRendering(false);
    };

    render();
  }, [menuUrl]);

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ backgroundColor: "#f3f2ee", minHeight: "calc(100vh - 56px)" }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#1E4D5A" }} />
      </div>
    );
  }

  const DownloadBtn = () => menuUrl ? (
    <a
      href={menuUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "inline-block", padding: "7px 16px", backgroundColor: "#1E4D5A", color: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none" }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0A242C"}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1E4D5A"}
    >
      Download menu ↓
    </a>
  ) : null;

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace" }}>

      {/* Desktop */}
      <div className="hidden lg:grid lg:grid-cols-2" style={{ minHeight: "calc(100vh - 56px)" }}>
        <div style={{ borderRight: "1px solid #d8d6d0", display: "flex", flexDirection: "column" }}>
          {rendering ? (
            <div className="flex items-center justify-center" style={{ flex: 1 }}>
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#1E4D5A" }} />
            </div>
          ) : menuUrl ? (
            <>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <canvas ref={desktopCanvasRef} style={{ width: "100%", display: "block" }} />
              </div>
              <div style={{ padding: "12px 16px", borderTop: "1px solid #d8d6d0", display: "flex", justifyContent: "flex-end" }}>
                <DownloadBtn />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center" style={{ flex: 1 }}>
              <p className="text-xs" style={{ color: "#0A242C" }}>Menu coming soon.</p>
            </div>
          )}
        </div>
        <div style={{ position: "relative" }}>
          <img src="/images/menu.jpg" alt="Food at Bodega" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden flex flex-col">
        <div style={{ position: "relative", height: "50vw", minHeight: "200px", flexShrink: 0 }}>
          <img src="/images/menu.jpg" alt="Food at Bodega" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ padding: "24px" }}>
          {rendering ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#1E4D5A" }} />
            </div>
          ) : menuUrl ? (
            <>
              <canvas ref={mobileCanvasRef} style={{ width: "100%", display: "block", marginBottom: "16px" }} />
              <DownloadBtn />
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