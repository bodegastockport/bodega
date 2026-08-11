import { useState, useEffect } from "react";
import { format, subYears } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const CAPACITY = 50;

const BLANK = {
  name: "", email: "", phone: "", dob: null,
  address_line1: "", postcode: "", how_heard: "", marketing: false, agreed_terms: false,
};

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

const isOver18 = (dob) => {
  if (!dob) return false;
  return dob <= subYears(new Date(), 18);
};

const JoinForm = ({ form, f, handleSubmit, error, submitting }) => {
  const [dobOpen, setDobOpen] = useState(false);
  const formValid = form.name && form.email && form.phone && form.dob && isOver18(form.dob) && form.address_line1 && form.postcode && form.agreed_terms;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label style={overlayLabel}>Full name *</label>
          <input style={overlayInput} value={form.name} onChange={e => f("name", e.target.value)} required placeholder="Jane Smith" />
        </div>
        <div>
          <label style={overlayLabel}>Email *</label>
          <input type="email" style={overlayInput} value={form.email} onChange={e => f("email", e.target.value)} required placeholder="jane@example.com" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label style={overlayLabel}>Mobile *</label>
          <input type="tel" style={overlayInput} value={form.phone} onChange={e => f("phone", e.target.value)} required placeholder="+44..." />
        </div>
        <div>
          <label style={overlayLabel}>Date of birth *</label>
          <Popover open={dobOpen} onOpenChange={setDobOpen}>
            <PopoverTrigger asChild>
              <button type="button" style={{ ...overlayInput, textAlign: "left", cursor: "pointer", display: "block" }}>
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
        <label style={overlayLabel}>Address *</label>
        <input style={overlayInput} value={form.address_line1} onChange={e => f("address_line1", e.target.value)} required placeholder="Weir Mill, Stockport" />
      </div>
      <div>
        <label style={overlayLabel}>Postcode *</label>
        <input style={{ ...overlayInput, textTransform: "uppercase" }} value={form.postcode} onChange={e => f("postcode", e.target.value.toUpperCase())} required placeholder="SK3 0AG" />
      </div>
      <div>
        <label style={overlayLabel}>How did you hear about us?</label>
        <input style={overlayInput} value={form.how_heard} onChange={e => f("how_heard", e.target.value)} placeholder="Weir Mill resident noticeboard..." />
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
          <a href="/cellar-club/terms" target="_blank" rel="noopener noreferrer" style={{ color: "#f3f2ee", textDecoration: "underline" }}>
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

export default function WeirMillOffer() {
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
    if (!form.name || !form.email || !form.phone || !form.dob || !isOver18(form.dob) || !form.address_line1 || !form.postcode || !form.agreed_terms) return;
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
            tier: "Cellar 6",
            interval: "month",
            source: "weir_mill_welcome",
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

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: "calc(100vh - 56px)" }}>
        <div className="flex flex-col justify-center items-center" style={{ borderRight: "1px solid #d8d6d0" }}>
          <div style={{ width: "100%", maxWidth: "520px", padding: "48px 36px" }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#0A242C", opacity: 0.5 }}>Exclusively for Weir Mill residents</p>
            <h1 className="text-2xl mb-4" style={{ color: "#1E4D5A", fontWeight: 400 }}>Your welcome offer.</h1>
            <p className="text-xs leading-relaxed mb-4" style={{ color: "#0A242C", letterSpacing: "-0.02em" }}>
              As a Weir Mill resident, you get a Cellar 6 membership at Bodega for £15 a month. Your own space in our temperature and humidity-controlled wine vault, right here at Weir Mill.
            </p>
            <p className="text-xs leading-relaxed mb-6" style={{ color: "#0A242C", letterSpacing: "-0.02em" }}>
              Store up to 6 bottles, and drink your own wine here whenever you like for a small corkage fee.
            </p>
          </div>
        </div>

        <div className="lg:hidden" style={{ backgroundColor: "#1E4D5A", padding: "36px 24px" }}>
          <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
            {capacityLoading ? null : isFull ? (
              <>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#f3f2ee" }}>Cellar Club</p>
                <h2 className="text-lg mb-2" style={{ color: "#f3f2ee", fontWeight: 400 }}>We're currently full.</h2>
                <p className="text-xs leading-relaxed" style={{ color: "#f3f2ee", letterSpacing: "-0.02em" }}>
                  All 50 spaces are taken. Email us at hello@bodegawine.co.uk and we'll let you know as soon as a space opens up.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#f3f2ee" }}>Cellar 6 — Weir Mill Offer</p>
                <h2 className="text-lg mb-4" style={{ color: "#f3f2ee", fontWeight: 400 }}>£15/mo — start your membership</h2>
                <JoinForm form={form} f={f} handleSubmit={handleSubmit} error={error} submitting={submitting} />
              </>
            )}
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
              {capacityLoading ? null : isFull ? (
                <>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#f3f2ee" }}>Cellar Club</p>
                  <h2 className="text-lg mb-2" style={{ color: "#f3f2ee", fontWeight: 400 }}>We're currently full.</h2>
                  <p className="text-xs leading-relaxed" style={{ color: "#f3f2ee", letterSpacing: "-0.02em" }}>
                    All 50 spaces are taken. Email us at hello@bodegawine.co.uk and we'll let you know as soon as a space opens up.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#f3f2ee" }}>Cellar 6 — Weir Mill Offer</p>
                  <h2 className="text-lg mb-4" style={{ color: "#f3f2ee", fontWeight: 400 }}>£15/mo — start your membership</h2>
                  <JoinForm form={form} f={f} handleSubmit={handleSubmit} error={error} submitting={submitting} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}