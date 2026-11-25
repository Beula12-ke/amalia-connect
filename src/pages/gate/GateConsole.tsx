import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, QrCode, Users, Clock, CheckCircle2, XCircle, Search, Loader2, ArrowRight, Wrench } from "lucide-react";

export default function GateConsole() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("scan");
  const [passCode, setPassCode] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const { data: pendingVisitors } = useQuery({
    queryKey: ["pending-visitors"],
    queryFn: async () => {
      const { data } = await supabase.from("visitors").select("*, units(unit_code), profiles(full_name)").eq("status", "pending").order("created_at", { ascending: true });
      return data || [];
    },
  });

  const { data: activeVisitors } = useQuery({
    queryKey: ["active-visitors"],
    queryFn: async () => {
      const { data } = await supabase.from("visitors").select("*, units(unit_code)").eq("status", "checked_in").order("checked_in_at", { ascending: false });
      return data || [];
    },
  });

  const { data: providers } = useQuery({
    queryKey: ["active-providers"],
    queryFn: async () => {
      const { data } = await supabase.from("visitors").select("*, units(unit_code)").eq("status", "approved").eq("visitor_category", "service_provider").order("expected_at", { ascending: true });
      return data || [];
    },
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passCode) return;
    setSearching(true);
    setSearchResult(null);

    const { data } = await supabase
      .from("visitors")
      .select("*, units(unit_code), profiles(full_name)")
      .eq("pass_code", passCode.toUpperCase())
      .single();

    setSearching(false);
    if (data) setSearchResult(data);
    else setSearchResult({ error: "Invalid pass code. Not found." });
  };

  const recordEntry = async (visitor: any) => {
    await supabase.from("visitors").update({ status: "checked_in", checked_in_at: new Date().toISOString() }).eq("id", visitor.id);
    await supabase.from("access_logs").insert({ visitor_id: visitor.id, unit_id: visitor.unit_id, resident_id: visitor.resident_id, guard_id: user?.id, event_type: "entry_granted", gate_name: "Main Gate", visitor_name_snapshot: visitor.visitor_name });
    setSearchResult(null); setPassCode("");
    queryClient.invalidateQueries({ queryKey: ["pending-visitors", "active-visitors", "active-providers"] });
  };

  const recordExit = async (visitor: any) => {
    await supabase.from("visitors").update({ status: "checked_out", checked_out_at: new Date().toISOString() }).eq("id", visitor.id);
    await supabase.from("access_logs").insert({ visitor_id: visitor.id, unit_id: visitor.unit_id, resident_id: visitor.resident_id, guard_id: user?.id, event_type: "exit_recorded", gate_name: "Main Gate", visitor_name_snapshot: visitor.visitor_name });
    queryClient.invalidateQueries({ queryKey: ["active-visitors"] });
  };

  const TABS = [
    { id: "scan", label: "Scan Pass", icon: QrCode },
    { id: "pending", label: "Pending Walk-ins", icon: Clock },
    { id: "active", label: "Inside Estate", icon: Users },
    { id: "providers", label: "Providers", icon: Wrench },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0a1524] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Visitors Inside</div>
            <div className="text-3xl font-extrabold text-estate mt-1">{activeVisitors?.length || 0}</div>
          </div>
          <Users className="text-estate/50" size={32} />
        </div>
        <div className="bg-[#0a1524] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Walk-ins</div>
            <div className="text-3xl font-extrabold text-amber mt-1">{pendingVisitors?.length || 0}</div>
          </div>
          <Clock className="text-amber/50" size={32} />
        </div>
        <div className="bg-[#0a1524] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Providers Expected</div>
            <div className="text-3xl font-extrabold text-gold mt-1">{providers?.length || 0}</div>
          </div>
          <Wrench className="text-gold/50" size={32} />
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap relative ${
              activeTab === tab.id ? 'text-navy' : 'text-white hover:text-gold bg-white/5'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div layoutId="active-tab" className="absolute inset-0 bg-gold rounded-xl -z-10" />
            )}
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === "scan" && (
            <motion.div key="scan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#0a1524] border border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gold/5 blur-3xl rounded-full" />
                <div className="relative z-10 w-full max-w-md">
                  <div className="bg-white/5 p-6 rounded-full mb-6 w-fit mx-auto border border-white/10">
                    <QrCode size={48} className="text-gold" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2 text-center">Verify Visitor Pass</h2>
                  <p className="text-slate-300 mb-8 text-center text-sm font-medium">Enter the 6-character pass code provided by the resident.</p>

                  <form onSubmit={handleSearch} className="w-full flex gap-3 relative">
                    <motion.div
                      animate={{ x: ["0%", "100%", "0%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute top-0 bottom-0 w-1 bg-gold shadow-[0_0_15px_rgba(198,161,91,0.8)] z-20 pointer-events-none opacity-50"
                    />
                    <input
                      type="text"
                      value={passCode}
                      onChange={(e) => setPassCode(e.target.value.toUpperCase())}
                      placeholder="E.G., A1B2C3"
                      className="flex-1 text-center text-3xl font-mono tracking-[0.3em] uppercase bg-white/5 border border-white/20 text-white rounded-xl p-5 focus:ring-2 focus:ring-gold outline-none transition-all placeholder:text-white/40"
                      maxLength={6}
                    />
                    <button type="submit" disabled={searching || passCode.length < 4} className="bg-gold text-navy px-8 rounded-xl font-bold hover:bg-yellow-500 transition-colors flex items-center justify-center">
                      {searching ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
                    </button>
                  </form>
                </div>
              </div>

              <div className="bg-[#0a1524] border border-white/10 rounded-3xl p-6 flex flex-col">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Clock size={18} className="text-gold"/> Recently Verified</h3>
                {searchResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex items-center justify-center">
                    {searchResult.error ? (
                      <motion.div animate={{ x: [0, -10, 10, -10, 10, 0] }} className="bg-signal/10 border border-signal/30 rounded-2xl p-8 text-center w-full">
                        <XCircle size={56} className="text-signal mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-signal">Access Denied</h3>
                        <p className="text-signal/80 mt-2">{searchResult.error}</p>
                      </motion.div>
                    ) : (
                      <motion.div animate={{ boxShadow: ["0 0 0px rgba(37,132,90,0)", "0 0 40px rgba(37,132,90,0.4)", "0 0 0px rgba(37,132,90,0)"] }} transition={{ duration: 2, repeat: Infinity }} className="bg-estate/10 border border-estate/30 rounded-2xl p-8 w-full">
                        <CheckCircle2 size={56} className="text-estate mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-estate text-center mb-6">Access Granted</h3>
                        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10 text-center">
                          <div className="text-xs text-slate-400 uppercase font-bold mb-1">Visitor</div>
                          <div className="text-2xl font-bold text-white">{searchResult.visitor_name}</div>
                          <div className="text-sm text-gold mt-2">Visiting: Unit {searchResult.units?.unit_code} ({searchResult.profiles?.full_name})</div>
                        </div>
                        <button onClick={() => recordEntry(searchResult)} className="w-full bg-estate text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-lg shadow-estate/20">
                          Record Entry
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                    <Shield size={48} className="mb-4 opacity-20" />
                    <p className="text-slate-400 font-medium">Waiting for scan...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "pending" && (
            <motion.div key="pending" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {pendingVisitors?.length === 0 ? (
                <div className="text-center p-16 bg-[#0a1524] rounded-2xl border border-white/10 text-slate-400">No pending walk-ins.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pendingVisitors?.map((v) => (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.02 }} key={v.id} className="bg-[#0a1524] border border-white/10 rounded-2xl p-5 flex flex-col justify-between min-h-[160px]">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-white text-lg">{v.visitor_name}</div>
                          <span className="w-2 h-2 rounded-full bg-amber animate-ping mt-2"></span>
                        </div>
                        <div className="text-sm text-slate-400">Waiting for Unit {v.units?.unit_code}</div>
                      </div>
                      <div className="mt-4 badge-warning w-full text-center py-2">Awaiting Resident Approval</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "active" && (
            <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {activeVisitors?.length === 0 ? (
                <div className="text-center p-16 bg-[#0a1524] rounded-2xl border border-white/10 text-slate-400">No visitors currently inside the estate.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {activeVisitors?.map((v) => (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.02 }} key={v.id} className="bg-[#0a1524] border border-white/10 rounded-2xl p-5 flex flex-col justify-between min-h-[180px]">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-white text-lg">{v.visitor_name}</div>
                          <span className="badge-success">Inside</span>
                        </div>
                        <div className="text-sm text-slate-400">Unit {v.units?.unit_code}</div>
                        <div className="text-xs text-slate-500 mt-1">In: {new Date(v.checked_in_at).toLocaleTimeString()}</div>
                      </div>
                      <button onClick={() => recordExit(v)} className="mt-4 w-full bg-white/5 border border-white/10 text-white py-2 rounded-lg font-bold hover:bg-signal hover:border-signal transition-colors flex items-center justify-center gap-2">
                        Record Exit <ArrowRight size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "providers" && (
            <motion.div key="providers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {providers?.length === 0 ? (
                <div className="text-center p-16 bg-[#0a1524] rounded-2xl border border-white/10 text-slate-400">No approved service providers expected.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {providers?.map((v) => (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.02 }} key={v.id} className="bg-[#0a1524] border border-white/10 rounded-2xl p-5 flex flex-col justify-between min-h-[180px]">
                      <div>
                        <div className="font-bold text-white text-lg mb-1">{v.visitor_name}</div>
                        <div className="text-sm text-slate-400">Assigned to Unit {v.units?.unit_code}</div>
                        <div className="mt-3 bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Pass Code</div>
                          <div className="font-mono text-xl font-bold text-gold tracking-widest">{v.pass_code}</div>
                        </div>
                      </div>
                      <button onClick={() => recordEntry(v)} className="mt-4 w-full bg-gold text-navy py-2 rounded-lg font-bold hover:bg-yellow-500 transition-colors">
                        Record Entry
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}