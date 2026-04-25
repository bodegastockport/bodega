import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const TIERS = [
  { name: "Cellar 6",     bottles: 6,  price: "£21.00", type: "Individual", priceId: "price_CELLAR6_PLACEHOLDER" },
  { name: "Cellar 12",    bottles: 12, price: "£33.50", type: "Individual", priceId: "price_CELLAR12_PLACEHOLDER" },
  { name: "Cellar 18",    bottles: 18, price: "£47.00", type: "Individual", priceId: "price_CELLAR18_PLACEHOLDER" },
  { name: "Corporate 6",  bottles: 6,  price: "£31.50", type: "Corporate",  priceId: "price_CORP6_PLACEHOLDER" },
  { name: "Corporate 12", bottles: 12, price: "£50.50", type: "Corporate",  priceId: "price_CORP12_PLACEHOLDER" },
  { name: "Corporate 18", bottles: 18, price: "£70.50", type: "Corporate",  priceId: "price_CORP18_PLACEHOLDER" },
  { name: "Corporate 24", bottles: 24, price: "£91.75", type: "Corporate",  priceId: "price_CORP24_PLACEHOLDER" },
];

const EARLY_BIRD_PRICE = "£15.00";

const BLANK = {
  name: "", email: "", phone: "", dob: "", tier: "",
  early_bird_code: "", how_heard: "", message: "", marketing: false,
};

const overlayInput = {
  backgroundColor: "rgba(243,242,238,0.12)",
  border: "1px solid rgba(243,242,238,0.25)",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "12px",
  padding: "7px 10px",
  color: "#f3f2ee",
  width: "100%",
  outline: "none",
};

const overlayLabel = {
  display: "block",
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "rgba(243,242,238,0.55)",
  marginBottom: "3px",
  fontFamily: "'Courier New', Courier, monospace",
};

const lightInput = {
  backgroundColor: "#f3f2ee",
  border: "1px solid #d8d6d0",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "12px",
  padding: "7px 10px",
  color: "#2e282a",
  width: "100%",
  outline: "none",
};

const lightLabel = {
  display: "block",
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#777777",
  marginBottom: "3px",
  fontFamily: "'Courier New', Courier, monospace",
};

export default function CellarClub() {
  const [view, setView] = useState("about");
  const [joinOpen, setJoinOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.tier) return;
    setSubmitting(true);
    setError(null);

    const selectedTier = TIERS.find(t => t.name === form.tier);
    const isEarlyBird = form.early_bird_code?.trim().length > 0 && selectedTier?.name === "Cellar 6";

    const { error: memberErr } = await supabase
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
      });

    if (memberErr) {
      setSubmitting(false);
      setError("Something went wrong. Please try again.");
      return;
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  const individualTiers = TIERS.filter(t => t.type === "Individual");
  const corporateTiers = TIERS.filter(t => t.type === "Corporate");

  const JoinForm = ({ inputSt, labelSt, onSuccess }) => (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label style={labelSt}>Full name *</label>
          <input style={inputSt} value={form.name} onChange={e => f("name", e.target.value)} required placeholder="Jane Smith" />
        </div>
        <div>
          <label style={labelSt}>Email *</label>
          <input type="email" style={inputSt} value={form.email} onChange={e => f("email", e.target.value)} required placeholder="jane@example.com" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label style={labelSt}>Mobile</label>
          <input type="tel" style={inputSt} value={form.phone} onChange={e => f("phone", e.target.value)} placeholder="+44..." />
        </div>
        <div>
          <label style={labelSt}>Date of birth</label>
          <input type="date" style={inputSt} value={form.dob} onChange={e => f("dob", e.target.value)} />
        </div>
      </div>
      <div>
        <label style={labelSt}>Membership tier *</label>
        <select style={{ ...inputSt, appearance: "none", WebkitAppearance: "none" }} value={form.tier} onChange={e => f("tier", e.target.value)} required>
          <option value="">Select a tier...</option>
          <optgroup label="Individual">
            {individualTiers.map(t => <option key={t.name} value={t.name}>{t.name} — {t.price}/month</option>)}
          </optgroup>
          <optgroup label="Corporate">
            {corporateTiers.map(t => <option key={t.name} value={t.name}>{t.name} — {t.price}/month</option>)}
          </optgroup>
        </select>
      </div>
      <div>
        <label style={labelSt}>Early bird code</label>
        <input style={inputSt} value={form.early_bird_code} onChange={e => f("early_bird_code", e.target.value)} placeholder="e.g. WEIRMILL-12345" />
      </div>
      <div className="flex items-start gap-2">
        <input type="checkbox" id="marketing" checked={form.marketing} onChange={e => f("marketing", e.target.checked)} style={{ marginTop: "2px", accentColor: "#193c47" }} />
        <label htmlFor="marketing" style={{ ...labelSt, textTransform: "none", letterSpacing: 0, lineHeight: "1.5", cursor: "pointer" }}>
          I'm happy to receive updates about events and Cellar Club news.
        </label>
      </div>
      {error && <p style={{ fontSize: "11px", color: "#e88" }}>{error}</p>}
      <button
        type="submit"
        disabled={submitting || !form.name || !form.email || !form.tier}
        style={{
          padding: "8px 20px",
          backgroundColor: "#193c47",
          color: "#f3f2ee",
          border: "none",
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          cursor: submitting || !form.name || !form.email || !form.tier ? "not-allowed" : "pointer",
          opacity: submitting || !form.name || !form.email || !form.tier ? 0.5 : 1,
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          width: "100%",
          justifyContent: "center",
        }}
      >
        {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Start membership →
      </button>
    </form>
  );

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace" }}>

      {/* ── ABOUT VIEW ── */}
      {view === "about" && (
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: "calc(100vh - 56px)" }}>

          {/* Left — info, balanced throughout */}
          <div className="flex flex-col justify-between px-8 py-8" style={{ borderRight: "1px solid #d8d6d0" }}>

            {/* Header */}
            <div>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>Members only</p>
              <h1 className="text-2xl mb-4" style={{ color: "#193c47", fontWeight: 400 }}>The Cellar Club</h1>
              <p className="text-xs leading-relaxed mb-2" style={{ color: "#777777" }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p className="text-xs leading-relaxed mb-6" style={{ color: "#777777" }}>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
              </p>
            </div>

            {/* How it works */}
            <div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#777777" }}>How it works</p>
              <p className="text-xs leading-relaxed mb-2" style={{ color: "#777777" }}>
                Beneath Bodega lies a temperature-controlled vault. As a member, you rent a dedicated space — keeping your wine at the perfect conditions for long-term ageing.
              </p>
              <p className="text-xs leading-relaxed mb-6" style={{ color: "#777777" }}>
                Whenever you visit, simply let us know which bottles you'd like and we'll bring them up. A modest corkage fee applies. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.
              </p>
            </div>

            {/* Feature points — teal headings, no boxes */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              {[
                { title: "Climate-controlled storage", body: "Ideal temperature and humidity for long-term ageing." },
                { title: "Drink your own here", body: "Bring stored bottles to any table. Modest corkage applies." },
                { title: "Member perks", body: "Priority reservations, tastings and limited allocations." },
              ].map(({ title, body }) => (
                <div key={title}>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#193c47" }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#777777" }}>{body}</p>
                </div>
              ))}
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid #d8d6d0" }}>
              <a href="/my-cellar" style={{ fontSize: "11px", color: "#777777", textDecoration: "none", borderBottom: "1px solid #d8d6d0", paddingBottom: "1px" }}>
                Already a member? Log in →
              </a>
              <button
                onClick={() => setView("pricing")}
                style={{ padding: "8px 24px", backgroundColor: "#193c47", color: "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
              >
                View pricing →
              </button>
            </div>
          </div>

          {/* Right — image with join form overlaid */}
          <div style={{ position: "relative", minHeight: "50vh" }}>
            <img
              src="/images/cellar-club.jpg"
              alt="Wine vault"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Dark overlay */}
            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(10,10,10,0.6)" }} />

            {/* Join form — centred over image */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
              <div style={{ width: "100%", maxWidth: "340px" }}>
                {submitted ? (
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(243,242,238,0.6)" }}>You're in</p>
                    <h2 className="text-xl mb-2" style={{ color: "#f3f2ee", fontWeight: 400 }}>Thank you, {form.name.split(" ")[0]}.</h2>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(243,242,238,0.7)" }}>
                      Your application has been received. The Bodega team will be in touch shortly to confirm your membership.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(243,242,238,0.6)" }}>Join the Cellar Club</p>
                    <h2 className="text-lg mb-4" style={{ color: "#f3f2ee", fontWeight: 400 }}>Start your membership</h2>
                    <JoinForm inputSt={overlayInput} labelSt={overlayLabel} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PRICING VIEW ── */}
      {view === "pricing" && (
        <div className="px-8 py-8" style={{ minHeight: "calc(100vh - 56px)" }}>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <button
                onClick={() => setView("about")}
                style={{ fontSize: "11px", color: "#777777", textTransform: "uppercase", letterSpacing: "0.08em", background: "none", border: "none", cursor: "pointer", fontFamily: "'Courier New', Courier, monospace", padding: 0, marginBottom: "8px", display: "block" }}
              >
                ← Back
              </button>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>Membership</p>
              <h1 className="text-2xl" style={{ color: "#193c47", fontWeight: 400 }}>Pricing</h1>
            </div>
            <button
              onClick={() => setJoinOpen(true)}
              style={{ padding: "10px 28px", backgroundColor: "#193c47", color: "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
            >
              Join the Cellar Club →
            </button>
          </div>

          {/* Early bird banner */}
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "12px 16px", marginBottom: "24px" }}>
            <p className="text-xs" style={{ color: "#777777" }}>
              <span style={{ color: "#193c47" }}>Early bird — June 2026:</span> Cellar 6 at <span style={{ color: "#193c47" }}>{EARLY_BIRD_PRICE}/month</span>. Weir Mill residents receive the same rate within 30 days of tenancy start. Use your early bird code at sign-up.
            </p>
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Individual */}
            <div>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#193c47" }}>Individual</p>
              <div style={{ borderTop: "1px solid #d8d6d0" }}>
                {individualTiers.map((tier) => (
                  <div key={tier.name} className="flex items-center justify-between py-4" style={{ borderBottom: "1px solid #d8d6d0" }}>
                    <div>
                      <p className="text-sm" style={{ color: "#2e282a" }}>{tier.name}</p>
                      <p className="text-xs" style={{ color: "#aaa" }}>Up to {tier.bottles} bottles</p>
                    </div>
                    <p className="text-sm" style={{ color: "#193c47" }}>{tier.price}<span style={{ color: "#aaa", fontSize: "11px" }}>/mo</span></p>
                  </div>
                ))}
              </div>
            </div>

            {/* Corporate */}
            <div>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#193c47" }}>Corporate</p>
              <div style={{ borderTop: "1px solid #d8d6d0" }}>
                {corporateTiers.map((tier) => (
                  <div key={tier.name} className="flex items-center justify-between py-4" style={{ borderBottom: "1px solid #d8d6d0" }}>
                    <div>
                      <p className="text-sm" style={{ color: "#2e282a" }}>{tier.name}</p>
                      <p className="text-xs" style={{ color: "#aaa" }}>Up to {tier.bottles} bottles</p>
                    </div>
                    <p className="text-sm" style={{ color: "#193c47" }}>{tier.price}<span style={{ color: "#aaa", fontSize: "11px" }}>/mo</span></p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs mt-6" style={{ color: "#aaa" }}>
            Prices increase annually in line with RPI on your membership anniversary date. 30 days notice always given.
          </p>
        </div>
      )}

      {/* ── JOIN MODAL (pricing page) ── */}
      {joinOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(10,10,10,0.6)" }} onClick={() => setJoinOpen(false)} />
          <div style={{ position: "relative", backgroundColor: "#193c47", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", padding: "36px", margin: "0 16px" }}>
            <button
              onClick={() => setJoinOpen(false)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "rgba(243,242,238,0.5)", fontFamily: "'Courier New', Courier, monospace", fontSize: "18px", lineHeight: 1 }}
            >
              ×
            </button>
            {submitted ? (
              <div>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(243,242,238,0.6)" }}>You're in</p>
                <h2 className="text-xl mb-2" style={{ color: "#f3f2ee", fontWeight: 400 }}>Thank you, {form.name.split(" ")[0]}.</h2>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(243,242,238,0.7)" }}>
                  Your application has been received. The Bodega team will be in touch shortly.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(243,242,238,0.6)" }}>Join the Cellar Club</p>
                <h2 className="text-xl mb-4" style={{ color: "#f3f2ee", fontWeight: 400 }}>Start your membership</h2>
                <JoinForm inputSt={overlayInput} labelSt={overlayLabel} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}