import { useRef, useState } from "react";
import { Printer, Download, X } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export default function BottleQRModal({ bottle, member, slotLabel, onClose }) {
  const labelRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const scanUrl = `${window.location.origin}/scan/${bottle.id}`;
  const encoded = encodeURIComponent(scanUrl);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=400x400&margin=10&bgcolor=ffffff&color=000000`;

  const handlePrint = () => {
    const printWin = window.open("", "_blank", "width=400,height=580");
    printWin.document.write(`
      <!DOCTYPE html><html><head><title>Bottle Label – ${bottle.wine_name}</title>
      <style>
        body { font-family: 'Courier New', Courier, monospace; margin: 0; padding: 24px; text-align: center; background: #ffffff; color: #000000; }
        .label { border: 1px solid #d8d6d0; padding: 24px; display: inline-block; max-width: 340px; background: #ffffff; }
        h1 { font-size: 22px; margin: 0 0 6px; font-weight: 700; }
        p { font-size: 16px; margin: 4px 0; color: #000000; font-weight: 700; }
        img { margin: 14px 0; }
        .tag { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #000000; margin-bottom: 10px; font-weight: 700; }
        .location { font-size: 19px; font-weight: 700; color: #000000; margin: 10px 0; }
      </style></head><body>
      <div class="label">
        <p class="tag">Bodega Wine Bar — Cellar Club</p>
        <img src="${qrUrl}" width="160" height="160" />
        <h1>${bottle.wine_name}</h1>
        ${bottle.vintage ? `<p>Vintage: ${bottle.vintage}</p>` : ""}
        ${bottle.type ? `<p>Type: ${bottle.type}</p>` : ""}
        ${slotLabel ? `<p class="location">Vault slot: ${slotLabel}</p>` : ""}
        ${member?.name ? `<p>Member: ${member.name}</p>` : ""}
        ${bottle.notes ? `<p>${bottle.notes}</p>` : ""}
      </div>
      <script>window.onload = () => { window.print(); window.close(); }</script>
      </body></html>
    `);
    printWin.document.close();
  };

  const handleDownload = async () => {
    if (!labelRef.current) return;
    const newTab = window.open("", "_blank");
    setDownloading(true);
    try {
      const canvas = await html2canvas(labelRef.current, {
        useCORS: true,
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const dataUrl = canvas.toDataURL("image/png");
      if (newTab) {
        newTab.document.write(
          `<!DOCTYPE html><html><head><title>${bottle.wine_name} label</title></head>` +
          `<body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh;">` +
          `<img src="${dataUrl}" style="max-width:100%;height:auto;" /></body></html>`
        );
        newTab.document.close();
      } else {
        toast.error("Please allow pop-ups to save the label image");
      }
    } catch (err) {
      console.error("Label download failed:", err);
      if (newTab) newTab.close();
      toast.error("Couldn't generate the label image. Please try again.");
    }
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(10,36,44,0.6)" }}>
      <div style={{ backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", padding: "24px", width: "100%", maxWidth: "280px", fontFamily: "'Courier New', Courier, monospace" }}>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm" style={{ color: "#0A242C" }}>Bottle QR code</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#777777" }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "16px", textAlign: "center" }}>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#777777" }}>Bodega Cellar Club</p>
          <img src={qrUrl} alt="QR code" crossOrigin="anonymous" style={{ width: "140px", height: "140px", margin: "0 auto", display: "block" }} />
          <p className="text-sm mt-3" style={{ color: "#000000" }}>{bottle.wine_name}</p>
          {bottle.vintage && <p className="text-xs mt-0.5" style={{ color: "#777777" }}>{bottle.vintage}</p>}
          {bottle.type && <p className="text-xs" style={{ color: "#777777" }}>{bottle.type}</p>}
          {slotLabel && (
            <p className="text-xs font-bold mt-2" style={{ color: "#000000" }}>
              Vault slot: {slotLabel}
            </p>
          )}
          {member?.name && (
            <p className="text-xs mt-2 pt-2" style={{ color: "#777777", borderTop: "1px solid #d8d6d0" }}>
              {member.name}
            </p>
          )}
          <p className="text-xs mt-2" style={{ color: "#aaaaaa" }}>Scan to check out</p>
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
          <button
            onClick={handlePrint}
            style={{ flex: 1, padding: "10px", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "background-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0A242C"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1E4D5A"}
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{ flex: 1, padding: "10px", backgroundColor: "#0A242C", color: "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: downloading ? "not-allowed" : "pointer", opacity: downloading ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
          >
            <Download className="h-3.5 w-3.5" /> {downloading ? "Saving..." : "Download label"}
          </button>
        </div>

        <div style={{ position: "fixed", left: "-9999px", top: 0 }}>
          <div
            ref={labelRef}
            style={{ fontFamily: "'Courier New', Courier, monospace", backgroundColor: "#ffffff", color: "#000000", padding: "24px", width: "300px", textAlign: "center", border: "1px solid #d8d6d0" }}
          >
            <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#444444", marginBottom: "8px" }}>
              Bodega Wine Bar — Cellar Club
            </p>
            <img src={qrUrl} alt="QR code" crossOrigin="anonymous" width="160" height="160" style={{ margin: "0 auto 12px", display: "block" }} />
            <h1 style={{ fontSize: "14px", margin: "0 0 4px", fontWeight: 400, color: "#000000" }}>{bottle.wine_name}</h1>
            {bottle.vintage && <p style={{ fontSize: "11px", margin: "3px 0", color: "#000000" }}>Vintage: {bottle.vintage}</p>}
            {bottle.type && <p style={{ fontSize: "11px", margin: "3px 0", color: "#000000" }}>Type: {bottle.type}</p>}
            {slotLabel && <p style={{ fontSize: "13px", fontWeight: "bold", margin: "8px 0", color: "#000000" }}>Vault slot: {slotLabel}</p>}
            {member?.name && <p style={{ fontSize: "11px", margin: "3px 0", color: "#000000" }}>Member: {member.name}</p>}
            {bottle.notes && <p style={{ fontSize: "11px", margin: "3px 0", color: "#000000" }}>{bottle.notes}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}