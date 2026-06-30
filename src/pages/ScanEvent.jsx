import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Calendar, User, Users, AlertTriangle } from "lucide-react";

export default function ScanEvent() {
  const { id }              = useParams();
  const navigate            = useNavigate();
  const { user: authUser }  = useAuth();

  const [booking,  setBooking]  = useState(null);
  const [event,    setEvent]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [checking, setChecking] = useState(false);
  const [done,     setDone]     = useState(false);
  const [error,    setError]    = useState(null);

  const role      = authUser?.user_metadata?.role;
  const hasAccess = role === "admin" || role === "team";

  useEffect(() => {
    if (!authUser) return;
    loadBooking();
  }, [id, authUser]);

  async function loadBooking() {
    setLoading(true);
    setError(null);

    const { data: bookingData, error: bookingErr } = await supabase
      .from("event_bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (bookingErr || !bookingData) {
      setError("Booking not found. The QR code may be out of date.");
      setLoading(false);
      return;
    }

    setBooking(bookingData);

    if (bookingData.event_id) {
      const { data: eventData } = await supabase
        .from("events")
        .select("id, title, date, time")
        .eq("id", bookingData.event_id)
        .single();
      setEvent(eventData || null);
    }

    setLoading(false);
  }

  async function handleCheckIn() {
    if (!booking) return;
    setChecking(true);
    setError(null);

    const { error: updateErr } = await supabase
      .from("event_bookings")
      .update({ attended: true })
      .eq("id", booking.id);

    if (updateErr) {
      setError("Failed to check in. Please try again.");
      setChecking(false);
      return;
    }

    setDone(true);
    setChecking(false);
  }

  if (!authUser) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <AlertTriangle style={{ color: "#c0392b", margin: "0 auto 12px", display: "block" }} size={28} />
          <p style={headingStyle}>Not signed in</p>
          <p style={mutedStyle}>Please sign in first.</p>
          <button onClick={() => navigate("/team-login")} style={btnStyle}>Team sign in</button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <AlertTriangle style={{ color: "#c0392b", margin: "0 auto 12px", display: "block" }} size={28} />
          <p style={headingStyle}>Access denied</p>
          <p style={mutedStyle}>Staff access only.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ ...pageStyle, justifyContent: "center" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "#1E4D5A" }} />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <AlertTriangle style={{ color: "#c0392b", margin: "0 auto 12px", display: "block" }} size={28} />
          <p style={headingStyle}>Booking not found</p>
          <p style={mutedStyle}>{error}</p>
          <button onClick={() => navigate("/admin")} style={btnOutlineStyle}>Back to admin</button>
        </div>
      </div>
    );
  }

  if (booking?.status === "cancelled") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#c0392b", marginBottom: "16px", textAlign: "center" }}>
            Booking cancelled
          </p>
          <p style={headingStyle}>{booking.guest_name}</p>
          <div style={dividerStyle} />
          <p style={mutedStyle}>This booking has been cancelled and should not be checked in.</p>
          <button onClick={() => navigate("/admin")} style={{ ...btnOutlineStyle, marginTop: "20px" }}>Back to admin</button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#1E4D5A", marginBottom: "16px", textAlign: "center" }}>Success</p>
          <p style={headingStyle}>{booking.guest_name}{event ? ` checked in for ${event.title}` : " checked in"}.</p>
          <div style={dividerStyle} />
          <button onClick={() => navigate("/admin")} style={{ ...btnOutlineStyle, marginTop: "4px" }}>Back to admin</button>
        </div>
      </div>
    );
  }

  if (booking?.attended) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#777777", marginBottom: "16px", textAlign: "center" }}>
            Already checked in
          </p>
          <p style={headingStyle}>{booking.guest_name}</p>
          {event && <p style={mutedStyle}>{event.title}</p>}
          <div style={dividerStyle} />
          <p style={mutedStyle}>This party has already been checked in.</p>
          <button onClick={() => navigate("/admin")} style={{ ...btnOutlineStyle, marginTop: "20px" }}>Back to admin</button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#777777", marginBottom: "20px" }}>
          Bodega Events — Check-in
        </p>

        {event && (
          <div style={rowStyle}>
            <Calendar size={14} style={{ color: "#1E4D5A", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={labelStyle}>Event</p>
              <p style={valueStyle}>{event.title}</p>
              <p style={mutedStyle}>
                {new Date(event.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                {event.time && ` · ${event.time}`}
              </p>
            </div>
          </div>
        )}

        <div style={rowStyle}>
          <User size={14} style={{ color: "#1E4D5A", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p style={labelStyle}>Guest</p>
            <p style={valueStyle}>{booking.guest_name}</p>
            <p style={mutedStyle}>{booking.email}</p>
            <p style={mutedStyle}>{booking.phone}</p>
          </div>
        </div>

        {booking.dietary_requirements && (
          <div style={rowStyle}>
            <div style={{ width: 14, flexShrink: 0 }} />
            <div>
              <p style={labelStyle}>Dietary requirements</p>
              <p style={valueStyle}>{booking.dietary_requirements}</p>
            </div>
          </div>
        )}

        <div style={{ ...rowStyle, borderBottom: "none", paddingBottom: 0 }}>
          <Users size={14} style={{ color: "#1E4D5A", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p style={labelStyle}>Party size</p>
            <p style={{ ...valueStyle, fontSize: "22px" }}>{booking.party_size}</p>
          </div>
        </div>

        {error && <p style={{ fontSize: "12px", color: "#c0392b", marginTop: "12px" }}>{error}</p>}

        <div style={dividerStyle} />

        <button
          onClick={handleCheckIn}
          disabled={checking}
          style={{ ...btnStyle, opacity: checking ? 0.6 : 1, cursor: checking ? "not-allowed" : "pointer" }}
        >
          {checking
            ? <><Loader2 size={14} className="animate-spin" /> Checking in…</>
            : `Check in party of ${booking.party_size}`
          }
        </button>

        <button onClick={() => navigate("/admin")} style={{ ...btnOutlineStyle, marginTop: "8px" }}>
          Cancel
        </button>

      </div>
    </div>
  );
}

const pageStyle = { backgroundColor: "#f3f2ee", minHeight: "100vh", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", fontFamily: "'Courier New', Courier, monospace" };
const cardStyle = { backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "28px 24px", width: "100%", maxWidth: "360px" };
const headingStyle = { fontSize: "16px", color: "#0A242C", fontWeight: 400, marginBottom: "4px", textAlign: "center", fontFamily: "'Courier New', Courier, monospace" };
const mutedStyle = { fontSize: "12px", color: "#777777", margin: "2px 0", textAlign: "center", fontFamily: "'Courier New', Courier, monospace" };
const labelStyle = { fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#777777", marginBottom: "2px", fontFamily: "'Courier New', Courier, monospace" };
const valueStyle = { fontSize: "14px", color: "#0A242C", fontWeight: 400, fontFamily: "'Courier New', Courier, monospace" };
const rowStyle = { display: "flex", gap: "10px", paddingBottom: "12px", borderBottom: "1px solid #d8d6d0", marginBottom: "12px" };
const dividerStyle = { borderTop: "1px solid #d8d6d0", margin: "20px 0" };
const btnStyle = { width: "100%", padding: "12px", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", borderRadius: "0px", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background-color 0.15s" };
const btnOutlineStyle = { width: "100%", padding: "10px", backgroundColor: "transparent", color: "#777777", border: "1px solid #d8d6d0", borderRadius: "0px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.15s" };
