import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Users, Shield, Wrench, Activity, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Database } from "@/lib/database.types";

type AccessLog = Database["public"]["Tables"]["access_logs"]["Row"];
type Stats = {
  residents: number;
  visitorsInside: number;
  openRequests: number;
  activeAlerts: number;
};

export default function ManagementDashboard() {
  // Fetch KPIs
  const { data: stats } = useQuery<Stats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [residents, visitors, requests, alerts] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "resident"),
        supabase.from("visitors").select("*", { count: "exact", head: true }).eq("status", "checked_in"),
        supabase.from("service_requests").select("*", { count: "exact", head: true }).neq("status", "resolved"),
        supabase.from("emergency_alerts").select("*", { count: "exact", head: true }).eq("status", "active")
      ]);
      return {
        residents: residents.count || 0,
        visitorsInside: visitors.count || 0,
        openRequests: requests.count || 0,
        activeAlerts: alerts.count || 0,
      };
    },
  });

  // Fetch Recent Gate Activity
  const { data: logs } = useQuery<AccessLog[]>({
    queryKey: ["recent-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("access_logs")
        .select("*")
        .order("occurred_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-estate/10 text-estate text-xs font-bold mb-3">
            <span className="w-2 h-2 rounded-full bg-estate animate-pulse"></span>
            SYSTEM ONLINE
          </div>
          <h1 className="text-3xl font-extrabold text-navy">Estate Command Center</h1>
          <p className="text-slate mt-1">Overview of your estate's security and operations.</p>
        </div>
      </div>

      {/* EMERGENCY ALERTS BANNER */}
      {stats && stats.activeAlerts > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-signal/10 border border-signal/30 rounded-2xl p-6 flex items-start gap-4">
          <ShieldAlert className="text-signal shrink-0" size={28} />
          <div>
            <h3 className="text-signal font-bold text-lg">Active Emergency Alerts!</h3>
            <p className="text-signal/80 text-sm mb-3">There are {stats.activeAlerts} unaddressed emergency alerts in the estate.</p>
            <Link to="/management/alerts" className="bg-signal text-white px-4 py-2 rounded-lg text-sm font-bold inline-block hover:bg-red-700 transition">View Alerts</Link>
          </div>
        </motion.div>
      )}

      {/* BENTO KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Residents", value: stats?.residents || 0, icon: Users, color: "text-navy", bg: "bg-navy/5", link: "/management/users" },
          { title: "Visitors Inside", value: stats?.visitorsInside || 0, icon: Shield, color: "text-estate", bg: "bg-estate/5", link: "/management/visitors" },
          { title: "Open Requests", value: stats?.openRequests || 0, icon: Wrench, color: "text-amber", bg: "bg-amber/5", link: "/management/services" },
          { title: "Gate Activity", value: "Live", icon: Activity, color: "text-gold", bg: "bg-gold/5", link: "/gate" },
        ].map((kpi, i) => (
          <Link key={i} to={kpi.link}>
            <motion.div whileHover={{ y: -5, scale: 1.02 }} className="bg-white rounded-2xl shadow-premium p-6 border border-line hover:border-gold/30 transition-all h-full">
              <div className={`w-12 h-12 ${kpi.bg} rounded-xl flex items-center justify-center mb-4`}>
                <kpi.icon className={kpi.color} size={24} />
              </div>
              <div className="text-slate font-medium text-sm mb-1">{kpi.title}</div>
              <div className="text-3xl font-extrabold text-navy">{kpi.value}</div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* TWO COLUMN LAYOUT: TIMELINE & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECENT GATE ACTIVITY (Timeline) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-premium p-6 border border-line">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-navy">Recent Gate Activity</h2>
            <Link to="/management/visitors" className="text-gold text-sm font-bold hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {logs?.length === 0 && <p className="text-slate text-sm">No recent gate activity.</p>}
            {logs?.map((log, i) => (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={log.id} className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${log.event_type === 'entry_granted' ? 'bg-estate/10 text-estate' : 'bg-slate/10 text-slate'}`}>
                  <CheckCircle2 size={16} />
                </div>
                <div className="flex-1 border-b border-line pb-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-navy text-sm">{log.visitor_name_snapshot}</span>
                    <span className="text-xs text-slate">{new Date(log.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate text-xs mt-0.5">{log.event_type.replace('_', ' ').toUpperCase()} at {log.gate_name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white rounded-2xl shadow-premium p-6 border border-line">
          <h2 className="text-xl font-bold text-navy mb-6">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: "Register Visitor", link: "/visitors/new" },
              { label: "Add Resident", link: "/management/users" },
              { label: "Publish Notice", link: "/management/announcements" },
              { label: "View Gate Logs", link: "/gate" }
            ].map((action, i) => (
              <Link key={i} to={action.link}>
                <motion.div whileHover={{ x: 5 }} className="flex items-center justify-between p-4 rounded-xl bg-ivory hover:bg-navy hover:text-white transition-colors group cursor-pointer">
                  <span className="font-bold text-sm">{action.label}</span>
                  <ArrowRight size={16} className="text-gold group-hover:text-gold" />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}