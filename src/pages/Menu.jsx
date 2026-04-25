import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function Menu() {
  const [sections, setSections] = useState([]);
  const [items, setItems] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: s }, { data: i }, { data: f }] = await Promise.all([
        supabase.from("wine_sections").select("*").order("sort_order"),
        supabase.from("wine_items").select("*").order("sort_order"),
        supabase.from("food_items").select("*").order("sort_order"),
      ]);
      setSections(s || []);
      setItems(i || []);
      setFoodItems(f || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16" style={{ backgroundColor: "#f3f2ee" }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#193c47" }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: "calc(100vh - 56px)" }}>

        {/* Left — wine list, cream */}
        <div className="px-8 py-8 flex flex-col" style={{ backgroundColor: "#f3f2ee", borderRight: "1px solid #d8d6d0" }}>
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>What we pour</p>
            <h1 className="text-2xl mb-1" style={{ color: "#193c47", fontWeight: 400 }}>Wine list</h1>
            <p className="text-xs" style={{ color: "#777777" }}>
              Our wine list changes seasonally. Prices shown are per glass / per bottle where applicable.
            </p>
          </div>

          <div className="space-y-8">
            {sections.map((section) => {
              const sectionItems = items
                .filter(i => i.section_id === section.id)
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

              return (
                <div key={section.id}>
                  <h3 className="text-xs uppercase tracking-widest mb-3" style={{ color: "#193c47", borderBottom: "1px solid #d8d6d0", paddingBottom: "6px" }}>
                    {section.name}
                  </h3>
                  <div className="space-y-3">
                    {sectionItems.map((wine) => {
                      const price = [wine.glass_price, wine.bottle_price].filter(Boolean).join(" / ");
                      return (
                        <div key={wine.id} className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs" style={{ color: "#2e282a" }}>{wine.name}</p>
                            {wine.region && <p className="text-xs" style={{ color: "#aaa" }}>{wine.region}</p>}
                          </div>
                          <span className="text-xs shrink-0" style={{ color: "#2e282a" }}>{price}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — charcuterie, teal inset panel */}
        <div className="flex flex-col px-0 py-0" style={{ backgroundColor: "#f3f2ee" }}>
          <div style={{ margin: "48px", backgroundColor: "#193c47", padding: "40px", height: "calc(100% - 96px)" }}>
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(243,242,238,0.5)" }}>What we serve</p>
            <h2 className="text-2xl mb-1" style={{ color: "#f3f2ee", fontWeight: 400 }}>Charcuterie & cheese</h2>
            <p className="text-xs" style={{ color: "rgba(243,242,238,0.6)" }}>
              Carefully sourced ingredients that complement what's in your glass.
            </p>
          </div>

          <div className="space-y-6">
            {foodItems.map((board) => (
              <div key={board.id} style={{ borderBottom: "1px solid rgba(243,242,238,0.15)", paddingBottom: "20px" }}>
                <div className="flex items-start justify-between gap-4 mb-1">
                  <p className="text-sm" style={{ color: "#f3f2ee", fontWeight: 400 }}>{board.name}</p>
                  <span className="text-sm shrink-0" style={{ color: "rgba(243,242,238,0.7)" }}>{board.price}</span>
                </div>
                {board.serves && (
                  <p className="text-xs mb-1" style={{ color: "rgba(243,242,238,0.4)" }}>{board.serves}</p>
                )}
                {board.description && (
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(243,242,238,0.6)" }}>{board.description}</p>
                )}
              </div>
            ))}
          </div>
          </div>
        </div>

      </div>
    </div>
  );
}