import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Wine, User, MapPin, CheckCircle, AlertTriangle } from "lucide-react";

export default function ScanBottle() {
  const { id }       = useParams();
  const { user }     = useNavigate();
  const navigate     = useNavigate();
  const { user: authUser } = useAuth();

  const [bottle,   setBottle]   = useState(null);
  const [member,   setMember]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [checking, setChecking] = useState(false);
  const [done,     setDone]     = useState(false);
  const [error,    setError]    = useState(null);

  const role      = authUser?.user_metadata?.role;
  const hasAccess = role === "admin" || role === "team";

  useEffect(() => {
    if (!hasAccess) return;
    loadBottle();
  }, [id]);

  async function loadBottle() {
    setLoading(true);
    setError(null);

    const { data: bottleData, error: bottleErr } = await supabase
      .from("cellar_bottles")
      .select("*")
      .eq("id", id)
      .single();

    if (bottleErr || !bottleData) {
      setError("Bottle not found. The QR code may be out of date.");
      setLoading(false);
      return;
    }

    setBottle(bottleData);

    if (bottleData.member_id) {
      const { data: memberData } = await supabase
        .from("cellar_members")
        .select("id, name, email, phone, locker_number, status")
        .eq("id", bottleData.member_id)
        .single();
      setMember(memberData || null);
    }

    setLoading(false);
  }

  async function handleCheckOut() {
    if (!bottle) return;
    setChecking(true);
    setError(null);

    const newQty = (bottle.quantity || 1) - 1;

    const { error: updateErr } = await supabase
      .from("cellar_bottles")
      .update({
        quantity:   newQty,
        status:     newQty <= 0 ? "checked_out" : bottle.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bottle.id);

    if (updateErr) {
      setError("Failed to check out. Please try again.");
      setChecking(false);
      return;
    }

    setDone(true);
    setChecking(false);
    // Refresh bottle data to show updated quantity
    setBottle(prev => ({ ...prev, quantity: newQty, status: newQty <= 0 ? "checked_out" : prev.status }));
  }

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!hasAccess) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <AlertTriangle style={{ color: "#c0392b", margin: "0 auto 12px", display: "block" }} size={28} />
          <p style={headingStyle}>Not signed in</p>
          <p style={mutedStyle}>Please sign in to the admin panel first.</p>
          <button onClick={() => navigate("/login")} style={btnStyle}>
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ ...pageStyle, justifyContent: "center" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "#193c47" }} />
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (error && !bottle) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <AlertTriangle style={{ color: "#c0392b", margin: "0 auto 12px", display: "block" }} size={28} />
          <p style={headingStyle}>Bottle not found</p>
          <p style={mutedStyle}>{error}</p>
          <button onClick={() => navigate("/admin#cellar")} style={btnOutlineStyle}>
            Back to Cellar Club
          </button>
        </div>
      </div>
    );
  }

  // ── Already checked out ────────────────────────────────────────────────────
  if (bottle?.status === "checked_out") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#777777", marginBottom: "16px" }}>
            Already checked out
          </p>
          <p style={headingStyle}>{bottle.wine_name}</p>
          {bottle.vintage && <p style={mutedStyle}>{bottle.vintage}</p>}
          <div style={dividerStyle} />
          <p style={mutedStyle}>This bottle has already been checked out. If it has been returned, please re-add it to the member's account.</p>
          <button onClick={() => navigate("/admin#cellar")} style={{ ...btnOutlineStyle, marginTop: "20px" }}>
            Back to Cellar Club
          </button>
        </div>
      </div>
    );
  }

  // ── Checked out successfully ───────────────────────────────────────────────
  if (done) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <CheckCircle style={{ color: "#1a5c38", margin: "0 auto 12px", display: "block" }} size={32} />
          <p style={{ ...headingStyle, color: "#1a5c38" }}>Checked out</p>
          <p style={mutedStyle}>{bottle.wine_name}{bottle.vintage ? ` · ${bottle.vintage}` : ""}</p>
          {bottle.quantity > 0 && (
            <p style={{ ...mutedStyle, marginTop: "8px" }}>
              {bottle.quantity} {bottle.quantity === 1 ? "bottle" : "bottles"} remaining in vault
            </p>
          )}
          {bottle.quantity <= 0 && (
            <p style={{ ...mutedStyle, marginTop: "8px" }}>No bottles remaining — record marked as checked out</p>
          )}
          <div style={dividerStyle} />
          {member && (
            <p style={mutedStyle}>{member.name}</p>
          )}
          <button onClick={() => navigate("/admin#cellar")} style={{ ...btnOutlineStyle, marginTop: "20px" }}>
            Back to Cellar Club
          </button>
        </div>
      </div>
    );
  }

  // ── Main scan view ─────────────────────────────────────────────────────────
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#777777", marginBottom: "20px" }}>
          Bodega Cellar Club — Checkout
        </p>

        {/* Bottle details */}
        <div style={rowStyle}>
          <Wine size={14} style={{ color: "#193c47", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p style={labelStyle}>Bottle</p>
            <p style={valueStyle}>{bottle.wine_name}</p>
            {bottle.vintage && <p style={mutedStyle}>{bottle.vintage}</p>}
            {bottle.type    && <p style={mutedStyle}>{bottle.type}</p>}
          </div>
        </div>

        {/* Location */}
        {(bottle.section || bottle.position) && (
          <div style={rowStyle}>
            <MapPin size={14} style={{ color: "#193c47", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={labelStyle}>Location</p>
              <p style={valueStyle}>
                {[bottle.section, bottle.position].filter(Boolean).join(" / ")}
              </p>
            </div>
          </div>
        )}

        {/* Member */}
        {member && (
          <div style={rowStyle}>
            <User size={14} style={{ color: "#193c47", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={labelStyle}>Member</p>
              <p style={valueStyle}>{member.name}</p>
              {member.locker_number && <p style={mutedStyle}>Bay {member.locker_number}</p>}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div style={{ ...rowStyle, borderBottom: "none", paddingBottom: 0 }}>
          <div style={{ width: 14, flexShrink: 0 }} />
          <div>
            <p style={labelStyle}>Quantity in vault</p>
            <p style={{ ...valueStyle, fontSize: "22px" }}>{bottle.quantity}</p>
          </div>
        </div>

        {error && (
          <p style={{ fontSize: "12px", color: "#c0392b", marginTop: "12px" }}>{error}</p>
        )}

        <div style={dividerStyle} />

        {/* Check out button */}
        <button
          onClick={handleCheckOut}
          disabled={checking}
          style={{
            ...btnStyle,
            opacity: checking ? 0.6 : 1,
            cursor: checking ? "not-allowed" : "pointer",
          }}
        >
          {checking
            ? <><Loader2 size={14} className="animate-spin" /> Checking out…</>
            : `Check out 1 bottle`
          }
        </button>

        <button
          onClick={() => navigate("/admin#cellar")}
          style={{ ...btnOutlineStyle, marginTop: "8px" }}
        >
          Cancel
        </button>

      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const pageStyle = {
  backgroundColor: "#f3f2ee",
  minHeight: "100vh",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "40px 16px",
  fontFamily: "'Courier New', Courier, monospace",
};

const cardStyle = {
  backgroundColor: "#eceae4",
  border: "1px solid #d8d6d0",
  borderRadius: "6px",
  padding: "28px 24px",
  width: "100%",
  maxWidth: "360px",
};

const headingStyle = {
  fontSize: "16px",
  color: "#2e282a",
  fontWeight: 400,
  marginBottom: "4px",
  textAlign: "center",
  fontFamily: "'Courier New', Courier, monospace",
};

const mutedStyle = {
  fontSize: "12px",
  color: "#777777",
  margin: "2px 0",
  textAlign: "center",
  fontFamily: "'Courier New', Courier, monospace",
};

const labelStyle = {
  fontSize: "9px",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "#777777",
  marginBottom: "2px",
  fontFamily: "'Courier New', Courier, monospace",
};

const valueStyle = {
  fontSize: "14px",
  color: "#2e282a",
  fontWeight: 400,
  fontFamily: "'Courier New', Courier, monospace",
};

const rowStyle = {
  display: "flex",
  gap: "10px",
  paddingBottom: "12px",
  borderBottom: "1px solid #d8d6d0",
  marginBottom: "12px",
};

const dividerStyle = {
  borderTop: "1px solid #d8d6d0",
  margin: "20px 0",
};

const btnStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#193c47",
  color: "#f3f2ee",
  border: "none",
  borderRadius: "4px",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  transition: "background-color 0.15s",
};

const btnOutlineStyle = {
  width: "100%",
  padding: "10px",
  backgroundColor: "transparent",
  color: "#777777",
  border: "1px solid #d8d6d0",
  borderRadius: "4px",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "border-color 0.15s",
};
