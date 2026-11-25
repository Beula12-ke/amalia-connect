import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Megaphone, AlertTriangle } from "lucide-react";

export default function Announcements() {
  const { data } = useQuery({
    queryKey: ["announcements-published"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("announcements").select("*").eq("published", true).order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-3xl font-extrabold text-navy">Announcements</h1>
      <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }} className="space-y-4">
        {data?.map((a: any) => {
          const urgent = a.priority === "urgent" || a.priority === "high";
          return (
            <motion.div key={a.id} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} className={`bg-white rounded-2xl p-6 border ${urgent ? "border-signal shadow-[0_0_20px_rgba(198,40,40,0.15)]" : "border-line"} shadow-premium`}>
              <div className="flex items-center gap-2 mb-2">
                {urgent ? <AlertTriangle className="text-signal" size={20} /> : <Megaphone className="text-gold" size={20} />}
                <h2 className="text-xl font-bold text-navy">{a.title}</h2>
              </div>
              <p className="text-slate text-sm">{a.body}</p>
              <div className="text-xs text-slate mt-3">{a.category} · {new Date(a.created_at).toLocaleString()}</div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}