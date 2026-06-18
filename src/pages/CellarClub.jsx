import { useState, useEffect } from "react";
import { format, subYears } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SEO from "../components/SEO";

const CAPACITY = 50;

const TIERS = [
  { name: "Cellar 6",     bottles: 6,  price: "£21.00", type: "Individual" },
  { name: "Cellar 12",    bottles: 12, price: "£33.50", type: "Individual" },
  { name: "Cellar 18",    bottles: 18, price: "£47.00", type: "Individual" },
  { name: "Corporate 6",  bottles: 6,  price: "£31.50", type: "Corporate" },
  { name: "Corporate 12", bottles: 12, price: "£50.50", type: "Corporate" },
  { name: "Corporate 18", bottles: 18, price: "£70.50", type: "Corporate" },
  { name: "Corporate 24", bottles: 24, price: "£91.75", type: "Corporate" },
];

const BLANK = {
  name: "", email: "", phone: "", dob: null, tier: "",
  address_line1: "", postcode: "", how_heard: "", marketing: false, agreed_terms: false,
};

const WAITLIST_BLANK = { name: "", email: "", mobile: "", requested_tier: "" };

const overlayInput = {
  backgroundColor: "rgba(243,242,238,0.18)",
  border: "1px solid rgba(243,242,238,0.45)",
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
  color: "#f3f2ee",
  marginBottom: "3px",
  fontFamily: "'Courier New', Courier, monospace",
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Cellar Club — Private Wine Storage Membership",
  "serviceType": "Private Wine Storage",
  "description": "A private wine storage membership at Bodega in Stockport. Store your bottles in a temperature and humidity-controlled vault and drink them at the bar whenever you like.",
  "url": "https://bodegawine.co.uk/cellar-club",
  "areaServed": {
    "@type": "Place",
    "name": "Stockport, Greater Manchester"
  },
  "provider": {
    "@type": "LocalBusiness",
    "name": "Bodega Wine Vault",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Engine Room, Weir Mill",
      "addressLocality": "Stockport",
      "postalCode": "SK3 0AG",
      "addressCountry": "GB"
    }
  },
  "offers": [
    {
      "@type": "Offer",
      "name": "Cellar 6",
      "description": "Store up to 6 bottles",
      "price": "21.00",
      "priceCurrency": "GBP",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "21.00",
        "priceCurrency": "GBP",
        "unitCode": "MON"
      }
    },
    {
      "@type": "Offer",
      "name": "Cellar 12",
      "description": "Store up to 12 bottles",
      "price": "33.50",
      "priceCurrency": "GBP",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "33.50",
        "priceCurrency": "GBP",
        "unitCode": "MON"
      }
    },
    {
      "@type": "Offer",
      "name": "Cellar 18",
      "description": "Store up to 18 bottles",
      "price": "47.00",
      "priceCurrency": "GBP",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "47.00",
        "priceCurrency": "GBP",
        "unitCode": "MON"
      }
    }
  ]
}

const WaitlistForm = ({ inputSt, labelSt }) => {
  const [form, setForm] = useState(WAITLIST_BLANK);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setSubmitting(true);
    setError(null);

    const { error: err } = await supabase
      .from("cellar_waitlist")
      .insert({
        name: form.name,
        email: form.email,
        mobile: form.mobile || null,
        requested_tier: form.requested_tier || null,
      });

    if (err) {
      setSubmitting(false);
      setError("Something went wrong. Please try again.");
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#f3f2ee" }}>You're on the list</p>
        <h2 className="text-xl mb-2" style={{ color: "#f3f2ee", fontWeight: 400 }}>We'll be in touch, {form.name.split(" ")[0]}.</h2>
        <p className="text-xs leading-relaxed" style={{ color: "#f3f2ee", letterSpacing: "-0.02em" }}>
          As soon as a space becomes available, you'll be the first to know.
        </p>
      </div>
    );
  }

  return (
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
          <input type="tel" style={inputSt} value={form.mobile} onChange={e => f("mobile", e.target.value)} placeholder="+44..." />
        </div>
        <div>
          <label style={labelSt}>Preferred tier</label>
          <select style={{ ...inputSt, appearance: "none", WebkitAppearance: "none" }} value={form.requested_tier} onChange={e => f("requested_tier", e.target.value)}>
            <option value="" style={{ color: "#0A242C", backgroundColor: "#fff" }}>Select...</option>
            <optgroup label="Individual" style={{ color: "#0A242C", backgroundColor: "#fff" }}>
              <option value="Cellar 6" style={{ color: "#0A242C", backgroundColor: "#fff" }}>Cellar 6 — £21.00/mo</option>
              <option value="Cellar 12" style={{ color: "#0A242C", backgroundColor: "#fff" }}>Cellar 12 — £33.50/mo</option>
              <option value="Cellar 18" style={{ color: "#0A242C", backgroundColor: "#fff" }}>Cellar 18 — £47.00/mo</option>
            </optgroup>
            <optgroup label="Corporate" style={{ color: "#0A242C", backgroundColor: "#fff" }}>
              <option value="Corporate 6" style={{ color: "#0A242C", backgroundColor: "#fff" }}>Corporate 6 — £31.50/mo</option>
              <option value="Corporate 12" style={{ color: "#0A242C", backgroundColor: "#fff" }}>Corporate 12 — £50.50/mo</option>
              <option value="Corporate 18" style={{ color: "#0A242C", backgroundColor: "#fff" }}>Corporate 18 — £70.50/mo</option>
              <option value="Corporate 24" style={{ color: "#0A242C", backgroundColor: "#fff" }}>Corporate 24 — £91.75/mo</option>
            </optgroup>
          </select>
        </div>
      </div>
      {error && <p style={{ fontSize: "11px", color: "#e88" }}>{error}</p>}
      <button
        type="submit"
        disabled={submitting || !form.name || !form.email}
        style={{
          padding: "8px 20px", backgroundColor: "#0A242C", color: "#f3f2ee",
          border: "none", fontFamily: "'Courier New', Courier, monospace",
          fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em",
          cursor: submitting || !form.name || !form.email ? "not-allowed" : "pointer",
          opacity: submitting || !form.name || !form.email ? 0.5 : 1,
          display: "inline-flex", alignItems: "center", gap: "6px", width: "100%", justifyContent: "center",
        }}
      >
        {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Join the waitlist →
      </button>
    </form>
  );
};

const isOver18 = (dob) => {
  if (!dob) return false;
  return dob <= subYears(new Date(), 18);
};

const JoinForm = ({
  inputSt,
  labelSt,
  form,
  f,
  handleSubmit,
  individualTiers,
  corporateTiers,
  error,
  submitting,
}) => {
  const [dobOpen, setDobOpen] = useState(false);
  const formValid = form.name && form.email && form.phone && form.dob && isOver18(form.dob) && form.tier && form.address_line1 && form.postcode && form.agreed_terms;

  const isCorporateTier = corporateTiers.some((t) => t.name === form.tier);
  const termsHref = isCorporateTier ? "/cellar-club/terms?type=corporate" : "/cellar-club/terms";

  return (
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
          <label style={labelSt}>Mobile *</label>
          <input type="tel" style={inputSt} value={form.phone} onChange={e => f("phone", e.target.value)} required placeholder="+44..." />
        </div>
        <div>
          <label style={labelSt}>Date of birth *</label>
          <Popover open={dobOpen} onOpenChange={setDobOpen}>
            <PopoverTrigger asChild>
              <button type="button" style={{ ...inputSt, textAlign: "left", cursor: "pointer", display: "block" }}>
                <span style={{ opacity: form.dob ? 1 : 0.6 }}>
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
          {form.dob && !isOver18(form.dob) && (
            <p style={{ fontSize: "10px", color: "#e88", marginTop: "3px" }}>You must be 18 or over to join.</p>
          )}
        </div>
      </div>
      <div>
        <label style={labelSt}>Address *</label>
        <input style={inputSt} value={form.address_line1} onChange={e => f("address_line1", e.target.value)} required placeholder="123 Example Street, Manchester" />
      </div>
      <div>
        <label style={labelSt}>Postcode *</label>
        <input style={{ ...inputSt, textTransform: "uppercase" }} value={form.postcode} onChange={e => f("postcode", e.target.value.toUpperCase())} required placeholder="M1 1AA" />
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
        <input type="checkbox" id="marketing" checked={form.marketing} onChange={e => f("marketing", e.target.checked)} style={{ marginTop: "2px", accentColor: "#f3f2ee" }} />
        <label htmlFor="marketing" style={{ ...overlayLabel, textTransform: "none", letterSpacing: 0, lineHeight: "1.5", cursor: "pointer" }}>
          I'm happy to receive updates about events and Cellar Club news.
        </label>
      </div>
      <div className="flex items-start gap-2">
        <input type="checkbox" id="terms" checked={form.agreed_terms} onChange={e => f("agreed_terms", e.target.checked)} style={{ marginTop: "2px", accentColor: "#f3f2ee" }} required />
        <label htmlFor="terms" style={{ ...overlayLabel, textTransform: "none", letterSpacing: 0, lineHeight: "1.5", cursor: "pointer" }}>
          I agree to the{" "}
          <a href={termsHref} target="_blank" rel="noopener noreferrer" style={{ color: "#f3f2ee", textDecoration: "underline" }}>
            Cellar Club terms and conditions
          </a>.
        </label>
      </div>
      {error && <p style={{ fontSize: "11px", color: "#e88" }}>{error}</p>}
      <button
        type="submit"
        disabled={submitting || !formValid}
        style={{
          padding: "8px 20px", backgroundColor: "#0A242C", color: "#f3f2ee",
          border: "none", fontFamily: "'Courier New', Courier, monospace",
          fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em",
          cursor: submitting || !formValid ? "not-allowed" : "pointer",
          opacity: submitting || !formValid ? 0.5 : 1,
          display: "inline-flex", alignItems: "center", gap: "6px", width: "100%", justifyContent: "center",
        }}
      >
        {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Continue to payment →
      </button>
    </form>
  );
};

const btnBase = {
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  border: "none",
  cursor: "pointer",
  padding: "9px 24px",
  display: "inline-block",
  textDecoration: "none",
};

export default function CellarClub() {
  const [view, setView] = useState("about");
  const [joinOpen, setJoinOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isFull, setIsFull] = useState(false);
  const [capacityLoading, setCapacityLoading] = useState(true);

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const checkCapacity = async () => {
      const { count } = await supabase
        .from("cellar_members")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      setIsFull((count || 0) >= CAPACITY);
      setCapacityLoading(false);
    };
    checkCapacity();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.dob || !isOver18(form.dob) || !form.tier || !form.address_line1 || !form.postcode || !form.agreed_terms) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        "https://yzrjtjcqviudjbddvepq.supabase.co/functions/v1/create-stripe-checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            dob: form.dob ? format(form.dob, "yyyy-MM-dd") : "",
            tier: form.tier,
            address_line1: form.address_line1,
            postcode: form.postcode,
            how_heard: form.how_heard || "",
            marketing: form.marketing,
            agreed_terms: form.agreed_terms,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.url) {
        setError("Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const individualTiers = TIERS.filter(t => t.type === "Individual");
  const corporateTiers = TIERS.filter(t => t.type === "Corporate");

  const joinFormProps = {
    inputSt: overlayInput,
    labelSt: overlayLabel,
    form,
    f,
    handleSubmit,
    individualTiers,
    corporateTiers,
    error,
    submitting,
  };

  const rightPanelContent = () => {
    if (capacityLoading) return null;

    if (isFull) {
      return (
        <>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#f3f2ee" }}>Cellar Club</p>
          <h2 className="text-lg mb-2" style={{ color: "#f3f2ee", fontWeight: 400 }}>We're currently full.</h2>
          <p className="text-xs leading-relaxed mb-4" style={{ color: "#f3f2ee", letterSpacing: "-0.02em" }}>
            All 50 spaces are taken. Join the waitlist and we'll contact you as soon as one becomes available.
          </p>
          <WaitlistForm inputSt={overlayInput} labelSt={overlayLabel} />
        </>
      );
    }

    return (
      <>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#f3f2ee" }}>Join the Cellar Club</p>
        <h2 className="text-lg mb-4" style={{ color: "#f3f2ee", fontWeight: 400 }}>Start your membership</h2>
        <JoinForm {...joinFormProps} />
      </>
    );
  };

  return (
    <>
      <SEO
        title="Cellar Club — Private Wine Storage, Stockport | Bodega"
        description="Store your wine in Bodega's temperature-controlled vault in Stockport. Simple membership, your own space, drink your bottles here whenever you like."
        canonical="/cellar-club"
        schema={schema}
      />
      <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace" }}>

        {view === "about" && (
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: "calc(100vh - 56px)" }}>
            <div className="flex flex-col justify-center items-center" style={{ borderRight: "1px solid #d8d6d0" }}>
              <div style={{ width: "100%", maxWidth: "520px", padding: "48px 36px" }}>

                <h1 className="text-2xl mb-4" style={{ color: "#1E4D5A", fontWeight: 400 }}>A wine storage concept like no other.</h1>

                <p className="text-xs leading-relaxed mb-4" style={{ color: "#0A242C", letterSpacing: "-0.02em" }}>
                  Wine storage, done properly. A wine cellar club right here in Stockport. A simple membership that lets you keep your bottles with us in perfect conditions, ready when you are.
                </p>
                <p className="text-xs leading-relaxed mb-4" style={{ color: "#0A242C", letterSpacing: "-0.02em" }}>
                  There's a temperature and humidity-controlled wine vault right here in Bodega. Members get their own space to store bottles as they should be — not too warm, not too cold, just right for ageing.
                </p>
                <p className="text-xs leading-relaxed mb-6" style={{ color: "#0A242C", letterSpacing: "-0.02em" }}>
                  The best part? You can drink your own wine here whenever you like. Just pay a small corkage and we'll take care of the rest.
                </p>

                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#0A242C" }}>How it works</p>
                <p className="text-xs leading-relaxed mb-8" style={{ color: "#0A242C", letterSpacing: "-0.02em" }}>
                  Fill out the form, pick your tier and then start storing. Wine needs to be dropped off at least a day before you plan to drink it here. Drop-offs are by appointment, between 2–6pm Tuesday to Thursday and between 2–4pm Friday to Sunday.
                </p>

                <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid #d8d6d0" }}>
                  <a
                    href="/login"
                    style={{
                      ...btnBase,
                      backgroundColor: "transparent",
                      color: "#0A242C",
                      border: "1px solid #0A242C",
                    }}
                  >
                    Member login →
                  </a>
                  <button
                    onClick={() => setView("pricing")}
                    style={{
                      ...btnBase,
                      backgroundColor: "#1E4D5A",
                      color: "#f3f2ee",
                    }}
                  >
                    View pricing →
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:hidden" style={{ backgroundColor: "#1E4D5A", padding: "36px 24px" }}>
              <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
                {rightPanelContent()}
              </div>
            </div>

            <div className="hidden lg:block" style={{ position: "relative", minHeight: "50vh" }}>
              <img
                src="/images/cellar-club.webp"
                alt="Wine vault at Bodega, Stockport"
                width="1600"
                height="2000"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(10,10,10,0.6)" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
                <div style={{ width: "100%", maxWidth: "340px" }}>
                  {rightPanelContent()}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "pricing" && (
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: "calc(100vh - 56px)" }}>

            <div className="flex flex-col justify-center items-center" style={{ borderRight: "1px solid #d8d6d0" }}>
              <div style={{ width: "100%", maxWidth: "420px", padding: "48px 36px" }}>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#0A242C", opacity: 0.5 }}>Individual pricing</p>
                <h2 className="text-2xl mb-8" style={{ color: "#1E4D5A", fontWeight: 400 }}>For personal collections.</h2>
                <div style={{ borderTop: "1px solid #d8d6d0" }}>
                  {individualTiers.map((tier) => (
                    <div key={tier.name} className="flex items-center justify-between py-5" style={{ borderBottom: "1px solid #d8d6d0" }}>
                      <div>
                        <p style={{ fontSize: "13px", color: "#0A242C", marginBottom: "3px" }}>{tier.name}</p>
                        <p style={{ fontSize: "11px", color: "#0A242C", opacity: 0.45, letterSpacing: "-0.01em" }}>Up to {tier.bottles} bottles</p>
                      </div>
                      <p style={{ fontSize: "13px", color: "#1E4D5A" }}>{tier.price}<span style={{ fontSize: "11px", color: "#0A242C", opacity: 0.45 }}>/mo</span></p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "10px", color: "#0A242C", opacity: 0.45, marginTop: "20px", letterSpacing: "-0.01em", lineHeight: "1.6" }}>
                  Prices increase annually in line with RPI on your membership anniversary date. 30 days notice always given.
                </p>
                <div className="flex items-center gap-3 mt-8">
                  <button
                    onClick={() => setView("about")}
                    style={{
                      ...btnBase,
                      backgroundColor: "transparent",
                      color: "#0A242C",
                      border: "1px solid #0A242C",
                    }}
                  >
                    ← Back
                  </button>
                  {!isFull && (
                    <button
                      onClick={() => setJoinOpen(true)}
                      style={{
                        ...btnBase,
                        backgroundColor: "#1E4D5A",
                        color: "#f3f2ee",
                      }}
                    >
                      Join the Cellar Club →
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center" style={{ backgroundColor: "#1E4D5A" }}>
              <div style={{ width: "100%", maxWidth: "420px", padding: "48px 36px" }}>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(243,242,238,0.5)" }}>Corporate entity pricing</p>
                <h2 className="text-2xl mb-8" style={{ color: "#f3f2ee", fontWeight: 400 }}>For businesses and teams.</h2>
                <div style={{ borderTop: "1px solid rgba(243,242,238,0.18)" }}>
                  {corporateTiers.map((tier) => (
                    <div key={tier.name} className="flex items-center justify-between py-5" style={{ borderBottom: "1px solid rgba(243,242,238,0.18)" }}>
                      <div>
                        <p style={{ fontSize: "13px", color: "#f3f2ee", marginBottom: "3px" }}>{tier.name}</p>
                        <p style={{ fontSize: "11px", color: "rgba(243,242,238,0.5)", letterSpacing: "-0.01em" }}>Up to {tier.bottles} bottles</p>
                      </div>
                      <p style={{ fontSize: "13px", color: "#f3f2ee" }}>{tier.price}<span style={{ fontSize: "11px", color: "rgba(243,242,238,0.5)" }}>/mo</span></p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "10px", color: "rgba(243,242,238,0.45)", marginTop: "20px", letterSpacing: "-0.01em", lineHeight: "1.6" }}>
                  Corporate memberships include additional authorised users. Contact us to discuss bespoke arrangements.
                </p>
              </div>
            </div>

          </div>
        )}

        {joinOpen && !isFull && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(10,10,10,0.6)" }} onClick={() => setJoinOpen(false)} />
            <div style={{ position: "relative", backgroundColor: "#1E4D5A", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", padding: "36px", margin: "0 16px" }}>
              <button onClick={() => setJoinOpen(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "rgba(243,242,238,0.5)", fontFamily: "'Courier New', Courier, monospace", fontSize: "18px", lineHeight: 1 }}>×</button>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#f3f2ee" }}>Join the Cellar Club</p>
              <h2 className="text-xl mb-4" style={{ color: "#f3f2ee", fontWeight: 400 }}>Start your membership</h2>
              <JoinForm {...joinFormProps} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}