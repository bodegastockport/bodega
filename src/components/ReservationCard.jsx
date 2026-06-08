import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { supabase } from "@/lib/supabase";

const STATUS_STYLES = {
  confirmed: { backgroundColor: "#eaf0ec", color: "#2e6b45", border: "1px solid #c8dace" },
  completed: { backgroundColor: "#eceae4", color: "#777777", border: "1px solid #d8d6d0" },
};

const btnPrimary = {
  padding: "6px 16px", backgroundColor: "#1E4D5A", color: "#f3f2ee",
  border: "none", borderRadius: "0px", fontFamily: "'Courier New', Courier, monospace",
  fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em",
  cursor: "pointer", transition: "background-color 0.15s",
};

const btnOutline = {
  padding: "6px 16px", backgroundColor: "transparent", color: "#1E4D5A",
  border: "1px solid #1E4D5A", borderRadius: "0px", fontFamily: "'Courier New', Courier, monospace",
  fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em",
  cursor: "pointer", transition: "background-color 0.15s, color 0.15s",
};

export default function ReservationCard({ reservation, onUpdate }) {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(reservation.table_id || "");
  const [reassigning, setReassigning] = useState(false);

  useEffect(() => {
    const loadTables = async () => {
      const { data } = await supabase
        .from("tables")
        .select("id, name, capacity")
        .eq("active", true)
        .order("name");
      setTables(data || []);
    };
    loadTables();
  }, []);

  const updateStatus = async (newStatus) => {
    await supabase.from("reservations").update({ status: newStatus }).eq("id", reservation.id);
    onUpdate();
  };

  const deleteReservation = async () => {
    await supabase.from("reservations").delete().eq("id", reservation.id);
    onUpdate();
  };

  const reassignTable = async (tableId) => {
    setReassigning(true);
    setSelectedTable(tableId);
    await supabase
      .from("reservations")
      .update({ table_id: tableId || null })
      .eq("id", reservation.id);
    setReassigning(false);
    onUpdate();
  };

  const statusStyle = STATUS_STYLES[reservation.status] || STATUS_STYLES.confirmed;

  return (
    <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "20px", fontFamily: "'Courier New', Courier, monospace" }}>
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <p className="text-sm" style={{ color: "#0A242C" }}>{reservation.guest_name}</p>
          <p className="text-xs mt-0.5" style={{ color: "#777777" }}>{reservation.email}</p>
        </div>
        <span style={{ ...statusStyle, fontSize: "11px", padding: "3px 10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {reservation.status}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {[
          { label: "Date", value: format(parseISO(reservation.date), "dd MMM yyyy") },
          { label: "Time", value: reservation.time },
          { label: "Guests", value: reservation.party_size },
          { label: "Phone", value: reservation.phone },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "#777777" }}>{label}</p>
            <p className="text-xs" style={{ color: "#0A242C" }}>{value}</p>
          </div>
        ))}
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>Table</p>
          <select
            value={selectedTable}
            onChange={(e) => reassignTable(e.target.value)}
            disabled={reassigning || reservation.status === "completed"}
            style={{
              backgroundColor: "#f3f2ee",
              border: "1px solid #d8d6d0",
              borderRadius: "0px",
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "11px",
              color: "#0A242C",
              padding: "3px 6px",
              cursor: reservation.status === "completed" ? "default" : "pointer",
              outline: "none",
              width: "100%",
              opacity: reassigning ? 0.6 : 1,
            }}
          >
            <option value="">— none —</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.capacity})
              </option>
            ))}
          </select>
        </div>
      </div>

      {reservation.special_requests && (
        <div style={{ backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", padding: "10px 12px", marginBottom: "16px" }}>
          <p className="text-xs" style={{ color: "#777777" }}>{reservation.special_requests}</p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {reservation.status === "confirmed" && (
          <>
            <button
              style={btnPrimary}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0A242C"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1E4D5A"}
              onClick={() => updateStatus("completed")}
            >
              Mark complete
            </button>
            <button
              style={btnOutline}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#1E4D5A"; e.currentTarget.style.color = "#f3f2ee"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#1E4D5A"; }}
              onClick={deleteReservation}
            >
              Cancel
            </button>
          </>
        )}
        {reservation.status === "completed" && (
          <button
            style={btnOutline}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#1E4D5A"; e.currentTarget.style.color = "#f3f2ee"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#1E4D5A"; }}
            onClick={() => updateStatus("confirmed")}
          >
            Reopen
          </button>
        )}
      </div>
    </div>
  );
}