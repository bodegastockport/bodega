import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Wine, User, MapPin, AlertTriangle } from "lucide-react";

export default function ScanBottle() {
  const { id }             = useParams();
  const navigate           = useNavigate();
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
    if (!authUser) return;
    loadBottle();
  }, [id, authUser]);

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

    const { error: updateErr } = await supabase
      .from("cellar_bottles")
      .update({
        status: "consumed",
        checked_out_at: new Date().toISOString(),
      })
      .eq("id", bottle.id);

    if (updateErr) {
      setError("Failed to check out. Please try again.");
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

  if (error && !bottle) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <AlertTriangle style={{ color: "#c0392b", margin: "0 auto 12px", display: "block" }} size={28} />
          <p style={headingStyle}>Bottle not found</p>
          <p style={mutedStyle}>{error}</p>
          <button onClick={() => navigate("/admin")} style={btnOutlineStyle}>Back to admin</button>
        </div>
      </div>
    );
  }

  // ── Success — MUST come before consumed check
  if (done) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#1E4D5A", marginBottom: "16px", textAlign: "center" }}>Success</p>
          <p style={headingStyle}>{bottle.wine_name}{bottle.vintage ? ` · ${bottle.vintage}` : ""} has been checked out{member ? ` for ${member.name}` : ""}.</p>
          <div style={dividerStyle} />
          <button onClick={() => navigate("/admin")} style={{ ...btnOutlineStyle, marginTop: "4px" }}>Back to admin</button>
        </div>
      </div>
    );
  }

  // ── Already consumed
  if (bottle?.status === "consumed" || bottle?.status === "checked_out") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#777777", marginBottom: "16px", textAlign: "center" }}>
            Already checked out
          </p>
          <p style={headingStyle}>{bottle.wine_name}</p>
          {bottle.vintage && <p style={mutedStyle}>{bottle.vintage}</p>}
          <div style={dividerStyle} />
          <p style={mutedStyle}>This bottle has already been checked out. If it has been returned, please re-add it to the member's account.</p>
          <button onClick={() => navigate("/admin")} style={{ ...btnOutlineStyle, marginTop: "20px" }}>Back to admin</button>
        </div>
      </div>
    );
  }

  // ── Main scan view
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#777777", marginBottom: "20px" }}>
          Bodega Cellar Club — Checkout
        </p>

        <div style={rowStyle}>
          <Wine size={14} style={{ color: "#1E4D5A", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p style={labelStyle}>Bottle</p>
            <p style={valueStyle}>{bottle.wine_name}</p>
            {bottle.vintage && <p style={mutedStyle}>{bottle.vintage}</p>}
            {bottle.type    && <p style={mutedStyle}>{bottle.type}</p>}
          </div>
        </div>

        {bottle.cellar_location && (
          <div style={rowStyle}>
            <MapPin size={14} style={{ color: "#1E4D5A", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={labelStyle}>Location</p>
              <p style={valueStyle}>{bottle.cellar_location}</p>
            </div>
          </div>
        )}

        {member && (
          <div style={rowStyle}>
            <User size={14} style={{ color: "#1E4D5A", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={labelStyle}>Member</p>
              <p style={valueStyle}>{member.name}</p>
              {member.locker_number && <p style={mutedStyle}>Bay {member.locker_number}</p>}
            </div>
          </div>
        )}

        <div style={{ ...rowStyle, borderBottom: "none", paddingBottom: 0 }}>
          <div style={{ width: 14, flexShrink: 0 }} />
          <div>
            <p style={labelStyle}>Quantity in vault</p>
            <p style={{ ...valueStyle, fontSize: "22px" }}>{bottle.quantity}</p>
          </div>
        </div>

        {error && <p style={{ fontSize: "12px", color: "#c0392b", marginTop: "12px" }}>{error}</p>}

        <div style={dividerStyle} />

        <button
          onClick={handleCheckOut}
          disabled={checking}
          style={{ ...btnStyle, opacity: checking ? 0.6 : 1, cursor: checking ? "not-allowed" : "pointer" }}
        >
          {checking
            ? <><Loader2 size={14} className="animate-spin" /> Checking out…</>
            : "Check out 1 bottle"
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