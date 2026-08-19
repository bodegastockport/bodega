import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

const inputStyle = {
  backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "6px",
  fontFamily: "'Courier New', Courier, monospace", fontSize: "13px",
  padding: "8px 11px", color: "#0A242C", width: "100%", outline: "none",
};
const labelStyle = {
  display: "block", fontSize: "10px", textTransform: "uppercase",
  letterSpacing: "0.08em", color: "#777777", marginBottom: "4px",
  fontFamily: "'Courier New', Courier, monospace",
};

export default function CellarClubCancellation() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setNotFound(true); setLoading(false); return; }

      const { data: members } = await supabase
        .from("cellar_members")
        .select()
        .eq("email", user.email)
        .eq("status", "active");

      if (!members?.length) { setNotFound(true); setLoading(false); return; }

      setMember(members[0]);
      setLoading(false);
    };
    load();
  }, []);

  const daysSinceStart = member?.membership_start
    ? differenceInDays(new Date(), parseISO(member.membership_start))
    : null;
  const withinCoolingOff = daysSinceStart !== null && daysSinceStart <= 14;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: err } = await supabase
      .from("cellar_cancellation_requests")
      .insert({
        member_id: member.id,
        name: member.name,
        email: member.email,
        membership_tier: member.membership_tier,
        membership_start: member.membership_start,
        message: message || null,
      });

    if (err) {
      setSubmitting(false);
      setError("Something went wrong. Please try again, or email us directly at hello@bodegawine.co.uk.");
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  if (loading) return (
    <div className="flex justify-center items-center" style={{ minHeight: "60vh" }}>
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#1E4D5A" }} />
    </div>
  );

  if (notFound) return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      <p className="text-sm mb-2" style={{ color: "#0A242C" }}>No cellar account found</p>
      <p className="text-sm leading-relaxed" style={{ color: "#777777" }}>
        Please <a href="/login" style={{ color: "#1E4D5A" }}>log in</a> to your Cellar Club account to submit a cancellation request.
      </p>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "64px 36px" }}>

        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#0A242C", opacity: 0.5 }}>Cellar Club</p>
        <h1 className="text-2xl mb-6" style={{ color: "#1E4D5A", fontWeight: 400 }}>14-Day Cancellation Request</h1>

        {submitted ? (
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "24px" }}>
            <p className="text-sm mb-2" style={{ color: "#0A242C" }}>Your cancellation request has been submitted.</p>
            <p className="text-sm leading-relaxed" style={{ color: "#777777" }}>
              We'll be in touch shortly to confirm your cancellation and process your refund. If you have any
              questions in the meantime, email us at{" "}
              <a href="mailto:hello@bodegawine.co.uk" style={{ color: "#1E4D5A" }}>hello@bodegawine.co.uk</a>.
            </p>
            <a href="/my-cellar" style={{ display: "inline-block", marginTop: "20px", fontSize: "11px", color: "#1E4D5A", textDecoration: "underline" }}>
              ← Back to My Cellar
            </a>
          </div>
        ) : !withinCoolingOff ? (
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "24px" }}>
            <p className="text-sm mb-2" style={{ color: "#0A242C" }}>This form is only available within your first 14 days of membership.</p>
            <p className="text-sm leading-relaxed" style={{ color: "#777777" }}>
              Your membership began on {member.membership_start ? format(parseISO(member.membership_start), "d MMMM yyyy") : "—"},
              which is outside the 14-day cooling-off window. If you'd like to cancel your membership, you can do
              this from the Membership tab in My Cellar, or by contacting us at{" "}
              <a href="mailto:hello@bodegawine.co.uk" style={{ color: "#1E4D5A" }}>hello@bodegawine.co.uk</a>.
            </p>
            <a href="/my-cellar" style={{ display: "inline-block", marginTop: "20px", fontSize: "11px", color: "#1E4D5A", textDecoration: "underline" }}>
              ← Back to My Cellar
            </a>
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#0A242C" }}>
              As you're within your first 14 days of membership, you're entitled to cancel and receive a full
              refund under clause 11.1 of the Cellar Club Terms & Conditions. Submitting this form will notify
              Bodega of your decision to cancel — you don't need to do anything else.
            </p>

            <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "20px", marginBottom: "20px" }}>
              <div className="space-y-3">
                <div>
                  <label style={labelStyle}>Name</label>
                  <p className="text-sm" style={{ color: "#0A242C" }}>{member.name}</p>
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <p className="text-sm" style={{ color: "#0A242C" }}>{member.email}</p>
                </div>
                <div>
                  <label style={labelStyle}>Membership tier</label>
                  <p className="text-sm" style={{ color: "#0A242C" }}>{member.membership_tier || "—"}</p>
                </div>
                <div>
                  <label style={labelStyle}>Membership start</label>
                  <p className="text-sm" style={{ color: "#0A242C" }}>
                    {member.membership_start ? format(parseISO(member.membership_start), "d MMMM yyyy") : "—"}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <label style={labelStyle}>Anything you'd like to add? (optional)</label>
              <textarea
                style={{ ...inputStyle, minHeight: "88px", resize: "none", marginBottom: "16px" }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Optional message..."
              />

              {error && <p style={{ fontSize: "11px", color: "#c0392b", marginBottom: "12px" }}>{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "9px 22px", backgroundColor: "#1E4D5A", color: "#f3f2ee",
                  border: "none", fontFamily: "'Courier New', Courier, monospace",
                  fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em",
                  cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1,
                  display: "inline-flex", alignItems: "center", gap: "6px",
                }}
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Submit cancellation request
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
