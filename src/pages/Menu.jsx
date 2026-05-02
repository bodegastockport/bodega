import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function loadPdfJs() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) { resolve(window.pdfjsLib); return; }
    const script = document.createElement("script");
    script.src = PDFJS_CDN;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      resolve(window.pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function Menu() {
  const [menuUrl, setMenuUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [renderError, setRenderError] = useState(false);
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
      setRenderError(false);
      try {
        const pdfjsLib = await loadPdfJs();
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
          await page.render({ canvasContext: canvas.getContext("2d"), viewport: scaled }).promise;
        };

        await renderToCanvas(desktopCanvasRef.current);
        await renderToCanvas(mobileCanvasRef.current);
      } catch (e) {
        console.error("PDF render failed:", e);
        setRenderError(true);
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
      View menu ↗
    </a>
  ) : null;

  const NoMenu = () => (
    <div className="flex items-center justify-center" style={{ flex: 1, minHeight: "300px" }}>
      <p className="text-xs" style={{ color: "#0A242C" }}>Menu coming soon.</p>
    </div>
  );

  const PDFContent = ({ canvasRef }) => {
    if (rendering) return (
      <div className="flex items-center justify-center" style={{ flex: 1 }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#1E4D5A" }} />
      </div>
    );
    if (renderError) return (
      <div className="flex flex-col items-center justify-center gap-4" style={{ flex: 1, minHeight: "300px" }}>
        <p className="text-xs" style={{ color: "#0A242C" }}>Unable to display PDF.</p>
        <DownloadBtn />
      </div>
    );
    return <canvas ref={canvasRef} style={{ width: "100%", display: "block" }} />;
  };

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace" }}>

      {/* Desktop */}
      <div className="hidden lg:grid lg:grid-cols-2" style={{ minHeight: "calc(100vh - 56px)" }}>
        <div className="flex flex-col justify-center items-center" style={{ borderRight: "1px solid #d8d6d0" }}>
          <div style={{ width: "100%", maxWidth: "520px", padding: "48px 64px" }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#0A242C" }}>What we pour</p>
            <h1 className="text-2xl mb-4 leading-snug" style={{ color: "#1E4D5A", fontWeight: 400 }}>Good wine, no waffle.</h1>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "#0A242C" }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "#0A242C" }}>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.
            </p>
            <DownloadBtn />
          </div>
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
        <div style={{ padding: "32px 24px" }}>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#0A242C" }}>What we pour</p>
          <h1 style={{ fontSize: "22px", color: "#1E4D5A", fontWeight: 400, marginBottom: "12px" }}>Good wine, no waffle.</h1>
          <p className="text-sm leading-relaxed mb-3" style={{ color: "#0A242C" }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "#0A242C" }}>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.
          </p>
          <DownloadBtn />
        </div>
      </div>
    </div>
  );
}