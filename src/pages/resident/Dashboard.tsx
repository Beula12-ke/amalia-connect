import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Users, Wrench, ShieldAlert, Bell, QrCode, ArrowRight } from "lucide-react";
import type { Database } from "@/lib/database.types";

type ResidentUnit = Database["public"]["Tables"]["resident_units"]["Row"] & {
  units: Pick<Database["public"]["Tables"]["units"]["Row"], "unit_code"> | null;
};

export default function Dashboard() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] || "Resident";

  // Fetch resident's unit
  const { data: unit } = useQuery<string>({
    queryKey: ["my-unit", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return "Not Linked";
      const { data } = await supabase
        .from("resident_units")
        .select("units(unit_code)")
        .eq("resident_id", profile.id)
        .single();
      return (data as ResidentUnit | null)?.units?.unit_code || "Not Linked";
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">Good morning, {firstName}</h1>
          <p className="text-slate mt-1">Your home, your community — all connected.</p>
        </div>
      </div>

      {/* Hero Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-navy to-[#1c3858] text-white rounded-2xl p-8 shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Amalia Connect.</h2>
        <p className="text-white/70 max-w-lg mb-6">
          Manage visitors before they arrive, report issues instantly, and stay informed with estate-wide updates.
        </p>
        <Link to="/visitors/new" className="bg-gold text-navy font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2 hover:scale-105 transition-transform">
          <QrCode size={20} /> Register a Visitor
        </Link>
      </motion.div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-bold text-navy mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Request Maintenance", desc: "Report an issue in your unit.", icon: Wrench, link: "/services", color: "text-amber", bg: "bg-amber/10" },
            { title: "View Announcements", desc: "See what's happening in the estate.", icon: Bell, link: "/announcements", color: "text-navy", bg: "bg-navy/10" },
            { title: "Emergency Help", desc: "Instantly alert security.", icon: ShieldAlert, link: "/emergency", color: "text-signal", bg: "bg-signal/10" },
          ].map((action, i) => (
            <Link key={i} to={action.link}>
              <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 shadow-premium border border-line h-full flex flex-col justify-between hover:border-gold/50 transition-colors">
                <div>
                  <div className={`w-12 h-12 ${action.bg} ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                    <action.icon size={24} />
                  </div>
                  <h3 className="font-bold text-navy text-lg mb-1">{action.title}</h3>
                  <p className="text-slate text-sm">{action.desc}</p>
                </div>
                <div className="mt-4 flex items-center text-gold font-bold text-sm">
                  Take Action <ArrowRight size={16} className="ml-1" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Household Status */}
      <div className="bg-white rounded-2xl p-6 shadow-premium border border-line">
        <h2 className="text-lg font-bold text-navy mb-4">Your Household</h2>
        <div className="flex items-center gap-4 text-slate">
          <div className="bg-ivory px-6 py-4 rounded-xl border border-line">
            <div className="text-sm font-bold text-slate uppercase">Linked Unit</div>
            <div className="text-xl font-extrabold text-navy mt-1">{unit}</div>
          </div>
        </div>
      </div>
    </div>
  );
}