import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Users, Wrench, ShieldAlert, Bell, QrCode, ArrowRight, Home, CheckCircle2 } from "lucide-react";
import type { Database } from "@/lib/database.types";

type ResidentUnit = Database["public"]["Tables"]["resident_units"]["Row"] & {
  units: Pick<Database["public"]["Tables"]["units"]["Row"], "unit_code"> | null;
};

type Visitor = Database["public"]["Tables"]["visitors"]["Row"];
type Announcement = Database["public"]["Tables"]["announcements"]["Row"];

export default function Dashboard() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] || "Resident";

  // Fetch unit data
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

  // Fetch pending visitors
  const { data: pendingVisitors } = useQuery<Visitor[]>({
    queryKey: ["pending-visitors", profile?.id],
    queryFn: async () => {
      const { data } = await supabase.from("visitors").select("*").eq("resident_id", profile!.id).eq("status", "pending");
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Fetch recent announcements
  const { data: announcements } = useQuery<Announcement | undefined>({
    queryKey: ["recent-announcements"],
    queryFn: async () => {
      const { data } = await supabase.from("announcements").select("*").eq("published", true).order("created_at", { ascending: false }).limit(1);
      return data?.[0];
    },
  });

  const quickActions = [
    { title: "Register Visitor", desc: "Pre-authorize a guest.", icon: QrCode, link: "/visitors/new", color: "text-navy", bg: "bg-navy/5", hover: "hover:bg-navy" },
    { title: "Request Maintenance", desc: "Report an issue.", icon: Wrench, link: "/services", color: "text-amber", bg: "bg-amber/5", hover: "hover:bg-amber" },
    { title: "View Announcements", desc: "Estate news & updates.", icon: Bell, link: "/announcements", color: "text-estate", bg: "bg-estate/5", hover: "hover:bg-estate" },
    { title: "Emergency Help", desc: "Alert security instantly.", icon: ShieldAlert, link: "/emergency", color: "text-signal", bg: "bg-signal/5", hover: "hover:bg-signal" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">Good day, {firstName}</h1>
          <p className="text-slate mt-1">Welcome to your resident portal.</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-line flex items-center gap-3">
          <div className="bg-gold/10 p-2 rounded-xl text-gold"><Home size={20} /></div>
          <div>
            <div className="text-[10px] font-bold text-slate uppercase tracking-wider">Linked Unit</div>
            <div className="font-extrabold text-navy">{unit || "Loading..."}</div>
          </div>
        </div>
      </div>

      {/* HERO BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-navy to-[#1c3858] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 max-w-xl">
          <span className="inline-block px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold tracking-widest mb-4 backdrop-blur-md">
            AMALIA CONNECT
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Your home, your community — all connected.</h2>
          <p className="text-white/70 mb-6">Manage visitors before they arrive, report issues instantly, and stay informed with estate-wide updates.</p>
          <Link to="/visitors/new" className="bg-gold text-navy font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
            <QrCode size={18} /> Register a Visitor
          </Link>
        </div>
      </motion.div>

      {/* PENDING APPROVALS ALERT */}
      {pendingVisitors && pendingVisitors.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-amber/10 border border-amber/30 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-amber text-white p-2 rounded-full"><Users size={20} /></div>
            <div>
              <h3 className="font-bold text-navy">You have {pendingVisitors.length} visitor(s) waiting!</h3>
              <p className="text-amber text-sm">A guard has requested entry approval for a walk-in guest.</p>
            </div>
          </div>
          <Link to="/visitors" className="bg-amber text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-amber-600 transition">Review</Link>
        </motion.div>
      )}

      {/* QUICK ACTIONS GRID */}
      <div>
        <h2 className="text-xl font-bold text-navy mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <Link key={i} to={action.link}>
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }} 
                className={`bg-white p-6 rounded-2xl shadow-premium border border-line h-full flex flex-col justify-between group transition-all duration-300 ${action.hover} hover:text-white hover:border-transparent cursor-pointer`}
              >
                <div>
                  <div className={`w-12 h-12 ${action.bg} ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20 group-hover:text-white transition-colors`}>
                    <action.icon size={24} />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                  <p className="text-slate text-sm group-hover:text-white/80 transition-colors">{action.desc}</p>
                </div>
                <div className="mt-6 flex items-center text-sm font-bold">
                  Access <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* RECENT ANNOUNCEMENT */}
      {announcements && (
        <div>
          <h2 className="text-xl font-bold text-navy mb-4">Latest Estate Notice</h2>
          <div className="bg-white p-6 rounded-2xl shadow-premium border border-line">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-navy text-lg">{announcements.title}</h3>
              <span className="text-xs text-slate">{new Date(announcements.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-slate">{announcements.body}</p>
          </div>
        </div>
      )}

    </div>
  );
}