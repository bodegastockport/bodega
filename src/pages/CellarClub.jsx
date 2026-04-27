import { useState } from "react";
import { format, subYears } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const TIERS = [
  { name: "Cellar 6",     bottles: 6,  price: "£21.00", type: "Individual", priceId: "price_CELLAR6_PLACEHOLDER" },
  { name: "Cellar 12",    bottles: 12, price: "£33.50", type: "Individual", priceId: "price_CELLAR12_PLACEHOLDER" },
  { name: "Cellar 18",    bottles: 18, price: "£47.00", type: "Individual", priceId: "price_CELLAR18_PLACEHOLDER" },
  { name: "Corporate 6",  bottles: 6,  price: "£31.50", type: "Corporate",  priceId: "price_CORP6_PLACEHOLDER" },
  { name: "Corporate 12", bottles: 12, price: "£50.50", type: "Corporate",  priceId: "price_CORP12_PLACEHOLDER" },
  { name: "Corporate 18", bottles: 18, price: "£70.50", type: "Corporate",  priceId: "price_CORP18_PLACEHOLDER" },
  { name: "Corporate 24", bottles: 24, price: "£91.75", type: "Corporate",  priceId: "price_CORP24_PLACEHOLDER" },
];

const BLANK = {
  name: "", email: "", phone: "", dob: null, tier: "",
  how_heard: "", marketing: false, agreed_terms: false,
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

export default function CellarClub() {
  const [view, setView] = useState("about");
  const [joinOpen, setJoinOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [dobOpen, setDobOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.tier || !form.agreed_terms) return;
    setSubmitting(true);
    setError(null);

    const { error: memberErr } = await supabase
      .from('cellar_members')
      .insert({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        birthday: form.dob ? format(form.dob, "yyyy-MM-dd") : null,
        membership_tier: form.tier,
        how_did_you_hear: form.how_heard || null,
        marketing_opt_in: form.marketing,
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

  const JoinForm = ({ inputSt, labelSt }) => (
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
          <Popover open={dobOpen} onOpenChange={setDobOpen}>
            <PopoverTrigger asChild>
              <button type="button" style={{ ...inputSt, textAlign: "left", cursor: "pointer", display: "block" }}>
                <span style={{ opacity: form.dob ? 1 : 0.5 }}>
                  {form.dob ? format(form.dob, "dd/MM/yyyy") : "DD/MM/YYYY"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={form.dob}
                onSelect={(d) => { f("dob", d); setDobOpen(false); }}
                defaultMonth={subYears(new Date(), 30)}
                captionLayout="dropdown"
                fromYear={1920}
                toYear={new Date().getFullYear() - 18}
                disabled={(date) => date > subYears(new Date(), 18)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div>
        <label style={labelSt}>Membership tier *</label>
        <select style={{ ...inputSt, appearance: "none", WebkitAppearance: "none" }} value={form.tier} onChange={e => f("tier", e.target.value)} required>
          <option value="" style={{ color: "#0A242C", backgroundColor: "#fff" }}>Select a tier...</option>
          <optgroup label="Individual" style={{ color: "#0A242C", backgroundColor: "#fff" }}>
            {individualTiers.map(t => <option key={t.name} value={t.name} style={{ color: "#0A242C", backgroundColor: "#fff" }}>{t.name} — {t.price}/month</option>)}
          </optgroup>
          <optgroup label="Corporate" style={{ color: "#0A242C", backgroundColor: "#fff" }}>
            {corporateTiers.map(t => <option key={t.name} value={t.name} style={{ color: "#0A242C", backgroundColor: "#fff" }}>{t.name} — {t.price}/month</option>)}
          </optgroup>
        </select>
      </div>
      <div>
        <label style={labelSt}>How did you hear about us?</label>
        <input style={inputSt} value={form.how_heard} onChange={e => f("how_heard", e.target.value)} placeholder="Instagram, word of mouth..." />
      </div>
      <div className="flex items-start gap-2">
        <input type="checkbox" id="marketing" checked={form.marketing} onChange={e => f("marketing", e.target.checked)} style={{ marginTop: "2px", accentColor: "#1E4D5A" }} />
        <label htmlFor="marketing" style={{ ...labelSt, textTransform: "none", letterSpacing: 0, lineHeight: "1.5", cursor: "pointer" }}>
          I'm happy to receive updates about events and Cellar Club news.
        </label>
      </div>
      <div className="flex items-start gap-2">
        <input type="checkbox" id="terms" checked={form.agreed_terms} onChange={e => f("agreed_terms", e.target.checked)} style={{ marginTop: "2px", accentColor: "#1E4D5A" }} required />
        <label htmlFor="terms" style={{ ...labelSt, textTransform: "none", letterSpacing: 0, lineHeight: "1.5", cursor: "pointer" }}>
          I agree to the{" "}
          <a href="/cellar-club/terms" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(243,242,238,0.8)", textDecoration: "underline" }}>
            Cellar Club terms and conditions
          </a>.
        </label>
      </div>
      {error && <p style={{ fontSize: "11px", color: "#e88" }}>{error}</p>}
      <button
        type="submit"
        disabled={submitting || !form.name || !form.email || !form.tier || !form.agreed_terms}
        style={{
          padding: "8px 20px", backgroundColor: "#1E4D5A", color: "#f3f2ee",
          border: "none", fontFamily: "'Courier New', Courier, monospace",
          fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em",
          cursor: submitting || !form.name || !form.email || !form.tier || !form.agreed_terms ? "not-allowed" : "pointer",
          opacity: submitting || !form.name || !form.email || !form.tier || !form.agreed_terms ? 0.5 : 1,
          display: "inline-flex", alignItems: "center", gap: "6px", width: "100%", justifyContent: "center",
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

          {/* Left — centred vertically and horizontally */}
          <div className="flex flex-col justify-center items-center" style={{ borderRight: "1px solid #d8d6d0" }}>
            <div style={{ width: "100%", maxWidth: "520px", padding: "48px 36px" }}>

              <h1 className="text-2xl mb-4" style={{ color: "#1E4D5A", fontWeight: 400 }}>The Cellar Club</h1>

              <p className="text-xs leading-relaxed mb-2" style={{ color: "#777777" }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <p className="text-xs leading-relaxed mb-6" style={{ color: "#777777" }}>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>

              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#777777" }}>How it works</p>
              <p className="text-xs leading-relaxed mb-2" style={{ color: "#777777" }}>
                Beneath Bodega lies a temperature-controlled vault. As a member, you rent a dedicated space — keeping your wine at the perfect conditions for long-term ageing.
              </p>
              <p className="text-xs leading-relaxed mb-8" style={{ color: "#777777" }}>
                Whenever you visit, simply let us know which bottles you'd like and we'll bring them up. A modest corkage fee applies.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { title: "Climate-controlled storage", body: "Ideal temperature and humidity for long-term ageing." },
                  { title: "Drink your own here", body: "Bring stored bottles to any table. Modest corkage applies." },
                  { title: "Member perks", body: "Priority reservations, tastings and limited allocations." },
                ].map(({ title, body }) => (
                  <div key={title}>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#1E4D5A" }}>{title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "#777777" }}>{body}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid #d8d6d0" }}>
                <a href="/login" style={{ fontSize: "11px", color: "#777777", textDecoration: "none", borderBottom: "1px solid #d8d6d0", paddingBottom: "1px" }}>
                  Already a member? Log in →
                </a>
                <button
                  onClick={() => setView("pricing")}
                  style={{ padding: "8px 24px", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
                >
                  View pricing →
                </button>
              </div>
            </div>
          </div>

          {/* Right — image with join form overlaid */}
          <div style={{ position: "relative", minHeight: "50vh" }}>
            <img src="/images/cellar-club.jpg" alt="Wine vault" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(10,10,10,0.6)" }} />
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
          <div className="flex items-start justify-between mb-6">
            <div>
              <button onClick={() => setView("about")} style={{ fontSize: "11px", color: "#777777", textTransform: "uppercase", letterSpacing: "0.08em", background: "none", border: "none", cursor: "pointer", fontFamily: "'Courier New', Courier, monospace", padding: 0, marginBottom: "8px", display: "block" }}>
                ← Back
              </button>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>Membership</p>
              <h1 className="text-2xl" style={{ color: "#1E4D5A", fontWeight: 400 }}>Pricing</h1>
            </div>
            <button onClick={() => setJoinOpen(true)} style={{ padding: "10px 28px", backgroundColor: "#1E4D5A", color: "#f3f2ee", border: "none", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}>
              Join the Cellar Club →
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#1E4D5A" }}>Individual pricing</p>
              <div style={{ borderTop: "1px solid #d8d6d0" }}>
                {individualTiers.map((tier) => (
                  <div key={tier.name} className="flex items-center justify-between py-4" style={{ borderBottom: "1px solid #d8d6d0" }}>
                    <div>
                      <p className="text-sm" style={{ color: "#0A242C" }}>{tier.name}</p>
                      <p className="text-xs" style={{ color: "#aaa" }}>Up to {tier.bottles} bottles</p>
                    </div>
                    <p className="text-sm" style={{ color: "#1E4D5A" }}>{tier.price}<span style={{ color: "#aaa", fontSize: "11px" }}>/mo</span></p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#1E4D5A" }}>Corporate entity pricing</p>
              <div style={{ borderTop: "1px solid #d8d6d0" }}>
                {corporateTiers.map((tier) => (
                  <div key={tier.name} className="flex items-center justify-between py-4" style={{ borderBottom: "1px solid #d8d6d0" }}>
                    <div>
                      <p className="text-sm" style={{ color: "#0A242C" }}>{tier.name}</p>
                      <p className="text-xs" style={{ color: "#aaa" }}>Up to {tier.bottles} bottles</p>
                    </div>
                    <p className="text-sm" style={{ color: "#1E4D5A" }}>{tier.price}<span style={{ color: "#aaa", fontSize: "11px" }}>/mo</span></p>
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

      {/* ── JOIN MODAL ── */}
      {joinOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(10,10,10,0.6)" }} onClick={() => setJoinOpen(false)} />
          <div style={{ position: "relative", backgroundColor: "#1E4D5A", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", padding: "36px", margin: "0 16px" }}>
            <button onClick={() => setJoinOpen(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "rgba(243,242,238,0.5)", fontFamily: "'Courier New', Courier, monospace", fontSize: "18px", lineHeight: 1 }}>×</button>
            {submitted ? (
              <div>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(243,242,238,0.6)" }}>You're in</p>
                <h2 className="text-xl mb-2" style={{ color: "#f3f2ee", fontWeight: 400 }}>Thank you, {form.name.split(" ")[0]}.</h2>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(243,242,238,0.7)" }}>Your application has been received. The Bodega team will be in touch shortly.</p>
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