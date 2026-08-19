import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import SEO from "../components/SEO";

const MENU_TYPES = [
  { key: "drinks", fileName: "drinks-menu.pdf", label: "Drinks Menu" },
  { key: "food", fileName: "food-menu.pdf", label: "Food Menu" },
];

const schema = {
  "@context": "https://schema.org",
  "@type": "Menu",
  "name": "Bodega Wine Bar Menu",
  "description": "Wine list and food boards at Bodega, Weir Mill, Stockport.",
  "url": "https://bodegawine.co.uk/menu",
  "hasMenuSection": [
    {
      "@type": "MenuSection",
      "name": "Wine"
    },
    {
      "@type": "MenuSection",
      "name": "Charcuterie & Cheese Boards"
    }
  ],
  "inLanguage": "en-GB",
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
  }
}

export default function Menu() {
  const [menus, setMenus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.storage.from("menu").list("");
      const next = {};
      MENU_TYPES.forEach(({ key, fileName }) => {
        const file = data?.find(f => f.name === fileName);
        if (file) {
          const { data: urlData } = supabase.storage.from("menu").getPublicUrl(fileName);
          next[key] = urlData.publicUrl;
        } else {
          next[key] = null;
        }
      });
      setMenus(next);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ backgroundColor: "#f3f2ee", minHeight: "calc(100vh - 56px)" }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#1E4D5A" }} />
      </div>
    );
  }

  const MenuButton = ({ url, label }) => url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "inline-block", padding: "10px 22px", backgroundColor: "#1E4D5A", color: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none" }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0A242C"}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1E4D5A"}
    >
      {label} ↗
    </a>
  ) : (
    <span
      style={{ display: "inline-block", padding: "10px 22px", backgroundColor: "transparent", color: "#777777", border: "1px solid #d8d6d0", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}
    >
      {label} — coming soon
    </span>
  );

  return (
    <>
      <SEO
        title="Menu — Wine List & Boards | Bodega Stockport"
        description="Our wine list changes regularly. Paired with carefully sourced charcuterie and cheese boards. View our full menu at Bodega, Stockport."
        canonical="/menu"
        schema={schema}
      />
      <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace" }}>

        <div className="hidden lg:grid lg:grid-cols-2" style={{ minHeight: "calc(100vh - 56px)" }}>
          <div className="flex flex-col justify-center items-center" style={{ borderRight: "1px solid #d8d6d0" }}>
            <div style={{ width: "100%", maxWidth: "520px", padding: "48px 64px" }}>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#0A242C" }}>What we pour</p>
              <h1 className="text-2xl mb-4 leading-snug" style={{ color: "#1E4D5A", fontWeight: 400 }}>Good wine, no waffle.</h1>
              <p className="text-sm leading-relaxed mb-8" style={{ color: "#0A242C" }}>
                Our wine list changes regularly, paired with proper charcuterie and cheese boards.
              </p>
              <div className="flex gap-3 flex-wrap">
                <MenuButton url={menus.drinks} label="Drinks Menu" />
                <MenuButton url={menus.food} label="Food Menu" />
              </div>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <img
              src="/images/menu.webp"
              alt="Food boards at Bodega, Stockport"
              width="1600"
              height="2000"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        </div>

        <div className="lg:hidden flex flex-col">
          <div style={{ position: "relative", height: "50vw", minHeight: "200px", flexShrink: 0 }}>
            <img
              src="/images/menu.webp"
              alt="Food boards at Bodega, Stockport"
              width="1600"
              height="2000"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
          <div style={{ padding: "32px 24px" }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#0A242C" }}>What we pour</p>
            <h1 style={{ fontSize: "22px", color: "#1E4D5A", fontWeight: 400, marginBottom: "12px" }}>Good wine, no waffle.</h1>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "#0A242C" }}>
              Our wine list changes regularly, paired with proper charcuterie and cheese boards.
            </p>
            <div className="flex gap-3 flex-wrap">
              <MenuButton url={menus.drinks} label="Drinks Menu" />
              <MenuButton url={menus.food} label="Food Menu" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}