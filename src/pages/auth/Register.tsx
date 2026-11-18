import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const inputClass =
  "w-full border border-line rounded-lg p-3 mb-3 bg-white/70 focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (signUpError) { setLoading(false); return setError(signUpError.message); }

    const userId = data.user?.id;
    if (userId && unitCode) {
      const { data: unit } = await (supabase.from("units") as any).select("id").eq("unit_code", unitCode).single();
      if (unit) {
        await (supabase.from("resident_units") as any).insert([{ resident_id: userId, unit_id: unit.id, relationship: "owner" }]);
      }
    }

    setLoading(false);
    setSuccess(true);
    setTimeout(() => nav("/login"), 1500);
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-ivory relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold/20 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-navy/10 rounded-full blur-3xl animate-float pointer-events-none" />

      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-navy hover:text-gold transition-colors font-medium z-50 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full shadow-sm"
      >
        <ArrowLeft size={18} />
        Back to Home
      </Link>

      {/* LEFT PANEL — The Navy Side */}
      <div
        className="hidden md:flex flex-col bg-navy text-white p-10 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(16, 36, 58, 0.85), rgba(16, 36, 58, 0.95)), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 flex flex-col justify-between flex-1 w-full">
          {/* Floating gradient orbs */}
          <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-gold/20 blur-3xl animate-float pointer-events-none" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl animate-float-slow pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 h-64 w-64 rounded-full bg-gold/10 blur-3xl animate-pulse pointer-events-none" />

        <div className="relative z-10">
          {/* Refined Logo: Blend screen applied to remove dark background and enhance gold/ivory visibility */}
          <img src="/logo.png" alt="Amalia Connect Logo" className="h-14 md:h-16 w-auto object-cover object-center mix-blend-screen scale-[1.15] drop-shadow-[0_0_15px_rgba(198,161,91,0.3)] transition-transform hover:scale-[1.2]" />
          <div className="text-xs text-[#d9dce1] mt-1 tracking-widest">
            LIVE SECURE. CONNECT BETTER.
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-semibold max-w-sm leading-tight">
            Join your estate community.
          </h1>
          <p className="mt-4 text-sm text-[#d6dee7] max-w-md">
            Create an account to manage visitors, requests, and stay connected.
          </p>

          {/* Floating UI checklist card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 max-w-sm bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl"
          >
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-white/90">
                <Check size={16} className="text-gold shrink-0" /> Pre-authorize visitors
              </li>
              <li className="flex items-center gap-2 text-white/90">
                <Check size={16} className="text-gold shrink-0" /> Real-time security alerts
              </li>
              <li className="flex items-center gap-2 text-white/90">
                <Check size={16} className="text-gold shrink-0" /> Community updates
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="relative z-10 text-xs text-[#aeb9c7]">Amalia Prestige Estate</div>
        </div>
      </div>

      {/* RIGHT PANEL — The Form Side */}
      <div className="flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-sm"
        >
          <motion.form
            onSubmit={onSubmit}
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="glass-card w-full p-6"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-xl mb-1">Create account</h2>
              <p className="text-slate text-sm mb-5">Register as a resident.</p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-xs font-bold text-slate mb-1">Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Jane Wanjiku"
                className={inputClass}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-xs font-bold text-slate mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={inputClass}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-xs font-bold text-slate mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-navy transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-xs font-bold text-slate mb-1">Unit code</label>
              <input
                value={unitCode}
                onChange={(e) => setUnitCode(e.target.value.toUpperCase())}
                placeholder="e.g., A-001"
                className={inputClass}
              />
            </motion.div>

            {error && (
              <motion.div variants={itemVariants} className="badge-danger mb-3">
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div variants={itemVariants} className="badge-success mb-3">
                Account created! Please sign in.
              </motion.div>
            )}

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Creating…" : "Create account"}
            </motion.button>

            <motion.p variants={itemVariants} className="text-center text-sm text-slate mt-4">
              Already have an account? <Link to="/login" className="text-gold font-semibold">Sign in</Link> · <Link to="/visitor-portal" className="text-gold font-semibold">Visitor portal</Link>
            </motion.p>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}