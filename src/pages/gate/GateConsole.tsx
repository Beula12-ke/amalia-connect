import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Clock, DoorOpen, LogIn, LogOut, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Tab = "scan" | "pending" | "active";

export default function GateConsole() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("scan");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "granted" | "denied">("idle");
  const [loading, setLoading] = useState(false);

  const pending = useQuery({
    queryKey: ["gate_pending"],
    queryFn: async () => {
      const { data, error } = await supabase.from("visitors").select("*, units(unit_code)").eq("status", "pending").order("created_at", { ascending: false });
      if (error) throw error; return data ?? [];
    },
  });
  const active = useQuery({
    queryKey: ["gate_active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("visitors").select("*, units(unit_code)").eq("status", "checked_in").order("checked_in_at", { ascending: false });
      if (error) throw error; return data ?? [];
    },
  });

  async function verify() {
    setLoading(true); setResult(null); setStatus("idle");
    const { data } = await supabase.from("visitors").select("*, units(unit_code)").eq("pass_code", code.trim().toUpperCase()).single();
    setLoading(false);
    if (!data || (data as any).status !== "approved") { setStatus("denied"); setResult(data); return; }
    setStatus("granted"); setResult(data);
  }

  async function recordEntry() {
    if (!result) return;
    const { data: { user } } = await supabase.auth.getUser();
    await (supabase.from("visitors") as any).update({ status: "checked_in", checked_in_at: new Date().toISOString() } as any).eq("id", result.id);
    await (supabase.from("access_logs") as any).insert([{ visitor_id: result.id, unit_id: result.unit_id, resident_id: result.resident_id, guard_id: user!.id, event_type: "entry_granted", gate_name: "Main Gate", visitor_name_snapshot: result.visitor_name }] as any);
    setResult({ ...result, status: "checked_in" }); setStatus("idle"); setCode("");
    qc.invalidateQueries({ queryKey: ["gate_active"] });
  }

  const recordExit = useMutation({
    mutationFn: async (v: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      await (supabase.from("visitors") as any).update({ status: "checked_out" } as any).eq("id", v.id);
      await (supabase.from("access_logs") as any).insert([{ visitor_id: v.id, unit_id: v.unit_id, resident_id: v.resident_id, guard_id: user!.id, event_type: "exit_recorded", gate_name: "Main Gate", visitor_name_snapshot: v.visitor_name }] as any);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gate_active"] }),
  });

  const tabs = [
    { key: "scan" as const, label: "Scan Pass", icon: QrCode },
    { key: "pending" as const, label: "Pending Walk-ins", icon: Clock },
    { key: "active" as const, label: "Active Visitors Inside", icon: DoorOpen },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl">Gate Console</h1>
      <div className="flex gap-2 border-b border-line">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`relative inline-flex items-center gap-2 px-4 py-2 text-sm ${tab === t.key ? "text-navy font-semibold" : "text-slate"}`}>
            <t.icon size={16} />{t.label}
            {tab === t.key && <motion.div layoutId="tab-underline" className="absolute left-0 right-0 -bottom-px h-0.5 bg-gold" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "scan" && (
          <motion.div key="scan" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="glass-card p-6">
              <label className="block text-xs font-bold text-slate mb-1">Pass code</label>
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6} className="w-full border border-line rounded-lg p-4 text-2xl font-mono tracking-widest bg-white mb-4" placeholder="ABC123" />
              <button onClick={verify} disabled={loading || code.length < 6} className="btn-primary w-full">{loading ? "Verifying…" : "Verify Pass"}</button>
            </div>
            {status === "granted" && result && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 bg-estate/10 border-estate shadow-[0_0_30px_rgba(37,132,90,0.25)] text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
                  <CheckCircle2 size={80} className="text-estate mx-auto mb-2" />
                </motion.div>
                <h2 className="text-3xl text-estate font-extrabold mb-2">ACCESS GRANTED</h2>
                <p className="text-lg font-semibold">{result.visitor_name}</p>
                <p className="text-slate">{result.units?.unit_code ?? "—"}</p>
                <button onClick={recordEntry} className="btn-primary mt-4 inline-flex items-center gap-2"><LogIn size={16} />Record Entry</button>
              </motion.div>
            )}
            {status === "denied" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, x: [0, -10, 10, -10, 10, 0] }} className="glass-card p-6 bg-signal/10 border-signal text-center">
                <h2 className="text-3xl text-signal font-extrabold mb-2">ACCESS DENIED</h2>
                <p className="text-slate">Pass not found, expired, or cancelled.</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {tab === "pending" && (
          <motion.div key="pending" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
            <h2 className="text-xl mb-4">Pending Walk-ins</h2>
            <div className="space-y-2">
              {(pending.data ?? []).map((v: any) => (
                <div key={v.id} className="flex items-center justify-between border-b border-line py-2">
                  <div><p className="font-medium">{v.visitor_name}</p><p className="text-slate text-xs">{v.units?.unit_code ?? "—"}</p></div>
                  <span className="badge-warning">{v.status}</span>
                </div>
              ))}
              {!(pending.data ?? []).length && <p className="text-slate text-sm">No pending walk-ins.</p>}
            </div>
          </motion.div>
        )}

        {tab === "active" && (
          <motion.div key="active" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
            <h2 className="text-xl mb-4">Active Visitors Inside</h2>
            <div className="space-y-2">
              {(active.data ?? []).map((v: any) => (
                <div key={v.id} className="flex items-center justify-between border-b border-line py-2">
                  <div><p className="font-medium">{v.visitor_name}</p><p className="text-slate text-xs">{v.units?.unit_code ?? "—"}</p></div>
                  <button onClick={() => recordExit.mutate(v)} className="btn-secondary text-xs inline-flex items-center gap-1"><LogOut size={14} />Record Exit</button>
                </div>
              ))}
              {!(active.data ?? []).length && <p className="text-slate text-sm">No active visitors.</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}