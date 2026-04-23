import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function MyCellar() {
  const [member, setMember] = useState(null);
  const [storedBottles, setStoredBottles] = useState([]);
  const [consumedBottles, setConsumedBottles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setNotFound(true); setLoading(false); return; }

      const { data: members } = await supabase
        .from('cellar_members')
        .select()
        .eq('email', user.email);

      if (!members?.length) { setNotFound(true); setLoading(false); return; }

      const m = members[0];
      setMember(m);

      const { data: bottles } = await supabase
        .from('cellar_bottles')
        .select()
        .eq('member_id', m.id);

      setStoredBottles((bottles || []).filter(b => b.status !== 'consumed'));
      setConsumedBottles((bottles || []).filter(b => b.status === 'consumed'));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center" style={{ minHeight: "60vh" }}>
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#193c47" }} />
    </div>
  );

  if (notFound) return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      <p className="text-sm mb-2" style={{ color: "#2e282a" }}>No cellar account found</p>
      <p className="text-sm leading-relaxed" style={{ color: "#777777" }}>
        We couldn't find a Cellar Club account linked to your email. Please contact us at Bodega to get set up.
      </p>
    </div>
  );

  const totalStored = storedBottles.reduce((s, b) => s + (b.quantity || 1), 0);

  const TAB_STYLE = (active) => ({
    padding: "6px 16px",
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    border: "none",
    cursor: "pointer",
    backgroundColor: active ? "#193c47" : "#f3f2ee",
    color: active ? "#f3f2ee" : "#777777",
    transition: "background-color 0.15s",
  });

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh" }}>
      <div className="max-w-[1100px] mx-auto px-6 py-10 sm:py-14">

        {/* Hero panel */}
        <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "32px", marginBottom: "24px" }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded shrink-0 flex items-center justify-center" style={{ backgroundColor: "#d8d6d0" }}>
              <span style={{ fontSize: "20px", color: "#193c47" }}>{member.name?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>Cellar Club Member</p>
              <h1 className="text-xl" style={{ color: "#2e282a", fontWeight: 400 }}>{member.name}</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Bottles stored", value: totalStored },
              { label: "Locker / bay", value: member.locker_number || "—" },
              { label: "Member since", value: member.membership_start ? format(parseISO(member.membership_start), "MMM yyyy") : "—" },
              { label: "Status", value: member.status || "pending" },
            ].map(({ label, value }) => (
              <div key={label} style={{ backgroundColor: "#f3f2ee", borderRadius: "4px", padding: "14px" }}>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>{label}</p>
                <p className="text-sm capitalize" style={{ color: "#2e282a" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-6" style={{ border: "1px solid #d8d6d0", borderRadius: "4px", overflow: "hidden", width: "fit-content" }}>
          {[["inventory", "My bottles"], ["history", "History"], ["membership", "Membership"]].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{ ...TAB_STYLE(activeTab === key), borderRight: key !== "membership" ? "1px solid #d8d6d0" : "none" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Inventory tab */}
        {activeTab === "inventory" && (
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "24px" }}>
            <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "#777777" }}>
              Current inventory <span style={{ textTransform: "none", letterSpacing: "normal", color: "#777777" }}>({totalStored} bottles)</span>
            </p>
            {storedBottles.length === 0 ? (
              <p className="text-sm text-center py-12" style={{ color: "#777777" }}>No bottles stored yet.</p>
            ) : (
              <div style={{ borderTop: "1px solid #d8d6d0" }}>
                {storedBottles.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-3 gap-3" style={{ borderBottom: "1px solid #d8d6d0" }}>
                    <div>
                      <p className="text-sm" style={{ color: "#2e282a" }}>{b.wine_name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#777777" }}>
                        {[b.producer, b.vintage, b.cellar_location].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: "#2e282a", backgroundColor: "#d8d6d0", padding: "3px 8px", borderRadius: "3px" }}>×{b.quantity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History tab */}
        {activeTab === "history" && (
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "24px" }}>
            <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "#777777" }}>Consumption history</p>
            {consumedBottles.length === 0 ? (
              <p className="text-sm text-center py-12" style={{ color: "#777777" }}>No consumed bottles yet.</p>
            ) : (
              <div style={{ borderTop: "1px solid #d8d6d0" }}>
                {consumedBottles.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-3 gap-3" style={{ borderBottom: "1px solid #d8d6d0" }}>
                    <div>
                      <p className="text-sm" style={{ color: "#2e282a" }}>{b.wine_name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#777777" }}>
                        {[b.producer, b.vintage].filter(Boolean).join(" · ")}
                        {b.checked_out_at && ` · Consumed ${format(parseISO(b.checked_out_at), "d MMM yyyy")}`}
                      </p>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: "#777777" }}>×{b.quantity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Membership tab */}
        {activeTab === "membership" && (
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "24px" }}>
            <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "#777777" }}>Membership details</p>
            <div className="space-y-4">
              {[
                { label: "Tier", value: member.membership_tier || "—" },
                { label: "Status", value: member.status || "—" },
                { label: "Member since", value: member.membership_start ? format(parseISO(member.membership_start), "d MMMM yyyy") : "—" },
                { label: "Locker / bay", value: member.locker_number || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between" style={{ borderBottom: "1px solid #d8d6d0", paddingBottom: "12px" }}>
                  <p className="text-xs uppercase tracking-widest" style={{ color: "#777777" }}>{label}</p>
                  <p className="text-xs capitalize" style={{ color: "#2e282a" }}>{value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs mt-6" style={{ color: "#777777" }}>
              To update your membership details, please contact us at{" "}
              <a href="mailto:hello@bodegawine.co.uk" style={{ color: "#193c47" }}>hello@bodegawine.co.uk</a>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
