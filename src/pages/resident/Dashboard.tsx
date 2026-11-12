import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Wrench, Siren, Megaphone, Home, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const { profile, user } = useAuth();
  const qc = useQueryClient();
  const first = profile?.full_name?.split(" ")[0] ?? "there";

  function enableNotifications() {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  const pending = useQuery({
    queryKey: ["pending_walkins", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("visitors").select("*").eq("status", "pending");
      if (error) throw error;
      return data ?? [];
    },
  });

  const household = useQuery({
    queryKey: ["household", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("resident_units").select("units(unit_code)").eq("resident_id", user!.id).single();
      if (error) return null;
      return data;
    },
    enabled: !!user,
  });

  const approve = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("visitors") as any).update({ status: "approved" } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pending_walkins"] }),
  });

  const actions = [
    { to: "/visitors/new", label: "Register Visitor", icon: UserPlus },
    { to: "/services", label: "Request Maintenance", icon: Wrench },
    { to: "/emergency", label: "Emergency Alert", icon: Siren },
    { to: "/announcements", label: "View Announcements", icon: Megaphone },
  ];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl">Good morning, {first}</h1>
          <button onClick={enableNotifications} className="btn-secondary text-xs inline-flex items-center gap-1">
            <Bell size={14} />
            {typeof Notification !== "undefined" && Notification.permission === "granted" ? "Notifications On" : "Enable Notifications"}
          </button>
        </div>
        <p className="text-slate">Your home, your community — all connected.</p>
      </div>

      {(pending.data ?? []).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5 bg-amber/10 border-amber border-t-4 border-t-gold">
          <p className="font-semibold mb-2">You have a visitor waiting at the gate.</p>
          {(pending.data ?? []).map((v: any) => (
            <div key={v.id} className="flex items-center justify-between py-1">
              <span>{v.visitor_name}</span>
              <button onClick={() => approve.mutate(v.id)} className="btn-primary text-xs">Approve</button>
            </div>
          ))}
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border-t-4 border-t-gold">
        <div className="flex items-center gap-2 mb-3"><Home size={18} className="text-gold" /><h2 className="text-lg">Your Household</h2></div>
        <p className="text-slate text-sm">Linked unit: <span className="font-semibold text-navy">{(household.data as any)?.units?.unit_code ?? "—"}</span></p>
      </motion.div>

      <div>
        <h2 className="text-lg mb-3">Quick Actions</h2>
        <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((a) => (
            <motion.div key={a.to} variants={item} whileHover={{ scale: 1.02 }}>
              <Link to={a.to} className="glass-card p-5 flex flex-col items-center gap-2 text-center hover:border-gold border-t-4 border-t-gold transition block">
                <a.icon className="text-gold" size={28} />
                <span className="font-medium text-sm">{a.label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}