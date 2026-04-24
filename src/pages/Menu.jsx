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
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace" }}>
      <div className="px-6 py-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#777777" }}>
            What we pour & serve
          </p>
          <h1 className="text-xl mb-1" style={{ color: "#193c47", fontWeight: 400 }}>
            Menu
          </h1>
          <p className="text-xs" style={{ color: "#777777" }}>
            Our wine list changes seasonally. Prices shown are per glass / per bottle where applicable.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xs uppercase tracking-widest mb-5" style={{ color: "#777777" }}>
              Wine list
            </h2>

            <div className="space-y-6">
              {sections.map((section) => {
                const sectionItems = items
                  .filter((i) => i.section_id === section.id)
                  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

                return (
                  <div key={section.id}>
                    <h3
                      className="text-xs uppercase tracking-widest mb-2"
                      style={{
                        color: "#193c47",
                        borderBottom: "1px solid #d8d6d0",
                        paddingBottom: "5px",
                      }}
                    >
                      {section.name}
                    </h3>

                    <div className="space-y-2">
                      {sectionItems.map((wine) => {
                        const price = [wine.glass_price, wine.bottle_price]
                          .filter(Boolean)
                          .join(" / ");

                        return (
                          <div key={wine.id} className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs" style={{ color: "#2e282a" }}>
                                {wine.name}
                              </p>
                              {wine.region && (
                                <p className="text-xs" style={{ color: "#aaa" }}>
                                  {wine.region}
                                </p>
                              )}
                            </div>
                            <span className="text-xs shrink-0" style={{ color: "#2e282a" }}>
                              {price}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-widest mb-5" style={{ color: "#777777" }}>
              Charcuterie & cheese
            </h2>

            <p className="text-xs leading-relaxed mb-4" style={{ color: "#777777" }}>
              Carefully sourced ingredients that complement what's in your glass.
            </p>

            {foodItems.length > 0 && (
              <div style={{ border: "1px solid #d8d6d0", borderRadius: "4px", overflow: "hidden" }}>
                {foodItems.map((board, i) => (
                  <div
                    key={board.id}
                    style={{
                      backgroundColor: "#eceae4",
                      padding: "12px 16px",
                      borderTop: i > 0 ? "1px solid #d8d6d0" : "none",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-0.5">
                      <h3 className="text-xs" style={{ color: "#2e282a", fontWeight: 400 }}>
                        {board.name}
                      </h3>
                      <span className="text-xs shrink-0" style={{ color: "#193c47" }}>
                        {board.price}
                      </span>
                    </div>

                    {board.serves && (
                      <p className="text-xs" style={{ color: "#aaa" }}>
                        {board.serves}
                      </p>
                    )}

                    {board.description && (
                      <p className="text-xs leading-relaxed mt-0.5" style={{ color: "#777777" }}>
                        {board.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}