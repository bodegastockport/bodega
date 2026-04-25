import { format, parseISO } from "date-fns";

export default function BookingConfirmation({ reservation, onReset }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#777777" }}>Booking confirmed</p>
        <h2 className="text-xl" style={{ color: "#2e282a", fontWeight: 400 }}>See you at Bodega.</h2>
        <p className="text-sm mt-2" style={{ color: "#777777" }}>
          Thanks, {reservation.guest_name}. Your table is booked — a confirmation has been sent to {reservation.email}.
        </p>
      </div>

      <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "20px" }} className="space-y-3">
        <div className="flex justify-between text-sm">
          <span style={{ color: "#777777" }}>Date</span>
          <span style={{ color: "#2e282a" }}>{format(parseISO(reservation.date), "EEEE, d MMMM yyyy")}</span>
        </div>
        <div style={{ borderTop: "1px solid #d8d6d0", paddingTop: "12px" }} className="flex justify-between text-sm">
          <span style={{ color: "#777777" }}>Time</span>
          <span style={{ color: "#2e282a" }}>{reservation.time}</span>
        </div>
        <div style={{ borderTop: "1px solid #d8d6d0", paddingTop: "12px" }} className="flex justify-between text-sm">
          <span style={{ color: "#777777" }}>Guests</span>
          <span style={{ color: "#2e282a" }}>{reservation.party_size} {reservation.party_size === 1 ? "guest" : "guests"}</span>
        </div>
      </div>

      <button
        onClick={onReset}
        style={{
          padding: "10px 24px",
          backgroundColor: "transparent",
          color: "#193c47",
          border: "1px solid #193c47",
          borderRadius: "6px",
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          cursor: "pointer",
          transition: "background-color 0.15s, color 0.15s",
        }}
        onMouseEnter={e => { e.target.style.backgroundColor = "#193c47"; e.target.style.color = "#f3f2ee"; }}
        onMouseLeave={e => { e.target.style.backgroundColor = "transparent"; e.target.style.color = "#193c47"; }}
      >
        Make another reservation
      </button>
    </div>
  );
}