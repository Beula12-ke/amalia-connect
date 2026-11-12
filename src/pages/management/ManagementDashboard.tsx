import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ManagementDashboard() {
  const qc = useQueryClient();

  function enableNotifications() {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }
  const alerts = useQuery({
    queryKey: ["emergency_alerts_active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("emergency_alerts").select("*").eq("status", "active");
      if (error) throw error;
      return data;
    },
  });
  const ack = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("emergency_alerts") as any).update({ status: "acknowledged" } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emergency_alerts_active"] }),
  });

  const residents = useQuery({
    queryKey: ["kpi_residents"],
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "resident");
      return count ?? 0;
    },
  });
  const visitorsToday = useQuery({
    queryKey: ["kpi_visitors_today"],
    queryFn: async () => {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);
      const { count } = await supabase.from("visitors").select("*", { count: "exact", head: true })
        .gte("expected_at", start.toISOString()).lte("expected_at", end.toISOString());
      return count ?? 0;
    },
  });
  const openRequests = useQuery({
    queryKey: ["kpi_open_requests"],
    queryFn: async () => {
      const { count } = await supabase.from("service_requests").select("*", { count: "exact", head: true }).neq("status", "resolved");
      return count ?? 0;
    },
  });
  const logs = useQuery({
    queryKey: ["recent_access_logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("access_logs").select("*").order("occurred_at", { ascending: false }).limit(5);
      if (error) throw error;
      return data;
    },
  });

  const kpis = [
    { label: "Total Residents", value: residents.data ?? 0 },
    { label: "Visitors Today", value: visitorsToday.data ?? 0 },
    { label: "Open Requests", value: openRequests.data ?? 0 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl">Estate Management</h1>
        <button onClick={enableNotifications} className="btn-secondary text-xs inline-flex items-center gap-1">
          <Bell size={14} />
          {typeof Notification !== "undefined" && Notification.permission === "granted" ? "Notifications On" : "Enable Notifications"}
        </button>
      </div>
      {(alerts.data ?? []).length > 0 && (
        <div className="mb-6 space-y-3">
          {(alerts.data ?? []).map((a: any) => (
            <motion.div key={a.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-5 bg-signal/10 border-signal border-t-4 border-t-signal">
              <div className="flex items-center justify-between">
                <div>
                  <span className="badge-danger mr-2">{a.alert_type}</span>
                  <span className="text-sm text-slate">Unit {a.unit_id}</span>
                </div>
                <button onClick={() => ack.mutate(a.id)} className="btn-secondary text-signal text-xs">Acknowledge</button>
              </div>
              {a.description && <p className="text-sm mt-2">{a.description}</p>}
            </motion.div>
          ))}
        </div>
      )}
      <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }} className="grid sm:grid-cols-3 gap-4 mb-6">
        {kpis.map((k) => (
          <motion.div key={k.label} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} className="glass-card p-5 border-t-4 border-t-gold">
            <div className="text-[11px] uppercase text-slate">{k.label}</div>
            <div className="text-2xl font-extrabold text-navy mt-1">{k.value}</div>
          </motion.div>
        ))}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
        <h2 className="text-lg mb-3">Recent Gate Activity</h2>
        <div className="space-y-2">
          {(logs.data ?? []).map((l: any) => (
            <div key={l.id} className="flex justify-between text-sm border-b border-line py-2">
              <span>{l.visitor_name_snapshot}</span>
              <span className="text-slate">{l.event_type}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}