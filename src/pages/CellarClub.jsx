import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

// When Stripe is set up, replace these priceId values with your real Stripe price_xxx IDs
// Create one Stripe product per tier with monthly recurring billing
const TIERS = [
  { name: "Cellar 6",      bottles: 6,  price: "£21.00", type: "Individual", priceId: "price_CELLAR6_PLACEHOLDER" },
  { name: "Cellar 12",     bottles: 12, price: "£33.50", type: "Individual", priceId: "price_CELLAR12_PLACEHOLDER" },
  { name: "Cellar 18",     bottles: 18, price: "£47.00", type: "Individual", priceId: "price_CELLAR18_PLACEHOLDER" },
  { name: "Corporate 6",   bottles: 6,  price: "£31.50", type: "Corporate",  priceId: "price_CORP6_PLACEHOLDER" },
  { name: "Corporate 12",  bottles: 12, price: "£50.50", type: "Corporate",  priceId: "price_CORP12_PLACEHOLDER" },
  { name: "Corporate 18",  bottles: 18, price: "£70.50", type: "Corporate",  priceId: "price_CORP18_PLACEHOLDER" },
  { name: "Corporate 24",  bottles: 24, price: "£91.75", type: "Corporate",  priceId: "price_CORP24_PLACEHOLDER" },
];

// Early bird Cellar 6 — June 2026 signups and Weir Mill residents
const EARLY_BIRD_PRICE_ID = "price_EARLYBIRD_PLACEHOLDER"; // £15.00/month
const EARLY_BIRD_PRICE = "£15.00";

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

const BLANK = {
  name: "", email: "", phone: "", dob: "", tier: "",
  early_bird_code: "", how_heard: "", message: "", marketing: false,
};

export default function CellarClub() {
  const [form, setForm] = useState(BLANK);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("Individual");
  const [activeTab, setActiveTab] = useState("info");

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const filteredTiers = TIERS.filter((t) => t.type === selectedType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.tier) return;
    setSubmitting(true);
    setError(null);

    const selectedTier = TIERS.find(t => t.name === form.tier);
    const isEarlyBird = form.early_bird_code?.trim().length > 0 && selectedTier?.name === "Cellar 6";
    const priceId = isEarlyBird ? EARLY_BIRD_PRICE_ID : selectedTier?.priceId;

    const { data: member, error: memberErr } = await supabase
      .from('cellar_members')
      .insert({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        birthday: form.dob || null,
        membership_tier: form.tier,
        how_did_you_hear: form.how_heard || null,
        marketing_opt_in: form.marketing,
        is_early_bird: isEarlyBird,
        notes: [
          form.early_bird_code && `Early bird code: ${form.early_bird_code}`,
          form.message,
        ].filter(Boolean).join("\n") || null,
        status: "pending",
      })
      .select()
      .single();

    if (memberErr) {
      setSubmitting(false);
      setError("Something went wrong. Please try again.");
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  const TAB_BUTTON = (key, label) => (
    <button
      key={key}
      onClick={() => setActiveTab(key)}
      style={{
        padding: "6px 16px",
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "11px",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        border: "none",
        borderRight: key !== "join" ? "1px solid #d8d6d0" : "none",
        cursor: "pointer",
        backgroundColor: activeTab === key ? "#193c47" : "#f3f2ee",
        color: activeTab === key ? "#f3f2ee" : "#777777",
        transition: "background-color 0.15s",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace" }}>

      {/* ── INFO TAB — full height split layout ── */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: "calc(100vh - 56px)" }}>

          {/* Left — text content */}
          <div className="px-6 py-8 flex flex-col justify-start">

            {/* Header */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>Members only</p>
              <h1 className="text-xl mb-2" style={{ color: "#193c47", fontWeight: 400 }}>The Cellar Club</h1>
              <p className="text-xs leading-relaxed" style={{ color: "#777777", maxWidth: "420px" }}>
                Store your wine collection beneath the bar. Bring it up whenever you like, enjoy it with friends, and let us take care of the rest.
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-0 mb-8" style={{ border: "1px solid #d8d6d0", borderRadius: "4px", overflow: "hidden", width: "fit-content" }}>
              {TAB_BUTTON("info", "About")}
              {TAB_BUTTON("pricing", "Pricing")}
              {TAB_BUTTON("join", "Join")}
            </div>

            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#777777" }}>How it works</p>
            <h2 className="text-lg mb-3" style={{ color: "#193c47", fontWeight: 400 }}>Your collection, beneath the bar</h2>
            <p className="text-xs leading-relaxed mb-2" style={{ color: "#777777", maxWidth: "420px" }}>
              Beneath Bodega lies a temperature-controlled vault. As a member, you rent a dedicated space — keeping your wine at the perfect conditions for long-term ageing.
            </p>
            <p className="text-xs leading-relaxed mb-6" style={{ color: "#777777", maxWidth: "420px" }}>
              Whenever you visit, simply let us know which bottles you'd like and we'll bring them up. A modest corkage fee applies.
            </p>

            {/* Feature points — no border lines */}
            <div className="space-y-4 mb-6">
              {[
                { title: "Climate-controlled storage", body: "Your bottles held at ideal temperature and humidity — a professionally managed vault." },
                { title: "Drink your own here", body: "Bring stored bottles to any table. A modest corkage fee applies — no need to carry anything in." },
                { title: "Member perks", body: "Priority reservations, exclusive tastings, early access to limited allocations." },
              ].map(({ title, body }) => (
                <div key={title}>
                  <p className="text-xs mb-1" style={{ color: "#2e282a" }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#777777" }}>{body}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6" style={{ maxWidth: "380px" }}>
              {[
                { label: "Temperature", value: "Precisely controlled" },
                { label: "Location", value: "Beneath Bodega" },
                { label: "Access", value: "Staff-managed" },
                { label: "Billing", value: "Monthly, via Stripe" },
              ].map(({ label, value }) => (
                <div key={label} style={{ backgroundColor: "#eceae4", borderRadius: "4px", padding: "10px 12px" }}>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>{label}</p>
                  <p className="text-xs" style={{ color: "#2e282a" }}>{value}</p>
                </div>
              ))}
            </div>

            <p className="text-xs" style={{ color: "#777777" }}>
              Already a member?{" "}
              <a href="/my-cellar" style={{ color: "#193c47", textDecoration: "none", borderBottom: "1px solid #193c47" }}>
                Log in to your account →
              </a>
            </p>
          </div>

          {/* Right — full height image */}
          <div style={{ position: "relative", minHeight: "50vh" }}>
            <img
              src="/images/cellar-club.jpg"
              alt="Wine vault"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      )}

      {/* ── PRICING + JOIN TABS — standard layout ── */}
      {activeTab !== "info" && (
        <div className="px-6 py-8">

          {/* Header */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>Members only</p>
            <h1 className="text-xl mb-2" style={{ color: "#193c47", fontWeight: 400 }}>The Cellar Club</h1>
            <p className="text-xs leading-relaxed" style={{ color: "#777777", maxWidth: "520px" }}>
              Store your wine collection beneath the bar. Bring it up whenever you like, enjoy it with friends, and let us take care of the rest.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-0 mb-6" style={{ border: "1px solid #d8d6d0", borderRadius: "4px", overflow: "hidden", width: "fit-content" }}>
            {TAB_BUTTON("info", "About")}
            {TAB_BUTTON("pricing", "Pricing")}
            {TAB_BUTTON("join", "Join")}
          </div>

          {/* ── PRICING TAB ── */}
          {activeTab === "pricing" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs uppercase tracking-widest" style={{ color: "#777777" }}>Monthly pricing</p>
                <div className="flex gap-0" style={{ border: "1px solid #d8d6d0", borderRadius: "4px", overflow: "hidden" }}>
                  {["Individual", "Corporate"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      style={{ padding: "5px 14px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", border: "none", cursor: "pointer", backgroundColor: selectedType === type ? "#193c47" : "#f3f2ee", color: selectedType === type ? "#f3f2ee" : "#777777", transition: "background-color 0.15s" }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {selectedType === "Individual" && (
                <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "4px", padding: "10px 14px", marginBottom: "12px" }}>
                  <p className="text-xs" style={{ color: "#777777" }}>
                    <strong style={{ color: "#2e282a" }}>Early bird — June 2026:</strong> Cellar 6 memberships at <strong style={{ color: "#193c47" }}>{EARLY_BIRD_PRICE}/month</strong>. Weir Mill residents receive the same rate within 30 days of tenancy start. Use your early bird code at sign-up.
                  </p>
                </div>
              )}

              <div style={{ border: "1px solid #d8d6d0", borderRadius: "4px", overflow: "hidden" }}>
                {filteredTiers.map((tier, i) => (
                  <div key={tier.name} className="flex items-center justify-between" style={{ padding: "10px 16px", borderTop: i > 0 ? "1px solid #d8d6d0" : "none", backgroundColor: i % 2 === 0 ? "#f3f2ee" : "#eceae4" }}>
                    <div>
                      <p className="text-xs" style={{ color: "#2e282a" }}>{tier.name}</p>
                      <p className="text-xs" style={{ color: "#aaa" }}>Up to {tier.bottles} bottles</p>
                    </div>
                    <p className="text-xs" style={{ color: "#193c47" }}>{tier.price}<span style={{ color: "#aaa" }}>/month</span></p>
                  </div>
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: "#aaa" }}>Prices increase annually in line with RPI on your membership anniversary date. 30 days notice always given.</p>
              <button
                onClick={() => setActiveTab("join")}
                style={{ marginTop: "16px", padding: "8px 20px", backgroundColor: "#193c47", color: "#f3f2ee", border: "none", borderRadius: "4px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}
              >
                Start your membership →
              </button>
            </div>
          )}

          {/* ── JOIN TAB ── */}
          {activeTab === "join" && (
            <div style={{ maxWidth: "600px" }}>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>Join the Cellar Club</p>
              <h2 className="text-lg mb-1" style={{ color: "#193c47", fontWeight: 400 }}>Start your membership</h2>
              <p className="text-xs leading-relaxed mb-4" style={{ color: "#777777" }}>
                Fill in your details and select your tier. You'll be taken to a secure payment page to set up your monthly membership.
              </p>

              {submitted ? (
                <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "4px", padding: "24px" }}>
                  <p className="text-sm mb-1" style={{ color: "#2e282a" }}>Thank you, {form.name.split(" ")[0]}.</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#777777" }}>
                    Your application has been received. Someone from the Bodega team will be in touch shortly to confirm your membership and arrange payment.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>Full name *</label>
                      <input style={inputStyle} value={form.name} onChange={(e) => f("name", e.target.value)} required placeholder="Jane Smith" />
                    </div>
                    <div>
                      <label style={labelStyle}>Email address *</label>
                      <input type="email" style={inputStyle} value={form.email} onChange={(e) => f("email", e.target.value)} required placeholder="jane@example.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>Mobile number</label>
                      <input type="tel" style={inputStyle} value={form.phone} onChange={(e) => f("phone", e.target.value)} placeholder="+44..." />
                    </div>
                    <div>
                      <label style={labelStyle}>Date of birth</label>
                      <input type="date" style={inputStyle} value={form.dob} onChange={(e) => f("dob", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Membership tier *</label>
                    <select
                      style={{ ...inputStyle, appearance: "none", WebkitAppearance: "none" }}
                      value={form.tier}
                      onChange={(e) => f("tier", e.target.value)}
                      required
                    >
                      <option value="">Select a tier...</option>
                      <optgroup label="Individual">
                        {TIERS.filter(t => t.type === "Individual").map(t => (
                          <option key={t.name} value={t.name}>{t.name} — {t.price}/month</option>
                        ))}
                      </optgroup>
                      <optgroup label="Corporate">
                        {TIERS.filter(t => t.type === "Corporate").map(t => (
                          <option key={t.name} value={t.name}>{t.name} — {t.price}/month</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>Early bird code</label>
                      <input style={inputStyle} value={form.early_bird_code} onChange={(e) => f("early_bird_code", e.target.value)} placeholder="e.g. WEIRMILL-12345" />
                    </div>
                    <div>
                      <label style={labelStyle}>How did you hear about us?</label>
                      <input style={inputStyle} value={form.how_heard} onChange={(e) => f("how_heard", e.target.value)} placeholder="Word of mouth, social..." />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Anything else</label>
                    <textarea
                      style={{ ...inputStyle, minHeight: "60px", resize: "none" }}
                      value={form.message}
                      onChange={(e) => f("message", e.target.value)}
                      placeholder="Questions, requirements, corporate details..."
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="marketing"
                      checked={form.marketing}
                      onChange={(e) => f("marketing", e.target.checked)}
                      style={{ marginTop: "2px", accentColor: "#193c47" }}
                    />
                    <label htmlFor="marketing" className="text-xs leading-relaxed" style={{ color: "#777777", cursor: "pointer" }}>
                      I'm happy to receive updates about events, tastings and Cellar Club news from Bodega.
                    </label>
                  </div>
                  {error && <p style={{ fontSize: "12px", color: "#c0392b" }}>{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting || !form.name || !form.email || !form.tier}
                    style={{
                      padding: "8px 20px",
                      backgroundColor: "#193c47",
                      color: "#f3f2ee",
                      border: "none",
                      borderRadius: "4px",
                      fontFamily: "'Courier New', Courier, monospace",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      cursor: submitting || !form.name || !form.email || !form.tier ? "not-allowed" : "pointer",
                      opacity: submitting || !form.name || !form.email || !form.tier ? 0.6 : 1,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "background-color 0.15s",
                    }}
                  >
                    {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Start membership →
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}