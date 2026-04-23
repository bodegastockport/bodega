import { useState } from "react";
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReservationCard from "./ReservationCard";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AdminCalendarView({ reservations, onUpdate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const activeReservations = reservations.filter((r) => r.status === "pending" || r.status === "confirmed");
  const getReservationsForDay = (day) => activeReservations.filter((r) => isSameDay(parseISO(r.date), day));
  const selectedDayReservations = getReservationsForDay(selectedDate);

  return (
    <div className="space-y-6" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "20px" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm" style={{ color: "#2e282a" }}>{format(currentMonth, "MMMM yyyy")}</p>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              style={{ padding: "4px", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "#777777" }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              style={{ padding: "4px", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "#777777" }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", color: "#777777", padding: "4px 0" }}>{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayRes = getReservationsForDay(day);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                style={{
                  minHeight: "48px",
                  textAlign: "left",
                  padding: "6px",
                  borderRadius: "4px",
                  backgroundColor: isSelected ? "#193c47" : "transparent",
                  border: isToday && !isSelected ? "1px solid #193c47" : "1px solid transparent",
                  opacity: isCurrentMonth ? 1 : 0.3,
                  cursor: "pointer",
                  transition: "background-color 0.15s",
                }}
              >
                <span style={{ fontSize: "11px", color: isSelected ? "#f3f2ee" : "#2e282a", display: "block" }}>{format(day, "d")}</span>
                {dayRes.length > 0 && (
                  <span style={{ fontSize: "9px", color: isSelected ? "rgba(243,242,238,0.8)" : "#193c47", display: "block", marginTop: "2px" }}>
                    {dayRes.length} bk
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm" style={{ color: "#2e282a" }}>{format(selectedDate, "EEEE, d MMMM")}</p>
          <span className="text-xs" style={{ color: "#777777" }}>
            {selectedDayReservations.length === 0 ? "No bookings" : `${selectedDayReservations.length} booking${selectedDayReservations.length > 1 ? "s" : ""} · ${selectedDayReservations.reduce((s, r) => s + (r.party_size || 0), 0)} guests`}
          </span>
        </div>

        {selectedDayReservations.length === 0 ? (
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "40px", textAlign: "center" }}>
            <p className="text-sm" style={{ color: "#777777" }}>No reservations for this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDayReservations.sort((a, b) => a.time.localeCompare(b.time)).map((r) => (
              <ReservationCard key={r.id} reservation={r} onUpdate={onUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}