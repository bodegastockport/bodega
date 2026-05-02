import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function Menu() {
  const [menuUrl, setMenuUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);

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

        {/* Left — PDF viewer */}
        <div className="flex flex-col px-8 py-8" style={{ borderRight: "1px solid #d8d6d0" }}>
          {menuUrl && (
            <div className="mb-4 flex justify-end">
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: "7px 16px", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none", whiteSpace: "nowrap" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0A242C"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1E4D5A"}
              >
                Open full screen ↗
              </a>
            </div>
          )}

          {menuUrl ? (
            !pdfError ? (
              <iframe
                src={`${menuUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                title="Bodega Menu"
                style={{ flex: 1, width: "100%", minHeight: "70vh", border: "1px solid #d8d6d0" }}
                onError={() => setPdfError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center" style={{ flex: 1, border: "1px solid #d8d6d0", minHeight: "70vh" }}>
                <p className="text-xs mb-4" style={{ color: "#0A242C" }}>Unable to display PDF in browser.</p>
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: "8px 20px", backgroundColor: "#1E4D5A", color: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none" }}
                >
                  View menu →
                </a>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center" style={{ flex: 1, border: "1px solid #d8d6d0", minHeight: "70vh" }}>
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
      <div className="lg:hidden flex flex-col" style={{ minHeight: "calc(100vh - 56px)" }}>

        {/* Food image */}
        <div style={{ position: "relative", height: "40vw", minHeight: "200px", flexShrink: 0 }}>
          <img
            src="/images/menu.jpg"
            alt="Food at Bodega"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Menu content */}
        <div style={{ padding: "24px" }}>
          {menuUrl ? (
            <div>
              <iframe
                src={`${menuUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                title="Bodega Menu"
                style={{ width: "100%", height: "60vw", minHeight: "320px", border: "1px solid #d8d6d0", display: "block", marginBottom: "16px" }}
                onError={() => setPdfError(true)}
              />
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", padding: "10px 0", backgroundColor: "#1E4D5A", color: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none", textAlign: "center" }}
              >
                Open full screen ↗
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-center" style={{ border: "1px solid #d8d6d0", padding: "48px 24px" }}>
              <p className="text-xs" style={{ color: "#0A242C" }}>Menu coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}