import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const ROWS = "ABCDEFGHIJKLMNOPQRSTUVWX".split("");
const SECTION_COLS = { L: 20, B: 8, R: 20 };
const SECTION_LABELS = { L: "Left Wall", B: "Back Wall", R: "Right Wall" };

function slotLabel(section, rowLabel, colNum) {
  return `${section}-${rowLabel}${String(colNum).padStart(2, "0")}`;
}

function SlotPopover({ slot, onClose }) {
  const popRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={popRef}
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 100,
        backgroundColor: "#f3f2ee",
        border: "1px solid #d8d6d0",
        padding: "20px",
        width: "260px",
        fontFamily: "'Courier New', Courier, monospace",
        boxShadow: "0 4px 24px rgba(10,36,44,0.15)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p style={{ fontSize: "13px", color: "#1E4D5A", fontWeight: 500 }}>{slotLabel(slot.section, slot.row_label, slot.column_number)}</p>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#777777", fontSize: "16px", lineHeight: 1 }}>×</button>
      </div>

      {slot.status === "available" && (
        <p style={{ fontSize: "11px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Available</p>
      )}

      {slot.status === "pending_release" && (
        <>
          <p style={{ fontSize: "11px", color: "#c0792b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Pending release</p>
          {slot.member && <p style={{ fontSize: "12px", color: "#777777" }}>{slot.member.name} · {slot.member.membership_tier}</p>}
        </>
      )}

      {slot.status === "assigned" && slot.member && (
        <div>
          <p style={{ fontSize: "11px", color: "#777777", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Member</p>
          <p style={{ fontSize: "12px", color: "#0A242C", marginBottom: "2px" }}>{slot.member.name}</p>
          <p style={{ fontSize: "11px", color: "#777777", marginBottom: "12px" }}>{slot.member.membership_tier}</p>

          {slot.bottle ? (
            <>
              <p style={{ fontSize: "11px", color: "#777777", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Bottle</p>
              {slot.bottle.image_front_url && (
                <img
                  src={slot.bottle.image_front_url}
                  alt={slot.bottle.wine_name}
                  style={{ width: "100%", height: "120px", objectFit: "cover", marginBottom: "8px", border: "1px solid #d8d6d0" }}
                />
              )}
              <p style={{ fontSize: "12px", color: "#0A242C", marginBottom: "2px" }}>{slot.bottle.wine_name}</p>
              <p style={{ fontSize: "11px", color: "#777777" }}>
                {[slot.bottle.vintage, slot.bottle.type].filter(Boolean).join(" · ")}
              </p>
              {slot.bottle.notes && <p style={{ fontSize: "11px", color: "#aaa", marginTop: "4px", fontStyle: "italic" }}>{slot.bottle.notes}</p>}
            </>
          ) : (
            <p style={{ fontSize: "11px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em" }}>No bottle stored</p>
          )}
        </div>
      )}
    </div>
  );
}

function SectionGrid({ section, slots, selected, onSelect }) {
  const cols = Array.from({ length: SECTION_COLS[section] }, (_, i) => i + 1);
  const slotMap = {};
  for (const s of slots) slotMap[`${s.row_label}-${s.column_number}`] = s;

  const getColor = (slot) => {
    if (!slot || slot.status === "available") return "#eceae4";
    if (slot.status === "pending_release") return "#f5e6d3";
    if (slot.status === "assigned" && slot.bottle) return "#1E4D5A";
    if (slot.status === "assigned" && !slot.bottle) return "#a8c4cc";
    return "#eceae4";
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "inline-block", minWidth: "fit-content" }}>
        <div style={{ display: "flex", marginBottom: "2px", marginLeft: "24px", gap: "2px" }}>
          {cols.map(col => (
            <div key={col} style={{ width: "22px", textAlign: "center", fontSize: "8px", color: "#aaa", fontFamily: "'Courier New', Courier, monospace", flexShrink: 0 }}>
              {col}
            </div>
          ))}
        </div>

        {ROWS.map(row => (
          <div key={row} style={{ display: "flex", alignItems: "center", gap: "2px", marginBottom: "2px" }}>
            <div style={{ width: "20px", fontSize: "9px", color: "#aaa", fontFamily: "'Courier New', Courier, monospace", flexShrink: 0, textAlign: "right", paddingRight: "4px" }}>
              {row}
            </div>
            {cols.map(col => {
              const slot = slotMap[`${row}-${col}`];
              const isSelected = selected?.section === section && selected?.row_label === row && selected?.column_number === col;
              return (
                <div
                  key={col}
                  onClick={() => slot && onSelect(slot)}
                  title={slotLabel(section, row, col)}
                  style={{
                    width: "22px",
                    height: "22px",
                    backgroundColor: getColor(slot),
                    border: isSelected ? "2px solid #0A242C" : "1px solid rgba(0,0,0,0.06)",
                    cursor: slot ? "pointer" : "default",
                    flexShrink: 0,
                    transition: "opacity 0.1s",
                  }}
                  onMouseEnter={e => { if (slot) e.currentTarget.style.opacity = "0.75"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VaultMap() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: slotData }, { data: members }, { data: bottles }] = await Promise.all([
        supabase.from("vault_slots").select("id, section, row_label, column_number, status, member_id").order("section").order("row_label").order("column_number").range(0, 1999),
        supabase.from("cellar_members").select("id, name, membership_tier"),
        supabase.from("cellar_bottles").select("id, slot_id, wine_name, vintage, type, notes, image_front_url, status").eq("status", "stored"),
      ]);

      const memberMap = {};
      for (const m of members || []) memberMap[m.id] = m;

      const bottleMap = {};
      for (const b of bottles || []) if (b.slot_id) bottleMap[b.slot_id] = b;

      const enriched = (slotData || []).map(s => ({
        ...s,
        member: s.member_id ? memberMap[s.member_id] || null : null,
        bottle: bottleMap[s.id] || null,
      }));

      setSlots(enriched);
      setLoading(false);
    };
    load();
  }, []);

  const total = slots.length;
  const assigned = slots.filter(s => s.status === "assigned").length;
  const withBottle = slots.filter(s => s.status === "assigned" && s.bottle).length;
  const available = slots.filter(s => s.status === "available").length;
  const pending = slots.filter(s => s.status === "pending_release").length;

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#1E4D5A" }} />
    </div>
  );

  return (
    <div style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      {selected && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99, backgroundColor: "rgba(10,36,44,0.4)" }} onClick={() => setSelected(null)}>
          <SlotPopover slot={selected} onClose={() => setSelected(null)} />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total slots", value: total },
          { label: "Assigned", value: assigned },
          { label: "With bottle", value: withBottle },
          { label: "Available", value: available },
        ].map(({ label, value }) => (
          <div key={label} style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", padding: "14px" }}>
            <p style={{ fontSize: "10px", color: "#777777", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{label}</p>
            <p style={{ fontSize: "20px", color: "#0A242C" }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        {[
          { color: "#1E4D5A", label: "Bottle stored" },
          { color: "#a8c4cc", label: "Assigned, empty" },
          { color: "#f5e6d3", label: "Pending release" },
          { color: "#eceae4", label: "Available", border: "1px solid #d8d6d0" },
        ].map(({ color, label, border }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div style={{ width: "12px", height: "12px", backgroundColor: color, border: border || "none", flexShrink: 0 }} />
            <p style={{ fontSize: "10px", color: "#777777", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        {["L", "B", "R"].map(section => (
          <div key={section}>
            <p style={{ fontSize: "10px", color: "#777777", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px", borderBottom: "1px solid #d8d6d0", paddingBottom: "6px" }}>
              {SECTION_LABELS[section]}
            </p>
            <SectionGrid
              section={section}
              slots={slots.filter(s => s.section === section)}
              selected={selected}
              onSelect={setSelected}
            />
          </div>
        ))}
      </div>

      {pending > 0 && (
        <div style={{ marginTop: "16px", backgroundColor: "#fdf3e7", border: "1px solid #f5e6d3", padding: "12px" }}>
          <p style={{ fontSize: "11px", color: "#c0792b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {pending} slot{pending !== 1 ? "s" : ""} pending release — bottles still to collect
          </p>
        </div>
      )}
    </div>
  );
}