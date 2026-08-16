import { useRef, useState } from "react";
import { Printer, Download, X } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export default function BottleQRModal({ bottle, member, slotLabel, onClose }) {
  const formattedSlotLabel = slotLabel ? slotLabel.replace(/^([A-Za-z]+)(\d+)$/, "$1-$2") : slotLabel;
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
        body { font-family: 'Courier New', Courier, monospace; margin: 0; padding: 20px; text-align: center; background: #ffffff; color: #000000; }
        .label { border: 1px solid #d8d6d0; padding: 20px; display: inline-block; width: 420px; background: #ffffff; }
        h1, p, .tag, .location { font-size: 36px; font-weight: 700; color: #000000; margin: 2px 0; line-height: 1.15; }
        .tag { text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }
        img { margin: 14px 0; width: 280px; height: 280px; }
      </style></head><body>
      <div class="label">
        <img src="${qrUrl}" />
        <h1>${bottle.wine_name}</h1>
        ${bottle.vintage || bottle.type ? `<p>${[bottle.vintage, bottle.type].filter(Boolean).join(" · ")}</p>` : ""}
        ${formattedSlotLabel ? `<p class="location">Vault slot: ${formattedSlotLabel}</p>` : ""}
        ${member?.name ? `<p>${member.name}</p>` : ""}
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
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Canvas produced no image data");
      const blobUrl = URL.createObjectURL(blob);
      if (newTab) {
        newTab.location.href = blobUrl;
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
          <img src={qrUrl} alt="QR code" crossOrigin="anonymous" style={{ width: "140px", height: "140px", margin: "0 auto", display: "block" }} />
          <p className="text-sm mt-3" style={{ color: "#000000", fontWeight: 700 }}>{bottle.wine_name}</p>
          {(bottle.vintage || bottle.type) && (
            <p className="text-xs mt-0.5" style={{ color: "#000000", fontWeight: 700 }}>
              {[bottle.vintage, bottle.type].filter(Boolean).join(" · ")}
            </p>
          )}
          {formattedSlotLabel && (
            <p className="text-xs font-bold mt-2" style={{ color: "#000000" }}>
              Vault slot: {formattedSlotLabel}
            </p>
          )}
          {member?.name && (
            <p className="text-xs mt-2 pt-2" style={{ color: "#000000", fontWeight: 700, borderTop: "1px solid #d8d6d0" }}>
              {member.name}
            </p>
          )}
          <p className="text-xs mt-2" style={{ color: "#000000", fontWeight: 700 }}>Scan to check out</p>
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
            style={{ fontFamily: "'Courier New', Courier, monospace", backgroundColor: "#ffffff", color: "#000000", padding: "20px", width: "420px", textAlign: "center", border: "1px solid #d8d6d0" }}
          >
            <img src={qrUrl} alt="QR code" crossOrigin="anonymous" width="280" height="280" style={{ margin: "14px auto", display: "block" }} />
            <h1 style={{ fontSize: "36px", margin: "2px 0", fontWeight: 700, color: "#000000", lineHeight: 1.15 }}>{bottle.wine_name}</h1>
            {(bottle.vintage || bottle.type) && (
              <p style={{ fontSize: "36px", margin: "2px 0", color: "#000000", fontWeight: 700, lineHeight: 1.15 }}>
                {[bottle.vintage, bottle.type].filter(Boolean).join(" · ")}
              </p>
            )}
            {formattedSlotLabel && <p style={{ fontSize: "36px", fontWeight: 700, margin: "2px 0", color: "#000000", lineHeight: 1.15 }}>Vault slot: {formattedSlotLabel}</p>}
            {member?.name && <p style={{ fontSize: "36px", margin: "2px 0", color: "#000000", fontWeight: 700, lineHeight: 1.15 }}>{member.name}</p>}
            {bottle.notes && <p style={{ fontSize: "36px", margin: "2px 0", color: "#000000", fontWeight: 700, lineHeight: 1.15 }}>{bottle.notes}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}