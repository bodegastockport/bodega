import { Printer, X } from "lucide-react";

export default function BottleQRModal({ bottle, member, onClose }) {
  const qrData = `BODEGA CELLAR\nMember: ${member?.name || "Unknown"}\nWine: ${bottle.wine_name}${bottle.vintage ? ` (${bottle.vintage})` : ""}\nType: ${bottle.type || "—"}\nQty: ${bottle.quantity}${bottle.notes ? `\nNotes: ${bottle.notes}` : ""}`;
  const encoded = encodeURIComponent(qrData);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=200x200&margin=10&bgcolor=f3f2ee&color=193c47`;

  const handlePrint = () => {
    const printWin = window.open("", "_blank", "width=400,height=550");
    printWin.document.write(`
      <!DOCTYPE html><html><head><title>Bottle Label – ${bottle.wine_name}</title>
      <style>
        body { font-family: 'Courier New', Courier, monospace; margin: 0; padding: 24px; text-align: center; background: #f3f2ee; color: #2e282a; }
        .label { border: 1px solid #d8d6d0; border-radius: 6px; padding: 24px; display: inline-block; max-width: 300px; background: #eceae4; }
        h1 { font-size: 14px; margin: 0 0 4px; font-weight: 400; }
        p { font-size: 11px; margin: 3px 0; color: #777777; }
        img { margin: 12px 0; }
        .tag { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #777777; margin-bottom: 8px; }
      </style></head><body>
      <div class="label">
        <p class="tag">Bodega Wine Bar — Cellar Club</p>
        <img src="${qrUrl}" width="160" height="160" />
        <h1>${bottle.wine_name}</h1>
        ${bottle.vintage ? `<p>Vintage: ${bottle.vintage}</p>` : ""}
        ${bottle.type ? `<p>Type: ${bottle.type}</p>` : ""}
        <p>Qty: ${bottle.quantity}</p>
        ${member?.name ? `<p>Member: ${member.name}</p>` : ""}
        ${member?.locker_number ? `<p>Bay: ${member.locker_number}</p>` : ""}
        ${bottle.notes ? `<p>${bottle.notes}</p>` : ""}
      </div>
      <script>window.onload = () => { window.print(); window.close(); }</script>
      </body></html>
    `);
    printWin.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(46,40,42,0.6)" }}>
      <div style={{ backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "24px", width: "100%", maxWidth: "280px", fontFamily: "'Courier New', Courier, monospace" }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm" style={{ color: "#2e282a" }}>Bottle QR code</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#777777" }}><X className="h-4 w-4" /></button>
        </div>

        <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "4px", padding: "16px", textAlign: "center" }}>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#777777" }}>Bodega Cellar Club</p>
          <img src={qrUrl} alt="QR code" style={{ width: "140px", height: "140px", margin: "0 auto", display: "block" }} />
          <p className="text-sm mt-3" style={{ color: "#2e282a" }}>{bottle.wine_name}</p>
          {bottle.vintage && <p className="text-xs mt-0.5" style={{ color: "#777777" }}>{bottle.vintage}</p>}
          {bottle.type && <p className="text-xs" style={{ color: "#777777" }}>{bottle.type}</p>}
          <p className="text-xs" style={{ color: "#777777" }}>Qty: {bottle.quantity}</p>
          {member?.name && (
            <p className="text-xs mt-2 pt-2" style={{ color: "#777777", borderTop: "1px solid #d8d6d0" }}>
              {member.name}{member?.locker_number ? ` · ${member.locker_number}` : ""}
            </p>
          )}
        </div>

        <button
          onClick={handlePrint}
          style={{ marginTop: "16px", width: "100%", padding: "10px", backgroundColor: "#193c47", color: "#f3f2ee", border: "none", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background-color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2d6272"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#193c47"}
        >
          <Printer className="h-3.5 w-3.5" /> Print label
        </button>
      </div>
    </div>
  );
}