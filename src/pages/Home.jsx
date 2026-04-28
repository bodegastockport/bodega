import { useState } from "react";
import BookingForm from "../components/BookingForm";
import BookingConfirmation from "../components/BookingConfirmation";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const openModal = () => { setModalOpen(true); setConfirmed(null); };
  const closeModal = () => { setModalOpen(false); setConfirmed(null); };

  return (
    <>
      {/* Desktop: fixed left image + scrollable right panel */}
      <div className="hidden lg:block">
        <div style={{ position: "fixed", top: 0, left: 0, width: "50vw", height: "100vh", zIndex: 0 }}>
          <img
            src="/images/hero.jpg"
            alt="Wine at Bodega"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <div style={{ marginLeft: "50vw", width: "50vw", minHeight: "100vh", backgroundColor: "#f3f2ee", borderLeft: "1px solid #d8d6d0", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, padding: "32px 36px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: "400px" }}>
              <h1 style={{ fontSize: "28px", color: "#1E4D5A", fontWeight: 400, fontFamily: "'Courier New', Courier, monospace", lineHeight: "1.3", marginBottom: "14px" }}>
                Wine without the waffle.
              </h1>
              <p style={{ fontSize: "14px", color: "#0A242C", fontWeight: 400, fontFamily: "'Courier New', Courier, monospace", lineHeight: "1.7", marginBottom: "32px" }}>
                Great bottles. Cold lager. Proper boards. No lectures, no pretence – just good taste.
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                <button
                  onClick={openModal}
                  style={{ flex: 1, padding: "10px 0", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", borderRadius: "0px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", transition: "background-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0A242C"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1E4D5A"}
                >
                  Bookings
                </button>
                <a
                  href="/cellar-club"
                  style={{ flex: 1, padding: "10px 0", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", borderRadius: "0px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none", display: "inline-block", textAlign: "center", transition: "background-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0A242C"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1E4D5A"}
                >
                  Cellar Club
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: stacked layout */}
      <div className="lg:hidden flex flex-col" style={{ backgroundColor: "#f3f2ee" }}>
        <div style={{ position: "relative", width: "100%", height: "50vh", flexShrink: 0 }}>
          <img
            src="/images/hero.jpg"
            alt="Wine at Bodega"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <div style={{ padding: "32px 24px" }}>
          <h1 style={{ fontSize: "22px", color: "#1E4D5A", fontWeight: 400, fontFamily: "'Courier New', Courier, monospace", lineHeight: "1.3", marginBottom: "12px" }}>
            Wine without the waffle.
          </h1>
          <p style={{ fontSize: "13px", color: "#0A242C", fontWeight: 400, fontFamily: "'Courier New', Courier, monospace", lineHeight: "1.7", marginBottom: "24px" }}>
            Great bottles. Cold lager. Proper boards. No lectures, no pretence – just good taste.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
            <button
              onClick={openModal}
              style={{ flex: 1, padding: "10px 0", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", borderRadius: "0px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
            >
              Bookings
            </button>
            <a
              href="/cellar-club"
              style={{ flex: 1, padding: "10px 0", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", borderRadius: "0px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none", display: "inline-block", textAlign: "center" }}
            >
              Cellar Club
            </a>
          </div>
        </div>
      </div>

      {/* Booking modal */}
      {modalOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(10,36,44,0.6)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{ backgroundColor: "#f3f2ee", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", padding: "40px", position: "relative", margin: "0 16px" }}>
            <button
              onClick={closeModal}
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#777777", cursor: "pointer" }}
            >
              Close
            </button>
            {confirmed ? (
              <BookingConfirmation reservation={confirmed} onReset={closeModal} />
            ) : (
              <>
                <div style={{ marginBottom: "24px" }}>
                  <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#777777", marginBottom: "6px", fontFamily: "'Courier New', Courier, monospace" }}>Reservations</p>
                  <h2 style={{ fontSize: "18px", color: "#1E4D5A", fontWeight: 400, fontFamily: "'Courier New', Courier, monospace" }}>Make a booking</h2>
                  <p style={{ fontSize: "12px", marginTop: "4px", color: "#777777", fontFamily: "'Courier New', Courier, monospace" }}>Choose your date, time, and party size below.</p>
                </div>
                <BookingForm onSuccess={(res) => setConfirmed(res)} />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}