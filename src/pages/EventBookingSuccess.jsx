import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function EventBookingSuccess() {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");

      if (!sessionId) {
        setError("Missing booking reference.");
        setLoading(false);
        return;
      }

      const { data, error: fnErr } = await supabase.functions.invoke("get-event-booking-session", {
        body: { session_id: sessionId },
      });

      if (fnErr || data?.error) {
        setError(data?.error || "We couldn't find that booking.");
        setLoading(false);
        return;
      }

      setBooking(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "calc(100vh - 56px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
      <div style={{ maxWidth: "440px", width: "100%", textAlign: "center" }}>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin mx-auto" style={{ color: "#1E4D5A" }} />
        ) : error ? (
          <>
            <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#777777", marginBottom: "12px" }}>Booking confirmed</p>
            <h1 style={{ fontSize: "18px", color: "#1E4D5A", fontWeight: 400, marginBottom: "10px" }}>Thanks for booking</h1>
            <p style={{ fontSize: "12px", color: "#0A242C", lineHeight: "1.7", marginBottom: "24px" }}>
              Your payment was successful. We couldn't load your booking summary here, but a confirmation with your ticket has been sent to your email.
            </p>
          </>
        ) : (
          <>
            <CheckCircle className="h-8 w-8 mx-auto mb-4" style={{ color: "#1E4D5A" }} />
            <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#777777", marginBottom: "12px" }}>Booking confirmed</p>
            <h1 style={{ fontSize: "20px", color: "#1E4D5A", fontWeight: 400, marginBottom: "8px" }}>{booking.event_title}</h1>
            <p style={{ fontSize: "13px", color: "#0A242C", marginBottom: "4px" }}>
              {new Date(booking.event_date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              {booking.event_time && ` at ${booking.event_time}`}
            </p>
            <p style={{ fontSize: "13px", color: "#0A242C", marginBottom: "24px" }}>
              Party of {booking.party_size}
            </p>
            <p style={{ fontSize: "12px", color: "#777777", lineHeight: "1.7", marginBottom: "24px" }}>
              Your ticket and QR code have been sent to your email. Show it on arrival — one scan covers your whole party.
            </p>
          </>
        )}
        <Link to="/events" style={{ display: "inline-block", padding: "8px 20px", backgroundColor: "transparent", color: "#1E4D5A", border: "1px solid #1E4D5A", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none" }}>
          Back to events
        </Link>
      </div>
    </div>
  );
}
