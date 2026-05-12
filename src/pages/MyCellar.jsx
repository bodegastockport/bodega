import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";

function ImageLightbox({ url, label, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(10,36,44,0.92)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", cursor: "pointer" }}
    >
      <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", opacity: 0.6 }}>{label}</p>
      <img
        src={url}
        alt={label}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain", cursor: "default" }}
      />
      <p className="text-xs mt-4" style={{ color: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", opacity: 0.4 }}>Click anywhere to close</p>
    </div>
  );
}

export default function MyCellar() {
  const [member, setMember] = useState(null);
  const [storedBottles, setStoredBottles] = useState([]);
  const [consumedBottles, setConsumedBottles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory");
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [lightbox, setLightbox] = useState(null);

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

      const m = members[0];
      setMember(m);

      const { data: bottles } = await supabase
        .from("cellar_bottles")
        .select()
        .eq("member_id", m.id);

      setStoredBottles((bottles || []).filter(b => b.status !== "consumed"));
      setConsumedBottles((bottles || []).filter(b => b.status === "consumed"));
      setLoading(false);
    };
    load();
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    const { error } = await supabase
      .from("cellar_members")
      .update({ status: "inactive" })
      .eq("id", member.id);
    if (!error) setCancelled(true);
    setCancelling(false);
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
        We couldn't find an active Cellar Club account linked to your email. Please contact us at{" "}
        <a href="mailto:hello@bodegawine.co.uk" style={{ color: "#1E4D5A" }}>hello@bodegawine.co.uk</a>.
      </p>
    </div>
  );

  const totalStored = storedBottles.length;

  const TAB_STYLE = (active) => ({
    padding: "6px 16px",
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    border: "none",
    cursor: "pointer",
    backgroundColor: active ? "#1E4D5A" : "#f3f2ee",
    color: active ? "#f3f2ee" : "#777777",
    transition: "background-color 0.15s",
  });

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh" }}>
      {lightbox && <ImageLightbox url={lightbox.url} label={lightbox.label} onClose={() => setLightbox(null)} />}

      <div className="max-w-[1100px] mx-auto px-6 py-10 sm:py-14">

        <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "32px", marginBottom: "24px" }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 shrink-0 flex items-center justify-center" style={{ backgroundColor: "#d8d6d0" }}>
              <span style={{ fontSize: "20px", color: "#1E4D5A" }}>{member.name?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>Cellar Club Member</p>
              <h1 className="text-xl" style={{ color: "#0A242C", fontWeight: 400 }}>{member.name}</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Bottles stored", value: totalStored },
              { label: "Member since", value: member.membership_start ? format(parseISO(member.membership_start), "MMM yyyy") : "—" },
            ].map(({ label, value }) => (
              <div key={label} style={{ backgroundColor: "#f3f2ee", padding: "14px" }}>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>{label}</p>
                <p className="text-sm" style={{ color: "#0A242C" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-0 mb-6" style={{ border: "1px solid #d8d6d0", overflow: "hidden", width: "fit-content" }}>
          {[["inventory", "My bottles"], ["history", "History"], ["membership", "Membership"]].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{ ...TAB_STYLE(activeTab === key), borderRight: key !== "membership" ? "1px solid #d8d6d0" : "none" }}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === "inventory" && (
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "24px" }}>
            <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "#777777" }}>
              Current inventory <span style={{ textTransform: "none", letterSpacing: "normal" }}>({totalStored} bottles)</span>
            </p>
            {storedBottles.length === 0 ? (
              <p className="text-sm text-center py-12" style={{ color: "#777777" }}>No bottles stored yet.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {storedBottles.map((b) => (
                  <div key={b.id} style={{ backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", overflow: "hidden" }}>
                    <div
                      onClick={() => b.image_front_url && setLightbox({ url: b.image_front_url, label: b.wine_name })}
                      style={{ position: "relative", paddingBottom: "125%", backgroundColor: "#eceae4", cursor: b.image_front_url ? "pointer" : "default", overflow: "hidden" }}
                    >
                      {b.image_front_url ? (
                        <>
                          <img
                            src={b.image_front_url}
                            alt={b.wine_name}
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <div
                            style={{ position: "absolute", inset: 0, backgroundColor: "rgba(10,36,44,0)", transition: "background-color 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(10,36,44,0.2)"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(10,36,44,0)"}
                          />
                        </>
                      ) : (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <p style={{ fontSize: "10px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em" }}>No image</p>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "12px" }}>
                      <p className="text-xs mb-1" style={{ color: "#0A242C", fontWeight: 500 }}>{b.wine_name}</p>
                      {b.producer && <p style={{ fontSize: "10px", color: "#777777", marginBottom: "4px" }}>{b.producer}</p>}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {b.vintage && <span style={{ fontSize: "10px", color: "#777777" }}>{b.vintage}</span>}
                        {b.type && <span style={{ fontSize: "10px", color: "#777777" }}>· {b.type}</span>}
                      </div>
                      {b.notes && <p style={{ fontSize: "10px", color: "#777777", marginTop: "6px", fontStyle: "italic" }}>{b.notes}</p>}
                      {b.image_back_url && (
                        <button
                          onClick={() => setLightbox({ url: b.image_back_url, label: "Back label — " + b.wine_name })}
                          style={{ marginTop: "8px", fontSize: "10px", color: "#1E4D5A", background: "none", border: "none", cursor: "pointer", fontFamily: "'Courier New', Courier, monospace", textTransform: "uppercase", letterSpacing: "0.06em", padding: 0, textDecoration: "underline" }}
                        >
                          View back label
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "24px" }}>
            <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "#777777" }}>Consumption history</p>
            {consumedBottles.length === 0 ? (
              <p className="text-sm text-center py-12" style={{ color: "#777777" }}>No consumed bottles yet.</p>
            ) : (
              <div style={{ borderTop: "1px solid #d8d6d0" }}>
                {consumedBottles.map((b) => (
                  <div key={b.id} className="flex items-start justify-between py-3 gap-3" style={{ borderBottom: "1px solid #d8d6d0" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm" style={{ color: "#0A242C" }}>{b.wine_name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#777777" }}>
                        {[b.producer, b.vintage].filter(Boolean).join(" · ")}
                        {b.checked_out_at && ` · Consumed ${format(parseISO(b.checked_out_at), "d MMM yyyy")}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "membership" && (
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "24px" }}>
            <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "#777777" }}>Membership details</p>

            {cancelled ? (
              <div style={{ backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", padding: "20px", marginBottom: "24px" }}>
                <p className="text-sm mb-2" style={{ color: "#0A242C" }}>Your membership has been cancelled.</p>
                <p className="text-xs leading-relaxed" style={{ color: "#777777" }}>
                  If you have bottles in storage, please contact us at{" "}
                  <a href="mailto:hello@bodegawine.co.uk" style={{ color: "#1E4D5A" }}>hello@bodegawine.co.uk</a> to arrange collection.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-8">
                  {[
                    { label: "Tier", value: member.membership_tier || "—" },
                    { label: "Member since", value: member.membership_start ? format(parseISO(member.membership_start), "d MMMM yyyy") : "—" },
                    { label: "Email", value: member.email || "—" },
                    { label: "Phone", value: member.phone || "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between" style={{ borderBottom: "1px solid #d8d6d0", paddingBottom: "12px" }}>
                      <p className="text-xs uppercase tracking-widest" style={{ color: "#777777" }}>{label}</p>
                      <p className="text-xs" style={{ color: "#0A242C" }}>{value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs mb-8" style={{ color: "#777777" }}>
                  To update your membership details, please contact us at{" "}
                  <a href="mailto:hello@bodegawine.co.uk" style={{ color: "#1E4D5A" }}>hello@bodegawine.co.uk</a>.
                </p>

                <div style={{ borderTop: "1px solid #d8d6d0", paddingTop: "24px" }}>
                  {!confirmCancel ? (
                    <button
                      onClick={() => setConfirmCancel(true)}
                      style={{ fontSize: "11px", color: "#777777", background: "none", border: "none", cursor: "pointer", fontFamily: "'Courier New', Courier, monospace", textTransform: "uppercase", letterSpacing: "0.06em", textDecoration: "underline" }}
                    >
                      Cancel membership
                    </button>
                  ) : (
                    <div>
                      <p className="text-xs mb-4" style={{ color: "#0A242C" }}>
                        Are you sure you want to cancel your membership? If you have bottles in storage, please contact us to arrange collection before cancelling.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleCancel}
                          disabled={cancelling}
                          style={{ padding: "8px 20px", backgroundColor: "#c0392b", color: "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: cancelling ? "not-allowed" : "pointer", opacity: cancelling ? 0.6 : 1, display: "flex", alignItems: "center", gap: "6px" }}
                        >
                          {cancelling && <Loader2 className="h-3 w-3 animate-spin" />} Yes, cancel my membership
                        </button>
                        <button
                          onClick={() => setConfirmCancel(false)}
                          style={{ padding: "8px 16px", backgroundColor: "transparent", color: "#777777", border: "1px solid #d8d6d0", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}
                        >
                          Keep membership
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}