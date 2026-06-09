import { useState, useEffect } from "react";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WALKIN_CAP_SEATS = 14;

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

function generateTimeSlots(from, to, slotDuration) {
  const slots = [];
  const [fromH, fromM] = from.split(":").map(Number);
  const [toH, toM] = to.split(":").map(Number);
  const fromMins = fromH * 60 + fromM;
  const toMins = toH * 60 + toM;
  for (let m = fromMins; m <= toMins; m += slotDuration) {
    const h = Math.floor(m / 60).toString().padStart(2, "0");
    const min = (m % 60).toString().padStart(2, "0");
    slots.push(`${h}:${min}`);
  }
  return slots;
}

export default function BookingForm({ onSuccess }) {
  const [form, setForm] = useState({
    guest_name: "", email: "", phone: "",
    date: null, time: "", party_size: "", special_requests: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [focused, setFocused] = useState(null);

  const [openDays, setOpenDays] = useState({});
  const [slotDuration, setSlotDuration] = useState(30);
  const [bookingLeadDays, setBookingLeadDays] = useState(28);
  const [walkinCapEnabled, setWalkinCapEnabled] = useState(false);
  const [minNoticeHours, setMinNoticeHours] = useState(0);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [availableSlots, setAvailableSlots] = useState([]);
  const [maxPartySize, setMaxPartySize] = useState(10);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase.from('bar_settings').select();
      if (data?.length) {
        const map = {};
        data.forEach((r) => { map[r.key] = r.value; });
        if (map.open_days) { try { setOpenDays(JSON.parse(map.open_days)); } catch {} }
        if (map.slot_duration) setSlotDuration(parseInt(map.slot_duration));
        if (map.booking_lead_days) setBookingLeadDays(parseInt(map.booking_lead_days));
        if (map.walkin_cap_enabled) setWalkinCapEnabled(map.walkin_cap_enabled === "true");
        if (map.min_notice_hours) setMinNoticeHours(parseInt(map.min_notice_hours));
      }
      setSettingsLoaded(true);
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (!form.date || !settingsLoaded) return;
    const checkAvailability = async () => {
      setCheckingAvailability(true);
      setAvailableSlots([]);
      setForm(p => ({ ...p, time: "", party_size: "" }));

      const dayName = DAYS[form.date.getDay()];
      const dayConfig = openDays[dayName];

      if (!dayConfig?.open) { setCheckingAvailability(false); return; }

      const dateStr = format(form.date, "yyyy-MM-dd");
      const now = new Date();

      const { data: allTables } = await supabase.from('tables').select().eq('active', true);
      const { data: overrides } = await supabase.from('table_date_overrides').select('table_id').eq('date', dateStr).eq('available', false);

      const overriddenIds = (overrides || []).map(o => o.table_id);
      const tables = (allTables || []).filter(t => !overriddenIds.includes(t.id));

      if (!tables.length) { setCheckingAvailability(false); return; }

      const { data: existingReservations } = await supabase
        .from('reservations')
        .select('table_id, time, party_size')
        .eq('date', dateStr)
        .in('status', ['confirmed']);

      const slots = generateTimeSlots(dayConfig.from, dayConfig.to, slotDuration);
      const availableSlotSet = new Set();
      let maxAvailableCapacity = 0;

      slots.forEach(slot => {
        if (minNoticeHours > 0) {
          const [slotH, slotM] = slot.split(":").map(Number);
          const slotDateTime = new Date(form.date);
          slotDateTime.setHours(slotH, slotM, 0, 0);
          const cutoff = new Date(now.getTime() + minNoticeHours * 60 * 60 * 1000);
          if (slotDateTime <= cutoff) return;
        }

        const slotReservations = (existingReservations || []).filter(r => r.time === slot);
        const bookedTableIds = slotReservations.map(r => r.table_id);
        const freeTables = tables.filter(t => !bookedTableIds.includes(t.id));

        if (freeTables.length === 0) return;

        if (walkinCapEnabled) {
          const seatsBooked = slotReservations.reduce((sum, r) => sum + (r.party_size || 0), 0);
          if (seatsBooked >= WALKIN_CAP_SEATS) return;
        }

        availableSlotSet.add(slot);
        const maxCap = Math.max(...freeTables.map(t => t.capacity));
        if (maxCap > maxAvailableCapacity) maxAvailableCapacity = maxCap;
      });

      setAvailableSlots([...availableSlotSet]);
      setMaxPartySize(maxAvailableCapacity);
      setCheckingAvailability(false);
    };
    checkAvailability();
  }, [form.date, settingsLoaded, openDays, slotDuration, walkinCapEnabled, minNoticeHours]);

  const isDateDisabled = (date) => {
    if (isBefore(date, startOfToday())) return true;
    if (date > addDays(new Date(), bookingLeadDays)) return true;
    const dayName = DAYS[date.getDay()];
    return !openDays[dayName]?.open;
  };

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const isValid = form.guest_name && form.email && form.phone && form.date && form.time && form.party_size;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setError(null);

    const dateStr = format(form.date, "yyyy-MM-dd");
    const partySize = Number(form.party_size);

    if (minNoticeHours > 0) {
      const [slotH, slotM] = form.time.split(":").map(Number);
      const slotDateTime = new Date(form.date);
      slotDateTime.setHours(slotH, slotM, 0, 0);
      const cutoff = new Date(Date.now() + minNoticeHours * 60 * 60 * 1000);
      if (slotDateTime <= cutoff) {
        setError("Sorry, bookings must be made further in advance. Please choose another time.");
        setSubmitting(false);
        return;
      }
    }

    const { data: overrides } = await supabase.from('table_date_overrides').select('table_id').eq('date', dateStr).eq('available', false);
    const overriddenIds = (overrides || []).map(o => o.table_id);

    const { data: tables } = await supabase.from('tables').select().eq('active', true).gte('capacity', partySize).order('capacity', { ascending: true });
    const { data: bookedAtSlot } = await supabase.from('reservations').select('table_id, party_size').eq('date', dateStr).eq('time', form.time).in('status', ['confirmed']);

    const bookedIds = (bookedAtSlot || []).map(r => r.table_id);

    if (walkinCapEnabled) {
      const seatsBooked = (bookedAtSlot || []).reduce((sum, r) => sum + (r.party_size || 0), 0);
      if (seatsBooked >= WALKIN_CAP_SEATS) {
        setError("Sorry, that slot is no longer available. Please choose another time.");
        setSubmitting(false);
        return;
      }
    }

    const availableTable = (tables || []).find(t => !bookedIds.includes(t.id) && !overriddenIds.includes(t.id));

    if (!availableTable) {
      setError("Sorry, that slot is no longer available. Please choose another time.");
      setSubmitting(false);
      return;
    }

    const { data, error: err } = await supabase.from('reservations').insert({
      guest_name: form.guest_name,
      email: form.email,
      phone: form.phone,
      date: dateStr,
      time: form.time,
      party_size: partySize,
      special_requests: form.special_requests || null,
      status: "confirmed",
      table_id: availableTable.id,
    }).select().single();

    setSubmitting(false);
    if (err) { setError("Something went wrong. Please try again."); return; }
    onSuccess(data);
  };

  const getInputStyle = (field) => ({ ...inputStyle, borderColor: focused === field ? "#1E4D5A" : "#d8d6d0" });
  const partySizes = Array.from({ length: maxPartySize }, (_, i) => i + 1);

  if (!settingsLoaded) return (
    <div className="flex justify-center py-8">
      <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#1E4D5A" }} />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label style={labelStyle}>Date</label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button type="button" style={{ ...getInputStyle("date"), textAlign: "left", cursor: "pointer" }} onFocus={() => setFocused("date")} onBlur={() => setFocused(null)}>
                <span style={{ color: form.date ? "#0A242C" : "#777777", fontSize: "13px" }}>
                  {form.date ? format(form.date, "d MMM") : "Select"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={form.date} onSelect={(d) => { update("date", d); setCalendarOpen(false); }} disabled={isDateDisabled} />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label style={labelStyle}>Time</label>
          <Select value={form.time} onValueChange={(v) => update("time", v)} disabled={!form.date || checkingAvailability || availableSlots.length === 0}>
            <SelectTrigger style={getInputStyle("time")} onFocus={() => setFocused("time")} onBlur={() => setFocused(null)}>
              {checkingAvailability ? <Loader2 className="h-3 w-3 animate-spin" /> : <SelectValue placeholder={form.date ? "Time" : "Date first"} />}
            </SelectTrigger>
            <SelectContent>
              {availableSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label style={labelStyle}>Guests</label>
          <Select value={form.party_size} onValueChange={(v) => update("party_size", v)} disabled={!form.time}>
            <SelectTrigger style={getInputStyle("party_size")} onFocus={() => setFocused("party_size")} onBlur={() => setFocused(null)}>
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {partySizes.map((n) => <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "guest" : "guests"}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {form.date && !checkingAvailability && availableSlots.length === 0 && (
        <p style={{ fontSize: "12px", color: "#c0392b" }}>No availability on this date. Please try another day.</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>Full name</label>
          <input style={getInputStyle("guest_name")} placeholder="Your name" value={form.guest_name} onChange={(e) => update("guest_name", e.target.value)} onFocus={() => setFocused("guest_name")} onBlur={() => setFocused(null)} />
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input style={getInputStyle("phone")} placeholder="07XXX XXXXXX" value={form.phone} onChange={(e) => update("phone", e.target.value)} onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Email</label>
        <input type="email" style={getInputStyle("email")} placeholder="your@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} />
      </div>

      <div>
        <label style={labelStyle}>Special requests <span style={{ color: "#aaa", textTransform: "none", letterSpacing: "normal" }}>(optional)</span></label>
        <textarea style={{ ...getInputStyle("special_requests"), minHeight: "56px", resize: "none" }} placeholder="Allergies, celebrations, seating preferences..." value={form.special_requests} onChange={(e) => update("special_requests", e.target.value)} onFocus={() => setFocused("special_requests")} onBlur={() => setFocused(null)} />
      </div>

      {error && <p style={{ fontSize: "12px", color: "#c0392b" }}>{error}</p>}

      <button
        type="submit"
        disabled={!isValid || submitting}
        style={{ width: "100%", padding: "9px 24px", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", borderRadius: "0px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: isValid && !submitting ? "pointer" : "not-allowed", opacity: !isValid || submitting ? 0.6 : 1, transition: "background-color 0.15s, opacity 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
        onMouseEnter={e => { if (isValid && !submitting) e.currentTarget.style.backgroundColor = "#0A242C"; }}
        onMouseLeave={e => { if (isValid && !submitting) e.currentTarget.style.backgroundColor = "#1E4D5A"; }}
      >
        {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Reserving...</> : "Reserve a table"}
      </button>
    </form>
  );
}