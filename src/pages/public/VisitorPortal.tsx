import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Ticket, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";

export default function VisitorPortal() {
  const [code, setCode] = useState("");
  const [visitor, setVisitor] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function find() {
    setLoading(true); setError(""); setVisitor(null);
    const { data } = await supabase.from("visitors").select("*, units(unit_code)").eq("pass_code", code.trim().toUpperCase()).single();
    setLoading(false);
    if (!data) { setError("Invalid or Expired Pass. Please contact the estate management."); return; }
    setVisitor(data);
  }

  function reset() { setVisitor(null); setError(""); setCode(""); }

  return (
    <div className="min-h-screen bg-navy bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1c3858] via-navy to-[#0a1524] text-white p-6">
      <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6">
        <ArrowLeft size={18} /> Back to Home
      </Link>

      <div className="grid place-items-center">
        <AnimatePresence mode="wait">
          {!visitor && !error && (
            <motion.div key="search" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 text-center">
              <Ticket size={48} className="mx-auto mb-4 text-gold" />
              <h1 className="text-2xl font-bold mb-2">Find Your Digital Pass</h1>
              <p className="text-white/70 text-sm mb-6">Enter your 6-character pass code.</p>
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6} className="w-full text-center text-2xl tracking-widest uppercase bg-white/10 border border-white/20 rounded-lg p-4 mb-4 text-white placeholder-white/40" placeholder="ABC123" />
              <button onClick={find} disabled={loading || code.length < 6} className="btn-primary w-full">{loading ? "Searching…" : "Find Pass"}</button>
            </motion.div>
          )}

          {error && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-signal/20 border border-signal text-signal rounded-2xl p-6 text-center">
              <ShieldAlert size={40} className="mx-auto mb-3" />
              <p>{error}</p>
              <button onClick={reset} className="btn-secondary mt-4">Try Again</button>
            </motion.div>
          )}

          {visitor && (
            <motion.div key="ticket" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
              <div className="bg-white text-navy rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-navy text-white p-6 text-center">
                  <img src="/logo.png" alt="Amalia" className="h-8 mx-auto mb-2 object-contain" />
                  <p className="text-xs tracking-widest text-[#d9dce1]">VISITOR PASS</p>
                  <p className="text-2xl font-extrabold mt-1">{visitor.units?.unit_code ?? "—"}</p>
                </div>
                <div className="border-t-2 border-dashed border-line" />
                <div className="p-6 text-center">
                  <p className="text-xl font-bold mb-1">{visitor.visitor_name}</p>
                  <span className="badge-success mb-4 inline-block">Valid Entry</span>
                  <p className="text-slate text-sm mb-4">
                    {visitor.expected_at ? format(new Date(visitor.expected_at), "MMM d, yyyy 'at' h:mm a") : "—"}
                  </p>
                  <div className="grid place-items-center bg-white p-3 rounded-lg border border-line">
                    <QRCodeSVG value={visitor.pass_code} size={160} />
                  </div>
                  <p className="mt-3 font-mono tracking-widest text-lg">{visitor.pass_code}</p>
                </div>
              </div>
              <button onClick={reset} className="btn-secondary w-full mt-4">Search Another Pass</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}