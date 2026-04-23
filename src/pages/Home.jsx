import { useState } from "react";
import BookingForm from "../components/BookingForm";
import BookingConfirmation from "../components/BookingConfirmation";

export default function Home() {
  const [confirmed, setConfirmed] = useState(null);

  return (
    <>
      {/* Desktop: fixed left image + scrollable right panel */}
      <div className="hidden lg:block">
        {/* Fixed image — full viewport, left half, behind nav */}
        <div style={{ position: "fixed", top: 0, left: 0, width: "50vw", height: "100vh", zIndex: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1400&q=85"
            alt="Wine at Bodega"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,10,0.78) 0%, rgba(10,10,10,0.12) 50%, transparent 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, padding: "48px" }}>
            <p style={{ fontSize: "13px", lineHeight: "1.7", color: "rgba(243,242,238,0.85)", fontFamily: "'Courier New', Courier, monospace", maxWidth: "320px" }}>
              Intimate wines, curated bites, and an atmosphere made for savouring the moment. Book your spot at Bodega, Stockport.
            </p>
            <a
              href="/about"
              style={{ display: "inline-block", marginTop: "20px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#f3f2ee", borderBottom: "1px solid rgba(243,242,238,0.5)", paddingBottom: "2px", textDecoration: "none", fontFamily: "'Courier New', Courier, monospace" }}
            >
              Our story
            </a>
          </div>
        </div>

        {/* Right panel — offset by 50vw, scrollable */}
        <div style={{ marginLeft: "50vw", width: "50vw", minHeight: "100vh", backgroundColor: "#f3f2ee", borderLeft: "1px solid #d8d6d0", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, padding: "32px 36px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: "400px" }}>
            {confirmed ? (
              <BookingConfirmation reservation={confirmed} onReset={() => setConfirmed(null)} />
            ) : (
              <>
                <div style={{ marginBottom: "20px" }}>
                  <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#777777", marginBottom: "6px", fontFamily: "'Courier New', Courier, monospace" }}>Reservations</p>
                  <h1 style={{ fontSize: "18px", color: "#193c47", fontWeight: 400, fontFamily: "'Courier New', Courier, monospace" }}>Make a booking</h1>
                  <p style={{ fontSize: "12px", marginTop: "4px", color: "#777777", fontFamily: "'Courier New', Courier, monospace" }}>Choose your date, time, and party size below.</p>
                </div>
                <div style={{ maxWidth: "380px" }}>
                  <BookingForm onSuccess={(res) => setConfirmed(res)} />
                </div>
              </>
            )}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile: stacked layout */}
      <div className="lg:hidden flex flex-col" style={{ backgroundColor: "#f3f2ee" }}>
        {/* Image — 50vh, full width */}
        <div style={{ position: "relative", width: "100%", height: "50vh", flexShrink: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=900&q=85"
            alt="Wine at Bodega"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0.1) 60%, transparent 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, padding: "28px" }}>
            <p style={{ fontSize: "13px", lineHeight: "1.7", color: "rgba(243,242,238,0.85)", fontFamily: "'Courier New', Courier, monospace" }}>
              Intimate wines, curated bites, and an atmosphere made for savouring the moment.
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "32px 24px" }}>
          {confirmed ? (
            <BookingConfirmation reservation={confirmed} onReset={() => setConfirmed(null)} />
          ) : (
            <>
              <div style={{ marginBottom: "24px" }}>
                <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#777777", marginBottom: "10px", fontFamily: "'Courier New', Courier, monospace" }}>Reservations</p>
                <h1 style={{ fontSize: "20px", color: "#193c47", fontWeight: 400, fontFamily: "'Courier New', Courier, monospace" }}>Make a booking</h1>
                <p style={{ fontSize: "13px", marginTop: "8px", color: "#777777", fontFamily: "'Courier New', Courier, monospace" }}>Choose your date, time, and party size below.</p>
              </div>
              <BookingForm onSuccess={(res) => setConfirmed(res)} />
            </>
          )}
  
        </div>
      </div>
    </>
  );
}