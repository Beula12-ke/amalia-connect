import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationBell() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any).from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const unreadCount = notifications?.filter((n: any) => !n.read_at).length || 0;

  const markAsRead = async () => {
    await (supabase as any).from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user!.id).is("read_at", null);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-white/80 hover:text-white transition-colors">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-signal text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-navy">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-line overflow-hidden z-50">
            <div className="flex justify-between items-center p-4 border-b border-line bg-ivory">
              <h3 className="font-bold text-navy text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAsRead} className="text-xs text-gold font-bold hover:underline">Mark all read</button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications?.length === 0 ? (
                <div className="p-6 text-center text-slate text-sm">No new notifications.</div>
              ) : (
                notifications?.map((n: any) => (
                  <div key={n.id} className={`p-4 border-b border-line last:border-0 ${!n.read_at ? 'bg-gold/5' : ''}`}>
                    <div className="font-bold text-navy text-sm mb-1">{n.title}</div>
                    <div className="text-slate text-xs line-clamp-2">{n.body}</div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}