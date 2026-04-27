import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { parseISO, isToday } from "date-fns";
import { Search, Loader2, CalendarDays } from "lucide-react";
import ReservationCard from "../components/ReservationCard";
import AdminCalendarView from "../components/AdminCalendarView";
import EventsManager from "../components/cms/EventsManager";
import GalleryManager from "../components/cms/GalleryManager";
import HireEnquiriesManager from "../components/cms/HireEnquiriesManager";
import ContactManager from "../components/cms/ContactManager";
import CellarClubManager from "../components/cms/CellarClubManager";

// Roles are stored in Supabase user_metadata: { "role": "admin" } or { "role": "team" }
// "admin" = full access to all tabs
// "team"  = reservations, hire enquiries, messages only

const TAB_STYLE_BASE = {
  padding: "8px 16px",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  border: "none",
  backgroundColor: "transparent",
  cursor: "pointer",
  transition: "color 0.15s",
  borderBottom: "2px solid transparent",
  whiteSpace: "nowrap",
};

const ALL_TABS   = ["reservations", "cellar", "events", "gallery", "hire", "contact", "team"];
const TEAM_TABS  = ["reservations", "hire", "contact"];
const TAB_LABELS = {
  reservations: "Reservations",
  cellar:       "Cellar Club",
  events:       "Events",
  gallery:      "Gallery",
  hire:         "Hire enquiries",
  contact:      "Messages",
  team:         "Team",
};

function TeamManager() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole]   = useState("team");
  const [inviting, setInviting]       = useState(false);
  const [sent, setSent]               = useState(false);
  const [error, setError]             = useState(null);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setError(null);

    const { data, error: fnErr } = await supabase.functions.invoke("invite-team-member", {
      body: { email: inviteEmail, role: inviteRole },
    });

    setInviting(false);
    if (fnErr || data?.error) {
      setError(fnErr?.message || data?.error || "Failed to send invite. Make sure the invite-team-member Edge Function is deployed.");
      return;
    }
    setSent(true);
    setInviteEmail("");
  };

  const s = { backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "13px", padding: "9px 12px", color: "#0A242C", outline: "none", width: "100%" };
  const lbl = { display: "block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#777777", marginBottom: "4px", fontFamily: "'Courier New', Courier, monospace" };

  return (
    <div style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "24px", maxWidth: "480px" }}>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>Invite team member</p>
        <h2 className="text-sm mb-1" style={{ color: "#0A242C", fontWeight: 400 }}>Add someone to the admin</h2>
        <p className="text-xs mb-5 leading-relaxed" style={{ color: "#777777" }}>
          They'll receive an email to sign in. You control their access level — only admin users can invite others.
        </p>

        {sent ? (
          <div>
            <p className="text-sm mb-2" style={{ color: "#0A242C" }}>Invite sent</p>
            <p className="text-xs mb-4" style={{ color: "#777777" }}>They'll receive an email with a link to sign in.</p>
            <button
              onClick={() => setSent(false)}
              style={{ padding: "7px 16px", backgroundColor: "transparent", color: "#1E4D5A", border: "1px solid #1E4D5A", borderRadius: "4px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
            >
              Invite another
            </button>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label style={lbl}>Email address</label>
              <input type="email" required style={s} value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@bodegawine.co.uk" />
            </div>
            <div>
              <label style={lbl}>Access level</label>
              <div className="flex gap-3">
                {[
                  { value: "team",  label: "Team",       desc: "Reservations, hire & messages" },
                  { value: "admin", label: "Full admin",  desc: "Everything + team management" },
                ].map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setInviteRole(value)}
                    style={{ flex: 1, padding: "10px 12px", textAlign: "left", backgroundColor: inviteRole === value ? "#1E4D5A" : "#f3f2ee", color: inviteRole === value ? "#f3f2ee" : "#0A242C", border: `1px solid ${inviteRole === value ? "#1E4D5A" : "#d8d6d0"}`, borderRadius: "4px", cursor: "pointer", fontFamily: "'Courier New', Courier, monospace", transition: "all 0.15s" }}
                  >
                    <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>{label}</p>
                    <p style={{ fontSize: "10px", opacity: 0.75 }}>{desc}</p>
                  </button>
                ))}
              </div>
            </div>
            {error && <p style={{ fontSize: "12px", color: "#c0392b" }}>{error}</p>}
            <button
              type="submit"
              disabled={inviting || !inviteEmail}
              style={{ padding: "8px 20px", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", borderRadius: "4px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: inviting || !inviteEmail ? "not-allowed" : "pointer", opacity: inviting || !inviteEmail ? 0.6 : 1, display: "inline-flex", alignItems: "center", gap: "6px", transition: "background-color 0.15s" }}
            >
              {inviting && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Send invite
            </button>
          </form>
        )}
      </div>
      <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "16px", marginTop: "12px", maxWidth: "480px" }}>
        <p className="text-xs leading-relaxed" style={{ color: "#777777" }}>
          <strong style={{ color: "#0A242C" }}>Team</strong> — reservations, hire enquiries, messages.<br />
          <strong style={{ color: "#0A242C" }}>Full admin</strong> — everything plus Cellar Club, events, gallery and team management.
        </p>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [tab, setTab]                   = useState("reservations");
  const [resTab, setResTab]             = useState("upcoming");
  const [view, setView]                 = useState("list");

  const role      = user?.user_metadata?.role;
  const isAdmin   = role === "admin";
  const isTeam    = role === "team";
  const hasAccess = isAdmin || isTeam;

  const availableTabs = isAdmin ? ALL_TABS : TEAM_TABS;

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("reservations").select().order("date", { ascending: false }).limit(200);
    setReservations(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (!hasAccess) {
    return (
      <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: "360px" }}>
          <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#777777", marginBottom: "12px" }}>Access denied</p>
          <h1 style={{ fontSize: "18px", color: "#1E4D5A", fontWeight: 400, marginBottom: "10px" }}>You don't have admin access</h1>
          <p style={{ fontSize: "12px", color: "#777777", lineHeight: "1.7", marginBottom: "24px" }}>
            Your account hasn't been granted admin access. Contact the Bodega team if you believe this is an error.
          </p>
          <a href="/" style={{ display: "inline-block", padding: "8px 20px", backgroundColor: "transparent", color: "#1E4D5A", border: "1px solid #1E4D5A", borderRadius: "4px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none" }}>
            Back to site
          </a>
        </div>
      </div>
    );
  }

  const filtered = reservations.filter((r) => {
    const q = !search || r.guest_name?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase()) || r.phone?.includes(search);
    if (!q) return false;
    if (resTab === "upcoming") return r.status === "pending" || r.status === "confirmed";
    if (resTab === "today")    return isToday(parseISO(r.date)) && (r.status === "pending" || r.status === "confirmed");
    if (resTab === "past")     return r.status === "completed" || r.status === "cancelled";
    return true;
  });

  const counts = {
    upcoming: reservations.filter(r => r.status === "pending" || r.status === "confirmed").length,
    today:    reservations.filter(r => isToday(parseISO(r.date)) && (r.status === "pending" || r.status === "confirmed")).length,
    past:     reservations.filter(r => r.status === "completed" || r.status === "cancelled").length,
  };

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh" }}>
      <div className="max-w-[1100px] mx-auto px-6 py-10">

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl" style={{ color: "#0A242C", fontWeight: 400 }}>Admin</h1>
            <p className="text-xs mt-1" style={{ color: "#777777" }}>
              Manage all content and bookings for Bodega
              <span style={{ marginLeft: "8px", padding: "2px 8px", backgroundColor: isAdmin ? "#1E4D5A" : "#eceae4", color: isAdmin ? "#f3f2ee" : "#777777", borderRadius: "3px", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {isAdmin ? "Full admin" : "Team"}
              </span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: "1px solid #d8d6d0", marginBottom: "32px" }} className="flex gap-0 overflow-x-auto">
          {availableTabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{ ...TAB_STYLE_BASE, color: tab === t ? "#1E4D5A" : "#777777", borderBottom: tab === t ? "2px solid #1E4D5A" : "2px solid transparent" }}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Reservations */}
        {tab === "reservations" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#777777" }} />
                <input
                  style={{ backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "13px", padding: "8px 12px 8px 36px", color: "#0A242C", outline: "none", width: "260px" }}
                  placeholder="Search by name, email, phone"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {["list", "calendar"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    style={{ padding: "6px 14px", backgroundColor: view === v ? "#1E4D5A" : "transparent", color: view === v ? "#f3f2ee" : "#777777", border: "1px solid", borderColor: view === v ? "#1E4D5A" : "#d8d6d0", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", transition: "all 0.15s" }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {view === "calendar" ? (
              <AdminCalendarView reservations={reservations} onUpdate={load} />
            ) : (
              <>
                <div style={{ borderBottom: "1px solid #d8d6d0" }} className="flex gap-0">
                  {["today", "upcoming", "past"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setResTab(t)}
                      style={{ ...TAB_STYLE_BASE, fontSize: "11px", color: resTab === t ? "#1E4D5A" : "#777777", borderBottom: resTab === t ? "2px solid #1E4D5A" : "2px solid transparent" }}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)} ({counts[t]})
                    </button>
                  ))}
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#1E4D5A" }} />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-20">
                    <CalendarDays className="h-8 w-8 mx-auto mb-3" style={{ color: "#d8d6d0" }} />
                    <p className="text-sm" style={{ color: "#777777" }}>No reservations found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((r) => <ReservationCard key={r.id} reservation={r} onUpdate={load} />)}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === "cellar"  && isAdmin && <CellarClubManager />}
        {tab === "events"  && isAdmin && <EventsManager />}
        {tab === "gallery" && isAdmin && <GalleryManager />}
        {tab === "hire"    && <HireEnquiriesManager />}
        {tab === "contact" && <ContactManager />}
        {tab === "team"    && isAdmin && <TeamManager />}
      </div>
    </div>
  );
}