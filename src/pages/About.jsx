export default function About() {
  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: "calc(100vh - 56px)" }}>

        {/* Text — centred vertically and horizontally, left-aligned within, like homepage booking form */}
        <div className="flex flex-col justify-center items-center" style={{ borderRight: "1px solid #d8d6d0" }}>
          <div style={{ width: "100%", maxWidth: "400px", padding: "0 36px" }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#777777" }}>Our story</p>
            <h1 className="text-2xl mb-4 leading-snug" style={{ color: "#193c47", fontWeight: 400 }}>
              Born from a love of good wine
            </h1>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "#777777" }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#777777" }}>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
        </div>

        {/* Image — full height, flush to nav and right edge */}
        <div style={{ position: "relative", minHeight: "50vh" }}>
          <img
            src="/images/about.jpg"
            alt="Inside Bodega wine bar"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

      </div>
    </div>
  );
}