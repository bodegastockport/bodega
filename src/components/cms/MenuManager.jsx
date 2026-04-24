import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Pencil, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const inputStyle = {
  backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "6px",
  fontFamily: "'Courier New', Courier, monospace", fontSize: "13px",
  padding: "8px 11px", color: "#2e282a", width: "100%", outline: "none",
};
const labelStyle = {
  display: "block", fontSize: "10px", textTransform: "uppercase",
  letterSpacing: "0.08em", color: "#777777", marginBottom: "4px",
  fontFamily: "'Courier New', Courier, monospace",
};
const btnPrimary = {
  padding: "7px 14px", backgroundColor: "#193c47", color: "#f3f2ee",
  border: "none", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace",
  fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em",
  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px",
  transition: "background-color 0.15s",
};
const btnOutline = {
  padding: "7px 14px", backgroundColor: "transparent", color: "#193c47",
  border: "1px solid #193c47", borderRadius: "6px", fontFamily: "'Courier New', Courier, monospace",
  fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em",
  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px",
};

const BLANK_WINE = { name: "", region: "", glass_price: "", bottle_price: "", sort_order: 0 };
const BLANK_FOOD = { name: "", description: "", serves: "", price: "", sort_order: 0 };

export default function MenuManager() {
  const [sections, setSections] = useState([]);
  const [items, setItems] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Section form
  const [newSectionName, setNewSectionName] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [savingSection, setSavingSection] = useState(false);

  // Wine item form
  const [addingItemTo, setAddingItemTo] = useState(null); // section id
  const [editingItem, setEditingItem] = useState(null); // item object
  const [itemForm, setItemForm] = useState(BLANK_WINE);
  const [savingItem, setSavingItem] = useState(false);

  // Food item form
  const [addingFood, setAddingFood] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodForm, setFoodForm] = useState(BLANK_FOOD);
  const [savingFood, setSavingFood] = useState(false);

  const load = async () => {
    const [{ data: s }, { data: i }, { data: f }] = await Promise.all([
      supabase.from('wine_sections').select().order('sort_order'),
      supabase.from('wine_items').select().order('sort_order'),
      supabase.from('food_items').select().order('sort_order'),
    ]);
    setSections(s || []);
    setItems(i || []);
    setFoodItems(f || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── Wine sections ────────────────────────────────────────────────────────

  const addSection = async () => {
    if (!newSectionName.trim()) return;
    setSavingSection(true);
    const { error } = await supabase.from('wine_sections').insert({
      name: newSectionName.trim(),
      sort_order: sections.length,
    });
    if (!error) {
      await load();
      setNewSectionName("");
      setAddingSection(false);
      toast.success("Section added");
    }
    setSavingSection(false);
  };

  const deleteSection = async (id) => {
    // Delete all items in section first
    await supabase.from('wine_items').delete().eq('section_id', id);
    const { error } = await supabase.from('wine_sections').delete().eq('id', id);
    if (!error) {
      await load();
      toast.success("Section removed");
    }
  };

  // ── Wine items ───────────────────────────────────────────────────────────

  const openAddItem = (sectionId) => {
    setAddingItemTo(sectionId);
    setEditingItem(null);
    setItemForm({ ...BLANK_WINE, sort_order: items.filter(i => i.section_id === sectionId).length });
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setAddingItemTo(null);
    setItemForm({ name: item.name, region: item.region || "", glass_price: item.glass_price || "", bottle_price: item.bottle_price || "", sort_order: item.sort_order || 0 });
  };

  const saveItem = async () => {
    if (!itemForm.name) return;
    setSavingItem(true);
    if (editingItem) {
      await supabase.from('wine_items').update(itemForm).eq('id', editingItem.id);
      toast.success("Wine updated");
    } else {
      await supabase.from('wine_items').insert({ ...itemForm, section_id: addingItemTo });
      toast.success("Wine added");
    }
    await load();
    setAddingItemTo(null);
    setEditingItem(null);
    setSavingItem(false);
  };

  const deleteItem = async (id) => {
    await supabase.from('wine_items').delete().eq('id', id);
    setItems(p => p.filter(i => i.id !== id));
    toast.success("Removed");
  };

  // ── Food items ───────────────────────────────────────────────────────────

  const openAddFood = () => {
    setAddingFood(true);
    setEditingFood(null);
    setFoodForm({ ...BLANK_FOOD, sort_order: foodItems.length });
  };

  const openEditFood = (item) => {
    setEditingFood(item);
    setAddingFood(false);
    setFoodForm({ name: item.name, description: item.description || "", serves: item.serves || "", price: item.price || "", sort_order: item.sort_order || 0 });
  };

  const saveFood = async () => {
    if (!foodForm.name) return;
    setSavingFood(true);
    if (editingFood) {
      await supabase.from('food_items').update(foodForm).eq('id', editingFood.id);
      toast.success("Board updated");
    } else {
      await supabase.from('food_items').insert(foodForm);
      toast.success("Board added");
    }
    await load();
    setAddingFood(false);
    setEditingFood(null);
    setSavingFood(false);
  };

  const deleteFood = async (id) => {
    await supabase.from('food_items').delete().eq('id', id);
    setFoodItems(p => p.filter(f => f.id !== id));
    toast.success("Removed");
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#193c47" }} />
    </div>
  );

  return (
    <div className="space-y-10" style={{ fontFamily: "'Courier New', Courier, monospace" }}>

      {/* ── WINE LIST ── */}
      <div>
        <div className="flex items-center justify-between mb-5" style={{ borderBottom: "1px solid #d8d6d0", paddingBottom: "10px" }}>
          <p className="text-xs uppercase tracking-widest" style={{ color: "#777777" }}>Wine list</p>
          <button
            style={btnPrimary}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2d6272"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#193c47"}
            onClick={() => setAddingSection(true)}
          >
            <Plus className="h-3 w-3" /> Add section
          </button>
        </div>

        {/* New section form */}
        {addingSection && (
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "16px", marginBottom: "16px" }} className="flex gap-3 items-end">
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Section name</label>
              <input
                style={inputStyle}
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="e.g. Sparkling, White, Red..."
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") addSection(); if (e.key === "Escape") setAddingSection(false); }}
              />
            </div>
            <button style={btnPrimary} onClick={addSection} disabled={savingSection || !newSectionName.trim()}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2d6272"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#193c47"}
            >
              {savingSection && <Loader2 className="h-3 w-3 animate-spin" />} Save
            </button>
            <button style={btnOutline} onClick={() => { setAddingSection(false); setNewSectionName(""); }}>Cancel</button>
          </div>
        )}

        {sections.length === 0 && !addingSection && (
          <p className="text-sm text-center py-8" style={{ color: "#777777" }}>No wine sections yet. Add your first one.</p>
        )}

        {sections.map((section) => {
          const sectionItems = items.filter(i => i.section_id === section.id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          const isAddingHere = addingItemTo === section.id;

          return (
            <div key={section.id} style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", marginBottom: "12px", overflow: "hidden" }}>
              {/* Section header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #d8d6d0" }}>
                <p className="text-xs uppercase tracking-widest" style={{ color: "#193c47" }}>{section.name}</p>
                <div className="flex gap-2">
                  <button onClick={() => openAddItem(section.id)} style={{ ...btnOutline, padding: "4px 10px", fontSize: "10px" }}>
                    <Plus className="h-3 w-3" /> Add wine
                  </button>
                  <button onClick={() => deleteSection(section.id)} style={{ padding: "4px 8px", backgroundColor: "transparent", border: "1px solid #d8d6d0", borderRadius: "4px", cursor: "pointer", color: "#777777" }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Wine items */}
              {sectionItems.map((item) => (
                <div key={item.id}>
                  {editingItem?.id === item.id ? (
                    <div style={{ padding: "12px 16px", backgroundColor: "#f3f2ee", borderBottom: "1px solid #d8d6d0" }}>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="col-span-2">
                          <label style={labelStyle}>Wine name *</label>
                          <input style={inputStyle} value={itemForm.name} onChange={(e) => setItemForm(p => ({ ...p, name: e.target.value }))} autoFocus />
                        </div>
                        <div>
                          <label style={labelStyle}>Region</label>
                          <input style={inputStyle} value={itemForm.region} onChange={(e) => setItemForm(p => ({ ...p, region: e.target.value }))} placeholder="e.g. Burgundy, France" />
                        </div>
                        <div>
                          <label style={labelStyle}>Glass price</label>
                          <input style={inputStyle} value={itemForm.glass_price} onChange={(e) => setItemForm(p => ({ ...p, glass_price: e.target.value }))} placeholder="e.g. £8" />
                        </div>
                        <div>
                          <label style={labelStyle}>Bottle price</label>
                          <input style={inputStyle} value={itemForm.bottle_price} onChange={(e) => setItemForm(p => ({ ...p, bottle_price: e.target.value }))} placeholder="e.g. £38" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button style={btnPrimary} onClick={saveItem} disabled={savingItem || !itemForm.name}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2d6272"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#193c47"}
                        >
                          {savingItem && <Loader2 className="h-3 w-3 animate-spin" />} Save
                        </button>
                        <button style={btnOutline} onClick={() => setEditingItem(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-2.5 group" style={{ borderBottom: "1px solid #d8d6d0" }}>
                      <div>
                        <p className="text-xs" style={{ color: "#2e282a" }}>{item.name}</p>
                        {item.region && <p className="text-xs" style={{ color: "#aaa" }}>{item.region}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs" style={{ color: "#777777" }}>
                          {[item.glass_price, item.bottle_price].filter(Boolean).join(" / ")}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditItem(item)} style={{ padding: "3px 6px", backgroundColor: "transparent", border: "1px solid #d8d6d0", borderRadius: "3px", cursor: "pointer", color: "#777777" }}>
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button onClick={() => deleteItem(item.id)} style={{ padding: "3px 6px", backgroundColor: "transparent", border: "1px solid #d8d6d0", borderRadius: "3px", cursor: "pointer", color: "#777777" }}>
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add wine form */}
              {isAddingHere && (
                <div style={{ padding: "12px 16px", backgroundColor: "#f3f2ee", borderTop: sectionItems.length > 0 ? "1px solid #d8d6d0" : "none" }}>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="col-span-2">
                      <label style={labelStyle}>Wine name *</label>
                      <input style={inputStyle} value={itemForm.name} onChange={(e) => setItemForm(p => ({ ...p, name: e.target.value }))} autoFocus placeholder="e.g. Sancerre Blanc" />
                    </div>
                    <div>
                      <label style={labelStyle}>Region</label>
                      <input style={inputStyle} value={itemForm.region} onChange={(e) => setItemForm(p => ({ ...p, region: e.target.value }))} placeholder="e.g. Loire Valley, France" />
                    </div>
                    <div>
                      <label style={labelStyle}>Glass price</label>
                      <input style={inputStyle} value={itemForm.glass_price} onChange={(e) => setItemForm(p => ({ ...p, glass_price: e.target.value }))} placeholder="e.g. £11" />
                    </div>
                    <div>
                      <label style={labelStyle}>Bottle price</label>
                      <input style={inputStyle} value={itemForm.bottle_price} onChange={(e) => setItemForm(p => ({ ...p, bottle_price: e.target.value }))} placeholder="e.g. £52" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button style={btnPrimary} onClick={saveItem} disabled={savingItem || !itemForm.name}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2d6272"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "#193c47"}
                    >
                      {savingItem && <Loader2 className="h-3 w-3 animate-spin" />} Save
                    </button>
                    <button style={btnOutline} onClick={() => setAddingItemTo(null)}>Cancel</button>
                  </div>
                </div>
              )}

              {sectionItems.length === 0 && !isAddingHere && (
                <p className="text-xs px-4 py-3" style={{ color: "#777777" }}>No wines in this section yet.</p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── FOOD / BOARDS ── */}
      <div>
        <div className="flex items-center justify-between mb-5" style={{ borderBottom: "1px solid #d8d6d0", paddingBottom: "10px" }}>
          <p className="text-xs uppercase tracking-widest" style={{ color: "#777777" }}>Charcuterie & cheese boards</p>
          <button
            style={btnPrimary}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2d6272"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#193c47"}
            onClick={openAddFood}
          >
            <Plus className="h-3 w-3" /> Add board
          </button>
        </div>

        {/* Add food form */}
        {addingFood && (
          <div style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "16px", marginBottom: "12px" }}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="col-span-2">
                <label style={labelStyle}>Board name *</label>
                <input style={inputStyle} value={foodForm.name} onChange={(e) => setFoodForm(p => ({ ...p, name: e.target.value }))} autoFocus placeholder="e.g. Classic charcuterie" />
              </div>
              <div>
                <label style={labelStyle}>Price</label>
                <input style={inputStyle} value={foodForm.price} onChange={(e) => setFoodForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. £16" />
              </div>
              <div>
                <label style={labelStyle}>Serves</label>
                <input style={inputStyle} value={foodForm.serves} onChange={(e) => setFoodForm(p => ({ ...p, serves: e.target.value }))} placeholder="e.g. Serves 2" />
              </div>
              <div className="col-span-2">
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: "64px", resize: "none" }} value={foodForm.description} onChange={(e) => setFoodForm(p => ({ ...p, description: e.target.value }))} placeholder="What's included..." />
              </div>
            </div>
            <div className="flex gap-2">
              <button style={btnPrimary} onClick={saveFood} disabled={savingFood || !foodForm.name}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2d6272"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#193c47"}
              >
                {savingFood && <Loader2 className="h-3 w-3 animate-spin" />} Save
              </button>
              <button style={btnOutline} onClick={() => setAddingFood(false)}>Cancel</button>
            </div>
          </div>
        )}

        {foodItems.length === 0 && !addingFood && (
          <p className="text-sm text-center py-8" style={{ color: "#777777" }}>No boards yet.</p>
        )}

        <div className="space-y-2">
          {foodItems.map((item) => (
            <div key={item.id} style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", overflow: "hidden" }}>
              {editingFood?.id === item.id ? (
                <div style={{ padding: "16px" }}>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="col-span-2">
                      <label style={labelStyle}>Board name *</label>
                      <input style={inputStyle} value={foodForm.name} onChange={(e) => setFoodForm(p => ({ ...p, name: e.target.value }))} autoFocus />
                    </div>
                    <div>
                      <label style={labelStyle}>Price</label>
                      <input style={inputStyle} value={foodForm.price} onChange={(e) => setFoodForm(p => ({ ...p, price: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Serves</label>
                      <input style={inputStyle} value={foodForm.serves} onChange={(e) => setFoodForm(p => ({ ...p, serves: e.target.value }))} />
                    </div>
                    <div className="col-span-2">
                      <label style={labelStyle}>Description</label>
                      <textarea style={{ ...inputStyle, minHeight: "64px", resize: "none" }} value={foodForm.description} onChange={(e) => setFoodForm(p => ({ ...p, description: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button style={btnPrimary} onClick={saveFood} disabled={savingFood || !foodForm.name}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2d6272"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "#193c47"}
                    >
                      {savingFood && <Loader2 className="h-3 w-3 animate-spin" />} Save
                    </button>
                    <button style={btnOutline} onClick={() => setEditingFood(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between p-4 group">
                  <div>
                    <div className="flex items-center gap-3 mb-0.5">
                      <p className="text-xs" style={{ color: "#2e282a" }}>{item.name}</p>
                      {item.price && <span className="text-xs" style={{ color: "#193c47" }}>{item.price}</span>}
                    </div>
                    {item.serves && <p className="text-xs" style={{ color: "#aaa" }}>{item.serves}</p>}
                    {item.description && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#777777" }}>{item.description}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4">
                    <button onClick={() => openEditFood(item)} style={{ padding: "4px 8px", backgroundColor: "transparent", border: "1px solid #d8d6d0", borderRadius: "4px", cursor: "pointer", color: "#777777" }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteFood(item.id)} style={{ padding: "4px 8px", backgroundColor: "transparent", border: "1px solid #d8d6d0", borderRadius: "4px", cursor: "pointer", color: "#777777" }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}