import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Ticket, ShieldAlert, ScanLine, Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";

type Step = "welcome" | "loading" | "found" | "notfound";

export default function VisitorPortal() {
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>("welcome");
  const [visitor, setVisitor] = useState<any>(null);

  async function find() {
    const clean = code.trim().toUpperCase();
    if (clean.length < 6) return;
    setStep("loading");
    const started = Date.now();
    const { data } = await supabase
      .from("visitors")
      .select("*, units(unit_code)")
      .eq("pass_code", clean)
      .maybeSingle();
    const elapsed = Date.now() - started;
    if (elapsed < 1000) await new Promise((r) => setTimeout(r, 1000 - elapsed));
    if (!data) {
      setVisitor(null);
      setStep("notfound");
      return;
    }
    setVisitor(data);
    setStep("found");
  }

  function reset() {
    setVisitor(null);
    setCode("");
    setStep("welcome");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-navy bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1c3858] via-navy to-[#0a1524] text-white">
      {/* Floating glowing orbs */}
      <motion.div
        className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-0 right-0 h-[34rem] w-[34rem] rounded-full bg-gold/10 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <Link
        to="/"
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white/80 backdrop-blur-md border border-white/15 hover:text-gold transition-colors font-medium"
      >
        <ArrowLeft size={18} /> Back to Home
      </Link>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === "welcome" && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-2xl backdrop-blur-xl"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 border border-gold/30">
                  <Ticket size={32} className="text-gold" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-3">
                  Welcome to <span className="text-gold">Amalia Estate</span>
                </h1>
                <p className="text-white/70 mb-8">
                  Enter your 6-character pass code below to retrieve your digital entry pass.
                </p>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && find()}
                  maxLength={6}
                  placeholder="ABC123"
                  className="w-full bg-transparent border-b-2 border-gold/50 focus:border-gold text-white placeholder-white/20 text-3xl text-center tracking-[0.5em] font-mono uppercase py-3 mb-8 outline-none transition-colors"
                />
                <motion.button
                  onClick={find}
                  disabled={code.trim().length < 6}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-yellow-300 px-6 py-4 text-base font-bold text-navy shadow-lg transition disabled:opacity-50"
                >
                  <Sparkles size={18} /> Find My Pass
                </motion.button>
              </motion.div>
            )}

            {step === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center shadow-2xl backdrop-blur-xl"
              >
                <Loader2 size={56} className="mx-auto mb-5 text-gold animate-spin" />
                <p className="text-white/80 text-lg font-medium">Searching for your pass…</p>
                <p className="text-white/40 text-sm mt-1">Securing your digital entry</p>
              </motion.div>
            )}

            {step === "notfound" && (
              <motion.div
                key="notfound"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl border border-signal/50 bg-signal/10 p-8 text-center shadow-2xl backdrop-blur-xl"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-signal/20 border border-signal/40">
                  <ShieldAlert size={36} className="text-signal" />
                </div>
                <p className="text-lg font-semibold">Invalid or Expired Pass. Please contact your host.</p>
                <button onClick={reset} className="btn-secondary w-full mt-6">
                  Try Again
                </button>
              </motion.div>
            )}

            {step === "found" && visitor && (
              <motion.div
                key="found"
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -40 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
              >
                <div className="relative w-full overflow-hidden rounded-3xl bg-white text-navy shadow-2xl">
                  {/* Top half — Navy */}
                  <div className="relative bg-navy px-8 py-8 text-center">
                    {/* Refined Logo: Blend screen applied to remove dark background and enhance gold/ivory visibility */}
                    <img src="/logo.png" alt="Amalia" className="h-12 w-auto object-contain drop-shadow-sm" />
                    <p className="text-xs tracking-[0.4em] text-white/60">ESTATE VISITOR PASS</p>
                  </div>

                  {/* Perforated cutout line */}
                  <div className="relative">
                    <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-navy" />
                    <div className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-navy" />
                    <div className="border-t-2 border-dashed border-line" />
                  </div>

                  {/* Bottom half — White */}
                  <div className="px-8 py-8 text-center">
                    <p className="text-2xl font-extrabold">{visitor.visitor_name}</p>
                    <p className="text-slate text-sm mt-1">Unit {visitor.units?.unit_code ?? "—"}</p>
                    <p className="text-slate text-xs mt-1">
                      {visitor.expected_at ? format(new Date(visitor.expected_at), "MMM d, yyyy 'at' h:mm a") : "—"}
                    </p>
                    <div className="mx-auto mt-5 grid w-fit place-items-center rounded-xl border border-line bg-white p-3">
                      <QRCodeSVG value={visitor.pass_code} size={180} />
                    </div>
                    <p className="mt-3 font-mono tracking-[0.35em] text-lg">{visitor.pass_code}</p>
                  </div>

                  {/* Floating green stamp */}
                  <motion.div
                    initial={{ opacity: 0, scale: 1.6, rotate: -30 }}
                    animate={{ opacity: 1, scale: 1, rotate: -12 }}
                    transition={{ delay: 0.45, type: "spring", stiffness: 200, damping: 12 }}
                    className="absolute bottom-8 right-4 rounded-lg border-2 border-estate px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-estate shadow-[0_0_20px_rgba(37,132,90,0.45)]"
                  >
                    Valid for Entry
                  </motion.div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-gold">
                  <ScanLine size={20} />
                  <span className="text-sm font-semibold tracking-wide">Scan at Gate</span>
                </div>

                <button onClick={reset} className="btn-secondary w-full mt-6">
                  Search Another Pass
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}