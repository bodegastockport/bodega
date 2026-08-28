import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const FALLBACK_DURATION = 30;

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isOverlapping(startA, durationA, startB, durationB) {
  const aStart = timeToMinutes(startA);
  const aEnd = aStart + durationA;
  const bStart = timeToMinutes(startB);
  const bEnd = bStart + durationB;
  return aStart < bEnd && bStart < aEnd;
}

const inputStyle = {
  backgroundColor: "#f3f2ee",
  border: "1px solid #d8d6d0",
  borderRadius: "4px",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "13px",
  padding: "7px 10px",
  color: "#0A242C",
  width: "100%",
  outline: "none",
  transition: "border-color 0.15s",
};

const labelStyle = {
  display: "block",
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#777777",
  marginBottom: "3px",
  fontFamily: "'Courier New', Courier, monospace",
};

export default function AdminBookingForm({ onAdded, onCancel }) {
  const [form, setForm] = useState({
    guest_name: "",
    email: "",
    phone: "",
    date: null,
    time: "",
    table_id: "",
    party_size: "",
    special_requests: "",
  });
  const [tables, setTables] = useState([]);
  const [slotDuration, setSlotDuration] = useState(FALLBACK_DURATION);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [focused, setFocused] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: tableData } = await supabase
        .from("tables")
        .select("id, name, capacity")
        .eq("active", true)
        .order("name");
      setTables(tableData || []);

      const { data: settingsData } = await supabase.from("bar_settings").select();
      const row = (settingsData || []).find((r) => r.key === "slot_duration");
      if (row?.value) setSlotDuration(parseInt(row.value));
    };
    loadData();
  }, []);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const getInputStyle = (field) => ({ ...inputStyle, borderColor: focused === field ? "#1E4D5A" : "#d8d6d0" });

  const isValid = form.guest_name && form.email && form.phone && form.date && form.time && form.table_id && form.party_size;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setError(null);

    const dateStr = format(form.date, "yyyy-MM-dd");

    const { data: existing, error: fetchErr } = await supabase
      .from("reservations")
      .select("time")
      .eq("date", dateStr)
      .eq("table_id", form.table_id)
      .eq("status", "confirmed");

    if (fetchErr) {
      setError("Could not check table availability. Please try again.");
      setSubmitting(false);
      return;
    }

    const conflict = (existing || []).some((r) =>
      isOverlapping(r.time, slotDuration, form.time, slotDuration)
    );

    if (conflict) {
      setError("That table already has a confirmed booking overlapping this time. Choose a different table or time.");
      setSubmitting(false);
      return;
    }

    const { data, error: err } = await supabase
      .from("reservations")
      .insert({
        guest_name: form.guest_name,
        email: form.email,
        phone: form.phone,
        date: dateStr,
        time: form.time,
        party_size: Number(form.party_size),
        special_requests: form.special_requests || null,
        status: "confirmed",
        table_id: form.table_id,
      })
      .select()
      .single();

    setSubmitting(false);
    if (err) {
      setError("Something went wrong. Please try again.");
      return;
    }
    onAdded(data);
  };

  return (
    <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "24px", fontFamily: "'Courier New', Courier, monospace" }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs uppercase tracking-widest" style={{ color: "#777777" }}>Add booking</p>
        <button
          type="button"
          onClick={onCancel}
          style={{ fontSize: "11px", color: "#777777", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em" }}
        >
          Close
        </button>
      </div>
      <p className="text-xs mb-5 leading-relaxed" style={{ color: "#777777" }}>
        This bypasses the normal booking rules — opening days, minimum notice and the walk-in cap don't apply here. Table conflicts are still checked.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label style={labelStyle}>Date</label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  style={{ ...getInputStyle("date"), textAlign: "left", cursor: "pointer" }}
                  onFocus={() => setFocused("date")}
                  onBlur={() => setFocused(null)}
                >
                  <span style={{ color: form.date ? "#0A242C" : "#777777", fontSize: "13px" }}>
                    {form.date ? format(form.date, "d MMM yyyy") : "Select"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={form.date} onSelect={(d) => { update("date", d); setCalendarOpen(false); }} />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label style={labelStyle}>Time</label>
            <input
              type="time"
              style={getInputStyle("time")}
              value={form.time}
              onChange={(e) => update("time", e.target.value)}
              onFocus={() => setFocused("time")}
              onBlur={() => setFocused(null)}
            />
          </div>

          <div>
            <label style={labelStyle}>Guests</label>
            <input
              type="number"
              min="1"
              style={getInputStyle("party_size")}
              placeholder="Size"
              value={form.party_size}
              onChange={(e) => update("party_size", e.target.value)}
              onFocus={() => setFocused("party_size")}
              onBlur={() => setFocused(null)}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Table</label>
          <Select value={form.table_id} onValueChange={(v) => update("table_id", v)}>
            <SelectTrigger style={getInputStyle("table_id")} onFocus={() => setFocused("table_id")} onBlur={() => setFocused(null)}>
              <SelectValue placeholder="Select a table" />
            </SelectTrigger>
            <SelectContent>
              {tables.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} ({t.capacity})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>Full name</label>
            <input
              style={getInputStyle("guest_name")}
              placeholder="Guest name"
              value={form.guest_name}
              onChange={(e) => update("guest_name", e.target.value)}
              onFocus={() => setFocused("guest_name")}
              onBlur={() => setFocused(null)}
            />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input
              style={getInputStyle("phone")}
              placeholder="07XXX XXXXXX"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              onFocus={() => setFocused("phone")}
              onBlur={() => setFocused(null)}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            style={getInputStyle("email")}
            placeholder="guest@email.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
          />
        </div>

        <div>
          <label style={labelStyle}>Special requests <span style={{ color: "#aaa", textTransform: "none", letterSpacing: "normal" }}>(optional)</span></label>
          <textarea
            style={{ ...getInputStyle("special_requests"), minHeight: "56px", resize: "none" }}
            placeholder="Allergies, celebrations, seating preferences..."
            value={form.special_requests}
            onChange={(e) => update("special_requests", e.target.value)}
            onFocus={() => setFocused("special_requests")}
            onBlur={() => setFocused(null)}
          />
        </div>

        {error && <p style={{ fontSize: "12px", color: "#c0392b" }}>{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!isValid || submitting}
            style={{
              padding: "9px 24px",
              backgroundColor: "#1E4D5A",
              color: "#f3f2ee",
              border: "none",
              borderRadius: "0px",
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              cursor: isValid && !submitting ? "pointer" : "not-allowed",
              opacity: !isValid || submitting ? 0.6 : 1,
              transition: "background-color 0.15s, opacity 0.15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => { if (isValid && !submitting) e.currentTarget.style.backgroundColor = "#0A242C"; }}
            onMouseLeave={(e) => { if (isValid && !submitting) e.currentTarget.style.backgroundColor = "#1E4D5A"; }}
          >
            {submitting ? (<><Loader2 className="h-3.5 w-3.5 animate-spin" /> Adding...</>) : "Add booking"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "9px 24px",
              backgroundColor: "transparent",
              color: "#1E4D5A",
              border: "1px solid #1E4D5A",
              borderRadius: "0px",
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              cursor: "pointer",
              transition: "background-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1E4D5A"; e.currentTarget.style.color = "#f3f2ee"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#1E4D5A"; }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
