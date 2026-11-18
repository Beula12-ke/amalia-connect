import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const SERVICE_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Landscaping",
  "Security",
  "Other"
];

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

export default function ProviderApply() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const finalCategory = category === "Other" ? customCategory : category;
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: "service_provider", service_category: finalCategory } },
    });
    if (signUpError) { setLoading(false); return setError(signUpError.message); }
    setLoading(false);
    setSuccess(true);
    setTimeout(() => nav("/login"), 3000);
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
          <div className="absolute top-1/3 left-1/3 h-64 w-64 rounded-full bg-gold/10 blur-3xl animate-pulse pointer-events-none" />

          <div className="relative z-10">
            <img src="/logo.png" alt="Amalia Connect Logo" className="w-48 object-contain mb-4 drop-shadow-md" />
            <div className="text-xs text-[#d9dce1] mt-1 tracking-widest">
              LIVE SECURE. CONNECT BETTER.
            </div>
          </div>

          <div className="relative z-10">
            <h1 className="text-3xl font-semibold max-w-sm leading-tight">
              Join as a Service Provider
            </h1>
            <p className="mt-4 text-sm text-[#d6dee7] max-w-md">
              Apply to become a verified service provider for Amalia Prestige Estate. Get connected with residents who need your expertise.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 max-w-sm bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl"
            >
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-white/90">
                  <CheckCircle2 size={16} className="text-gold shrink-0" /> Steady stream of work orders
                </li>
                <li className="flex items-center gap-2 text-white/90">
                  <CheckCircle2 size={16} className="text-gold shrink-0" /> Mobile-friendly dashboard
                </li>
                <li className="flex items-center gap-2 text-white/90">
                  <CheckCircle2 size={16} className="text-gold shrink-0" /> Transparent payment tracking
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
          <AnimatePresence mode="wait">
            {!success && (
              <motion.form
                onSubmit={onSubmit}
                initial="hidden"
                animate="show"
                variants={containerVariants}
                className="glass-card w-full p-6"
              >
                <motion.div variants={itemVariants}>
                  <h2 className="text-xl mb-1">Service Provider Application</h2>
                  <p className="text-slate text-sm mb-5">Fill in your details to apply. Admin approval required.</p>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-bold text-slate mb-1">Full Name</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="John Doe"
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
                  <label className="block text-xs font-bold text-slate mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+254 7XX XXX XXX"
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
                  <label className="block text-xs font-bold text-slate mb-1">Service Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="">Select a category</option>
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {category === "Other" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 overflow-hidden"
                    >
                      <label className="block text-xs font-bold text-slate mb-1">Please specify your service</label>
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        required
                        placeholder="e.g., Pool Maintenance, Pest Control..."
                        className="w-full border border-line rounded-lg p-3 bg-white focus:ring-2 focus:ring-gold outline-none transition-all"
                      />
                    </motion.div>
                  )}
                </motion.div>

                {error && (
                  <motion.div variants={itemVariants} className="badge-danger mb-3">
                    {error}
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
                  {loading ? "Submitting…" : "Submit Application"}
                </motion.button>

                <motion.p variants={itemVariants} className="text-center text-sm text-slate mt-4">
                  Already have an account? <Link to="/login" className="text-gold font-semibold">Sign in</Link>
                </motion.p>
              </motion.form>
            )}

            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card w-full p-10 text-center"
              >
                <div className="bg-estate/20 p-3 rounded-full text-estate inline-flex mb-6">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-bold text-navy mb-3">Application Received</h2>
                <p className="text-slate text-lg mb-6 max-w-md mx-auto">
                  Your account is pending Admin approval. You will be notified once vetted.
                </p>
                <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                  <ArrowLeft size={18} /> Back to Login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}