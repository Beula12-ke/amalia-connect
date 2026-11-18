import { motion } from "framer-motion";
import { Clock, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function PendingApproval() {
  const { signOut, profile } = useAuth();

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-ivory relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold/20 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-navy/10 rounded-full blur-3xl animate-float pointer-events-none" />

      {/* LEFT PANEL */}
      <div
        className="hidden md:flex flex-col bg-navy text-white p-10 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(16, 36, 58, 0.85), rgba(16, 36, 58, 0.95)), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 flex flex-col justify-between flex-1 w-full">
          <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-gold/20 blur-3xl animate-float pointer-events-none" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl animate-float-slow pointer-events-none" />

          <div className="relative z-10">
            <img src="/logo.png" alt="Amalia Connect Logo" className="w-48 object-contain mb-4 drop-shadow-md" />
            <div className="text-xs text-[#d9dce1] mt-1 tracking-widest">
              LIVE SECURE. CONNECT BETTER.
            </div>
          </div>

          <div className="relative z-10">
            <h1 className="text-3xl font-semibold max-w-sm leading-tight">
              Application Under Review
            </h1>
            <p className="mt-4 text-sm text-[#d6dee7] max-w-md">
              Your service provider application has been received and is pending admin verification.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 max-w-sm bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl"
            >
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-white/90">
                  <Shield size={16} className="text-gold shrink-0" /> Background verification
                </li>
                <li className="flex items-center gap-2 text-white/90">
                  <Shield size={16} className="text-gold shrink-0" /> Category validation
                </li>
                <li className="flex items-center gap-2 text-white/90">
                  <Clock size={16} className="text-gold shrink-0" /> Typically 24-48 hours
                </li>
              </ul>
            </motion.div>
          </div>

          <div className="relative z-10 text-xs text-[#aeb9c7]">Amalia Prestige Estate</div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-sm"
        >
          <div className="glass-card w-full p-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-gold/10 text-gold p-4 rounded-full inline-flex mb-6"
            >
              <Clock size={40} />
            </motion.div>

            <h2 className="text-2xl font-bold text-navy mb-3">Account Pending Approval</h2>
            <p className="text-slate text-lg mb-6 max-w-md mx-auto">
              Hello <strong>{profile?.full_name || "there"}</strong>, your application has been received and is currently under review by our estate administration team.
            </p>

            <div className="bg-ivory/50 rounded-xl p-6 mb-6 border border-line">
              <div className="flex items-center gap-3 text-slate mb-4">
                <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                  <Shield size={20} />
                </div>
                <div>
                  <div className="font-bold text-navy">What happens next?</div>
                  <div className="text-sm text-slate">Admin will verify your credentials and service category.</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-500">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="font-bold text-navy">Timeline</div>
                  <div className="text-sm text-slate">Typically 24-48 hours during business days.</div>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate/60 mb-6">
              You will receive an email notification once your account is approved. You can then sign in to access your provider dashboard.
            </p>

            <button
              onClick={signOut}
              className="btn-secondary w-full inline-flex items-center justify-center gap-2"
            >
              <Clock size={18} /> Sign Out & Wait for Email
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}