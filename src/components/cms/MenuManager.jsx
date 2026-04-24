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

const BLANK_WINE = { name: "", region: "", glass_price: "", bottle_price: "", sort_order: 0 };
const BLANK_FOOD = { name: "", description: "", serves: "", price: "", sort_order: 0 };

export default function MenuManager() {
  const [sections, setSections] = useState([]);
  const [items, setItems] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addingSection, setAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  const [addingItemTo, setAddingItemTo] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState(BLANK_WINE);

  const [addingFood, setAddingFood] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodForm, setFoodForm] = useState(BLANK_FOOD);

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

  const addSection = async () => {
    if (!newSectionName.trim()) return;

    const { error } = await supabase.from("wine_sections").insert({
      name: newSectionName,
      sort_order: sections.length,
    });

    if (error) return toast.error(error.message);

    setNewSectionName("");
    setAddingSection(false);
    await load();
  };

  const deleteSection = async (id) => {
    await supabase.from("wine_items").delete().eq("section_id", id);
    await supabase.from("wine_sections").delete().eq("id", id);
    await load();
  };

  const openAddItem = (sectionId) => {
    setAddingItemTo(sectionId);
    setEditingItem(null);
    setItemForm(BLANK_WINE);
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setAddingItemTo(null);
    setItemForm(item);
  };

  const saveItem = async () => {
    if (!itemForm.name) return;

    if (editingItem) {
      const { error } = await supabase
        .from("wine_items")
        .update(itemForm)
        .eq("id", editingItem.id);

      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase
        .from("wine_items")
        .insert({ ...itemForm, section_id: addingItemTo });

      if (error) return toast.error(error.message);
    }

    setAddingItemTo(null);
    setEditingItem(null);
    await load();
  };

  const deleteItem = async (id) => {
    await supabase.from("wine_items").delete().eq("id", id);
    await load();
  };

  const openAddFood = () => {
    setAddingFood(true);
    setEditingFood(null);
    setFoodForm(BLANK_FOOD);
  };

  const openEditFood = (item) => {
    setEditingFood(item);
    setAddingFood(false);
    setFoodForm(item);
  };

  const saveFood = async () => {
    if (!foodForm.name) return;

    if (editingFood) {
      const { error } = await supabase
        .from("food_items")
        .update(foodForm)
        .eq("id", editingFood.id);

      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("food_items").insert(foodForm);

      if (error) return toast.error(error.message);
    }

    setAddingFood(false);
    setEditingFood(null);
    await load();
  };

  const deleteFood = async (id) => {
    await supabase.from("food_items").delete().eq("id", id);
    await load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <button onClick={() => setAddingSection(true)}>Add section</button>

        {addingSection && (
          <div>
            <input value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} />
            <button onClick={addSection}>Save</button>
          </div>
        )}

        {sections.map((section) => {
          const sectionItems = items.filter(
            (i) => String(i.section_id) === String(section.id)
          );

          return (
            <div key={section.id}>
              <p>{section.name}</p>

              <button onClick={() => openAddItem(section.id)}>Add wine</button>

              {sectionItems.map((item) => (
                <div key={item.id}>
                  <span>{item.name}</span>
                  <button onClick={() => openEditItem(item)}>Edit</button>
                  <button onClick={() => deleteItem(item.id)}>Delete</button>
                </div>
              ))}

              {addingItemTo === section.id && (
                <div>
                  <input
                    value={itemForm.name}
                    onChange={(e) =>
                      setItemForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                  <button onClick={saveItem}>Save</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}