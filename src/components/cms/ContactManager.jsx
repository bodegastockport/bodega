import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_STYLE = {
  new: { backgroundColor: "#eceae4", color: "#193c47", border: "1px solid #c8d8dc" },
  read: { backgroundColor: "#eceae4", color: "#777777", border: "1px solid #d8d6d0" },
  replied: { backgroundColor: "#eaf0ec", color: "#2e6b45", border: "1px solid #c8dace" },
};

export default function ContactManager() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('contact_submissions')
        .select()
        .order('created_at', { ascending: false });
      setMessages(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status })
      .eq('id', id);
    if (!error) {
      setMessages((p) => p.map((m) => m.id === id ? { ...m, status } : m));
      toast.success("Status updated");
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" style={{ color: "#193c47" }} /></div>;

  return (
    <div className="space-y-6" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      <p className="text-xs" style={{ color: "#777777" }}>{messages.length} message{messages.length !== 1 ? "s" : ""} received</p>

      {messages.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#777777" }}>
          <p className="text-sm">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} style={{ backgroundColor: "#eceae4", border: "1px solid #d8d6d0", borderRadius: "6px", padding: "20px" }}>
              <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div>
                  <p className="text-sm" style={{ color: "#2e282a" }}>{msg.name}</p>
                  <a href={`mailto:${msg.email}`} className="text-xs" style={{ color: "#193c47" }}>{msg.email}</a>
                  <p className="text-xs mt-0.5" style={{ color: "#777777" }}>
                    {msg.created_at ? format(new Date(msg.created_at), "d MMM yyyy 'at' HH:mm") : ""}
                  </p>
                </div>
                <Select value={msg.status || "new"} onValueChange={(v) => updateStatus(msg.id, v)}>
                  <SelectTrigger style={{ ...STATUS_STYLE[msg.status || "new"], fontSize: "11px", padding: "4px 10px", borderRadius: "4px", fontFamily: "'Courier New', Courier, monospace", textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", minWidth: "90px" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div style={{ backgroundColor: "#f3f2ee", border: "1px solid #d8d6d0", borderRadius: "4px", padding: "12px" }}>
                <p className="text-sm leading-relaxed" style={{ color: "#777777" }}>{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
