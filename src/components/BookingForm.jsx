import { useState } from "react";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Tue–Sun, 2pm–9pm (last slot 21:00 for a table)
const TIME_SLOTS = [
  "14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30","18:00","18:30","19:00","19:30",
  "20:00","20:30","21:00",
];
const PARTY_SIZES = Array.from({ length: 10 }, (_, i) => i + 1); // max 10

const inputStyle = {
  backgroundColor: "#f3f2ee",
  border: "1px solid #d8d6d0",
  borderRadius: "4px",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "13px",
  padding: "7px 10px",
  color: "#2e282a",
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

// Disable Mondays (getDay() === 1) and dates more than 4 weeks ahead
const isDateDisabled = (date) => {
  if (isBefore(date, startOfToday())) return true;
  if (date.getDay() === 1) return true; // Monday
  if (date > addDays(new Date(), 28)) return true; // 4 weeks max
  return false;
};

export default function BookingForm({ onSuccess }) {
  const [form, setForm] = useState({
    guest_name: "", email: "", phone: "",
    date: null, time: "", party_size: "", special_requests: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [focused, setFocused] = useState(null);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const isValid = form.guest_name && form.email && form.phone && form.date && form.time && form.party_size;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('reservations')
      .insert({
        guest_name: form.guest_name,
        email: form.email,
        phone: form.phone,
        date: format(form.date, "yyyy-MM-dd"),
        time: form.time,
        party_size: Number(form.party_size),
        special_requests: form.special_requests || null,
        status: "pending",
      })
      .select()
      .single();

    setSubmitting(false);

    if (err) {
      setError("Something went wrong. Please try again.");
      return;
    }

    onSuccess(data);
  };

  const getInputStyle = (field) => ({
    ...inputStyle,
    borderColor: focused === field ? "#193c47" : "#d8d6d0",
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Date / Time / Guests */}
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
                <span style={{ color: form.date ? "#2e282a" : "#777777", fontSize: "13px" }}>
                  {form.date ? format(form.date, "d MMM") : "Select"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={form.date}
                onSelect={(d) => { update("date", d); setCalendarOpen(false); }}
                disabled={isDateDisabled}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label style={labelStyle}>Time</label>
          <Select value={form.time} onValueChange={(v) => update("time", v)}>
            <SelectTrigger style={getInputStyle("time")} onFocus={() => setFocused("time")} onBlur={() => setFocused(null)}>
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label style={labelStyle}>Guests</label>
          <Select value={form.party_size} onValueChange={(v) => update("party_size", v)}>
            <SelectTrigger style={getInputStyle("party_size")} onFocus={() => setFocused("party_size")} onBlur={() => setFocused(null)}>
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {PARTY_SIZES.map((n) => <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "guest" : "guests"}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>Full name</label>
          <input
            style={getInputStyle("guest_name")}
            placeholder="Your name"
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
          placeholder="your@email.com"
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

      {error && (
        <p style={{ fontSize: "12px", color: "#c0392b" }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={!isValid || submitting}
        style={{
          width: "100%",
          padding: "9px 24px",
          backgroundColor: "#193c47",
          color: "#f3f2ee",
          border: "none",
          borderRadius: "4px",
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
        onMouseEnter={e => { if (isValid && !submitting) e.currentTarget.style.backgroundColor = "#2d6272"; }}
        onMouseLeave={e => { if (isValid && !submitting) e.currentTarget.style.backgroundColor = "#193c47"; }}
      >
        {submitting ? (
          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Reserving...</>
        ) : "Reserve a table"}
      </button>
    </form>
  );
}
