import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const inputStyle = {
  backgroundColor: "#f3f2ee",
  border: "1px solid #d8d6d0",
  borderRadius: "6px",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "13px",
  padding: "8px 11px",
  color: "#2e282a",
  width: "100%",
  outline: "none",
};

const labelStyle = {
  display: "block",
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#777777",
  marginBottom: "4px",
  fontFamily: "'Courier New', Courier, monospace",
};

const btnPrimary = {
  padding: "7px 14px",
  backgroundColor: "#193c47",
  color: "#f3f2ee",
  border: "none",
  borderRadius: "6px",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  cursor: "pointer",
};

const btnOutline = {
  padding: "7px 14px",
  backgroundColor: "transparent",
  color: "#193c47",
  border: "1px solid #193c47",
  borderRadius: "6px",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  cursor: "pointer",
};

export default function MenuManager() {
  const [sections, setSections] = useState([]);
  const [items, setItems] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    load();
  }, []);

  const addSection = async (name) => {
    if (!name.trim()) return;
    await supabase.from("wine_sections").insert({
      name,
      sort_order: sections.length,
    });
    await load();
    toast.success("Section added");
  };

  const deleteSection = async (id) => {
    await supabase.from("wine_items").delete().eq("section_id", id);
    await supabase.from("wine_sections").delete().eq("id", id);
    await load();
    toast.success("Section removed");
  };

  const addItem = async (section_id, item) => {
    await supabase.from("wine_items").insert({ ...item, section_id });
    await load();
    toast.success("Wine added");
  };

  const updateItem = async (id, item) => {
    await supabase.from("wine_items").update(item).eq("id", id);
    await load();
    toast.success("Wine updated");
  };

  const deleteItem = async (id) => {
    await supabase.from("wine_items").delete().eq("id", id);
    await load();
    toast.success("Removed");
  };

  const addFood = async (item) => {
    await supabase.from("food_items").insert(item);
    await load();
    toast.success("Board added");
  };

  const updateFood = async (id, item) => {
    await supabase.from("food_items").update(item).eq("id", id);
    await load();
    toast.success("Board updated");
  };

  const deleteFood = async (id) => {
    await supabase.from("food_items").delete().eq("id", id);
    await load();
    toast.success("Removed");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#193c47" }} />
      </div>
    );
  }

  return (
    <div className="space-y-10" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      <div>
        <div className="flex items-center justify-between mb-5" style={{ borderBottom: "1px solid #d8d6d0", paddingBottom: "10px" }}>
          <p className="text-xs uppercase tracking-widest" style={{ color: "#777777" }}>
            Wine list
          </p>
          <button style={btnPrimary} onClick={() => addSection("New section")}>
            <Plus className="h-3 w-3" /> Add section
          </button>
        </div>

        {sections.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: "#777777" }}>
            No wine sections yet. Add your first one.
          </p>
        )}

        {sections.map((section) => {
          const sectionItems = items
            .filter((i) => i.section_id === section.id)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

          return (
            <div key={section.id} style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", marginBottom: "12px" }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #d8d6d0" }}>
                <p className="text-xs uppercase tracking-widest" style={{ color: "#193c47" }}>
                  {section.name}
                </p>
                <div className="flex gap-2">
                  <button style={btnOutline} onClick={() => addItem(section.id, { name: "New wine" })}>
                    <Plus className="h-3 w-3" /> Add wine
                  </button>
                  <button onClick={() => deleteSection(section.id)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {sectionItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid #d8d6d0" }}>
                  <div>
                    <p className="text-xs" style={{ color: "#2e282a" }}>
                      {item.name}
                    </p>
                    {item.region && (
                      <p className="text-xs" style={{ color: "#aaa" }}>
                        {item.region}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateItem(item.id, item)}>
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button onClick={() => deleteItem(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}