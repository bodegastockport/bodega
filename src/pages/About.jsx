export default function About() {
  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: "calc(100vh - 56px)" }}>

        <div className="flex flex-col justify-center items-center" style={{ borderRight: "1px solid #d8d6d0" }}>
          <div style={{ width: "100%", maxWidth: "520px", padding: "48px 64px" }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#0A242C" }}>Our story</p>
            <h1 className="text-2xl mb-4 leading-snug" style={{ color: "#1E4D5A", fontWeight: 400 }}>
              We just really like good wine.
            </h1>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "#0A242C" }}>
              Bodega is a neighbourhood wine bar built for drinking, not overthinking.
            </p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "#0A242C" }}>
              Wine can get a bit much — too many rules, too much jargon, not enough fun. We're here to change that. Good bottles, no pressure, no fuss.
            </p>
            <p className="text-xs uppercase tracking-widest mb-2 mt-6" style={{ color: "#0A242C" }}>Why 'Bodega'?</p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "#0A242C" }}>
              In Spain, a bodega might be a cellar, a winery, or a small bar. In parts of Latin America, it's your local shop.
            </p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "#0A242C" }}>
              We liked that. Because Bodega isn't just one thing. It's somewhere you come for a glass, pick up a bottle on the way home, or keep a few stored for later.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#0A242C" }}>
              We love great wine — but we don't believe you need to "know wine" to enjoy it. So, whether you're here for a glass, a bottle, or just a cold lager and a plate of something salty, you're in the right place.
            </p>
          </div>
        </div>

        <div style={{ position: "relative", minHeight: "50vh" }}>
          <img
            src="/images/about.webp"
            alt="Inside Bodega wine bar"
            width="1600"
            height="2000"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>

      </div>
    </div>
  );
}