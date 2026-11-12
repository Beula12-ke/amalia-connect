import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function EmergencyHelp() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [alertType, setAlertType] = useState("medical");
  const [desc, setDesc] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const { data: ru } = await (supabase.from("resident_units") as any).select("unit_id").eq("resident_id", user!.id).single();
    await (supabase.from("emergency_alerts") as any).insert([{
      raised_by: user!.id,
      unit_id: ru?.unit_id,
      alert_type: alertType,
      description: desc,
      status: "active",
    }]);
    setLoading(false);
    setDone(true);
    setOpen(false);
  }

  return (
    <div className="min-h-[60vh] grid place-items-center">
      {done ? (
        <div className="card p-8 text-center">
          <h1 className="text-2xl text-estate mb-2">Security has been notified.</h1>
          <p className="text-slate">Stay safe. Help is on the way.</p>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="bg-signal text-white text-2xl font-extrabold px-10 py-8 rounded-2xl shadow-lg">
          🚨 RAISE EMERGENCY ALERT
        </button>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-xl mb-4">Emergency details</h2>
            <label className="block text-xs font-bold text-slate mb-1">Alert type</label>
            <select value={alertType} onChange={(e) => setAlertType(e.target.value)} className="w-full border border-line rounded-lg p-3 bg-white mb-3">
              <option value="medical">Medical</option>
              <option value="fire">Fire</option>
              <option value="intrusion">Intrusion</option>
              <option value="safety">Safety</option>
            </select>
            <label className="block text-xs font-bold text-slate mb-1">Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full border border-line rounded-lg p-3 bg-white mb-4" rows={3} />
            <div className="flex gap-3">
              <button onClick={submit} disabled={loading} className="btn-primary flex-1">{loading ? "Sending…" : "Send alert"}</button>
              <button onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}