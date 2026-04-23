import { format, parseISO } from "date-fns";
import { supabase } from "@/lib/supabase";

const STATUS_STYLES = {
  pending: { backgroundColor: "#eceae4", color: "#777777", border: "1px solid #d8d6d0" },
  confirmed: { backgroundColor: "#eaf0ec", color: "#2e6b45", border: "1px solid #c8dace" },
  cancelled: { backgroundColor: "#f0eaea", color: "#6b2e2e", border: "1px solid #dac8c8" },
  completed: { backgroundColor: "#eceae4", color: "#777777", border: "1px solid #d8d6d0" },
};

const btnPrimary = {
  padding: "6px 16px", backgroundColor: "#193c47", color: "#f3f2ee",
  border: "none", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace",
  fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em",
  cursor: "pointer", transition: "background-color 0.15s",
};

const btnOutline = {
  padding: "6px 16px", backgroundColor: "transparent", color: "#193c47",
  border: "1px solid #193c47", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace",
  fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em",
  cursor: "pointer", transition: "background-color 0.15s, color 0.15s",
};

export default function ReservationCard({ reservation, onUpdate }) {
  const updateStatus = async (newStatus) => {
    await supabase
      .from('reservations')
      .update({ status: newStatus })
      .eq('id', reservation.id);
    onUpdate();
  };

  const statusStyle = STATUS_STYLES[reservation.status] || STATUS_STYLES.pending;

  return (
    <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "20px", fontFamily: "'Courier New', Courier, monospace" }}>
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <p className="text-sm" style={{ color: "#2e282a" }}>{reservation.guest_name}</p>
          <p className="text-xs mt-0.5" style={{ color: "#777777" }}>{reservation.email}</p>
        </div>
        <span style={{ ...statusStyle, fontSize: "11px", padding: "3px 10px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {reservation.status}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Date", value: format(parseISO(reservation.date), "dd MMM yyyy") },
          { label: "Time", value: reservation.time },
          { label: "Guests", value: reservation.party_size },
          { label: "Phone", value: reservation.phone },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "#777777" }}>{label}</p>
            <p className="text-xs" style={{ color: "#2e282a" }}>{value}</p>
          </div>
        ))}
      </div>

      {reservation.special_requests && (
        <div style={{ backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "4px", padding: "10px 12px", marginBottom: "16px" }}>
          <p className="text-xs" style={{ color: "#777777" }}>{reservation.special_requests}</p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {reservation.status === "pending" && (
          <>
            <button style={btnPrimary} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2d6272"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "#193c47"} onClick={() => updateStatus("confirmed")}>Confirm</button>
            <button style={btnOutline} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#193c47"; e.currentTarget.style.color = "#f3f2ee"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#193c47"; }} onClick={() => updateStatus("cancelled")}>Cancel</button>
          </>
        )}
        {reservation.status === "confirmed" && (
          <>
            <button style={btnPrimary} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2d6272"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "#193c47"} onClick={() => updateStatus("completed")}>Mark complete</button>
            <button style={btnOutline} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#193c47"; e.currentTarget.style.color = "#f3f2ee"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#193c47"; }} onClick={() => updateStatus("cancelled")}>Cancel</button>
          </>
        )}
        {(reservation.status === "cancelled" || reservation.status === "completed") && (
          <button style={btnOutline} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#193c47"; e.currentTarget.style.color = "#f3f2ee"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#193c47"; }} onClick={() => updateStatus("pending")}>Reopen</button>
        )}
      </div>
    </div>
  );
}
