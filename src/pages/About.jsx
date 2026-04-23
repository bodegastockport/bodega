export default function About() {
  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace" }}>
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#777777" }}>Our story</p>
            <h1 className="text-2xl mb-4 leading-snug" style={{ color: "#193c47", fontWeight: 400 }}>
              Born from a love of good wine
            </h1>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "#777777" }}>
              Bodega is an intimate wine bar in the heart of Stockport, Manchester — a place where great bottles meet great company. We believe that wine should be approachable, interesting and above all, enjoyable.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#777777" }}>
              Our selection spans the classic regions of France, Spain and Italy through to the exciting new producers of South America, Georgia and beyond. Whether you're a seasoned collector or just starting your journey, you'll find something that moves you.
            </p>
          </div>
          <div className="overflow-hidden" style={{ borderRadius: "6px", aspectRatio: "4/3" }}>
            <img
              src="https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=800&q=85"
              alt="Inside Bodega wine bar"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}