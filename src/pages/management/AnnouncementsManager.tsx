import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Trash2, Plus, AlertTriangle } from "lucide-react";

export default function AnnouncementsManager() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");

  const { data: announcements } = useQuery({
    queryKey: ["announcements-all"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("announcements").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const createAnn = useMutation({
    mutationFn: async () => {
      const { data: ann, error } = await (supabase as any).from("announcements").insert({
        title, body, category, priority, published: true, created_by: user?.id,
      }).select().single();
      if (error) throw error;
      const { data: residents } = await (supabase as any).from("profiles").select("id").eq("role", "resident");
      if (residents && residents.length) {
        await (supabase as any).from("notifications").insert(residents.map((r: any) => ({
          user_id: r.id, title, body, type: "announcement",
        })));
      }
      return ann;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements-all"] });
      setTitle(""); setBody(""); setCategory("general"); setPriority("normal");
    },
  });

  const deleteAnn = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements-all"] }),
  });

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-premium p-6 border border-line">
        <h1 className="text-2xl font-extrabold text-navy mb-4 flex items-center gap-2"><Plus size={20} /> New Announcement</h1>
        <div className="space-y-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border border-line rounded-lg p-3" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" className="w-full border border-line rounded-lg p-3 h-32" />
          <div className="grid grid-cols-2 gap-3">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-line rounded-lg p-3">
              <option value="general">General</option>
              <option value="security">Security</option>
              <option value="maintenance">Maintenance</option>
              <option value="event">Event</option>
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="border border-line rounded-lg p-3">
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <button onClick={() => createAnn.mutate()} disabled={!title || !body} className="btn-primary w-full">Publish</button>
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-navy">Published</h2>
        <AnimatePresence>
          {announcements?.map((a: any) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-xl p-4 border border-line">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-navy">{a.title}</div>
                  <div className="text-xs text-slate mt-1">{a.category} · {a.priority}</div>
                </div>
                <button onClick={() => deleteAnn.mutate(a.id)} className="text-signal hover:bg-signal/10 p-2 rounded"><Trash2 size={16} /></button>
              </div>
              <p className="text-sm text-slate mt-2">{a.body}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}