import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_STYLE = {
  new: { backgroundColor: "#eceae4", color: "#193c47", border: "1px solid #c8d8dc" },
  in_progress: { backgroundColor: "#f0ede8", color: "#777777", border: "1px solid #d8d6d0" },
  resolved: { backgroundColor: "#eaf0ec", color: "#2e6b45", border: "1px solid #c8dace" },
};

export default function HireEnquiriesManager() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("hire_enquiries")
        .select()
        .order("created_at", { ascending: false });
      setEnquiries(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from("hire_enquiries")
      .update({ status })
      .eq("id", id);
    if (!error) {
      setEnquiries((p) => p.map((e) => e.id === id ? { ...e, status } : e));
      toast.success("Status updated");
    }
  };

  const deleteEnquiry = async (id) => {
    const { error } = await supabase
      .from("hire_enquiries")
      .delete()
      .eq("id", id);
    if (!error) {
      setEnquiries((p) => p.filter((e) => e.id !== id));
      toast.success("Enquiry deleted");
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" style={{ color: "#193c47" }} /></div>;

  return (
    <div className="space-y-6" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      <p className="text-xs" style={{ color: "#777777" }}>{enquiries.length} enquir{enquiries.length !== 1 ? "ies" : "y"} received</p>

      {enquiries.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#777777" }}>
          <p className="text-sm">No enquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((enq) => (
            <div key={enq.id} style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "20px" }}>
              <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                <div>
                  <p className="text-sm" style={{ color: "#2e282a" }}>{enq.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#777777" }}>
                    {enq.created_at ? format(new Date(enq.created_at), "d MMM yyyy 'at' HH:mm") : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={enq.status || "new"} onValueChange={(v) => updateStatus(enq.id, v)}>
                    <SelectTrigger style={{ ...STATUS_STYLE[enq.status || "new"], fontSize: "11px", padding: "4px 10px", borderRadius: "4px", fontFamily: "'Courier New', Courier, monospace", textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", minWidth: "110px" }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => deleteEnquiry(enq.id)}
                    style={{ padding: "4px", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "#777777", display: "flex", alignItems: "center" }}
                    title="Delete enquiry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Email", value: enq.email, href: `mailto:${enq.email}` },
                  enq.phone && { label: "Phone", value: enq.phone },
                  enq.event_type && { label: "Type", value: enq.event_type },
                  enq.date && { label: "Date", value: enq.date },
                  enq.guests && { label: "Guests", value: `${enq.guests} guests` },
                ].filter(Boolean).map((item) => (
                  <div key={item.label}>
                    <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "#777777" }}>{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-xs" style={{ color: "#193c47" }}>{item.value}</a>
                    ) : (
                      <p className="text-xs" style={{ color: "#2e282a" }}>{item.value}</p>
                    )}
                  </div>
                ))}
              </div>
              {enq.message && (
                <div style={{ backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "4px", padding: "12px" }}>
                  <p className="text-sm leading-relaxed" style={{ color: "#777777" }}>{enq.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}