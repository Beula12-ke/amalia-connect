import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-navy/10 rounded-full blur-3xl animate-float" />
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-navy hover:text-gold transition-colors font-medium z-50 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full shadow-sm"
      >
        <ArrowLeft size={18} />
        Back to Home
      </Link>
      <div className="hidden md:flex flex-col justify-between bg-navy text-white p-10 relative z-10">
        <div>
          <img src="/logo.png" alt="Amalia Connect Logo" className="w-56 mb-4 object-contain" />
          <div className="text-xs text-[#d9dce1] mt-1 tracking-widest">
            LIVE SECURE. CONNECT BETTER.
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-semibold max-w-sm leading-tight">
            Join your estate community.
          </h1>
          <p className="mt-4 text-sm text-[#d6dee7] max-w-md">
            Create an account to manage visitors, requests, and stay connected.
          </p>
        </div>
        <div className="text-xs text-[#aeb9c7]">Amalia Prestige Estate</div>
      </div>

      <div className="flex items-center justify-center p-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <form onSubmit={onSubmit} className="glass-card w-full p-6">
          <h2 className="text-xl mb-1">Create account</h2>
          <p className="text-slate text-sm mb-5">Register as a resident.</p>

          <label className="block text-xs font-bold text-slate mb-1">Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full border border-line rounded-lg p-3 mb-3 bg-white/70" />

          <label className="block text-xs font-bold text-slate mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-line rounded-lg p-3 mb-3 bg-white/70" />

          <label className="block text-xs font-bold text-slate mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-line rounded-lg p-3 mb-3 bg-white/70" />

          <label className="block text-xs font-bold text-slate mb-1">Unit code</label>
          <input value={unitCode} onChange={(e) => setUnitCode(e.target.value)} placeholder="A-001" className="w-full border border-line rounded-lg p-3 mb-4 bg-white/70" />

          {error && <div className="badge-danger mb-3">{error}</div>}
          {success && <div className="badge-success mb-3">Account created! Please sign in.</div>}

          <button disabled={loading} className="btn-primary w-full">
            {loading ? "Creating…" : "Create account"}
          </button>
          <p className="text-center text-sm text-slate mt-4">
            Already have an account? <Link to="/login" className="text-gold font-semibold">Sign in</Link> · <Link to="/visitor-portal" className="text-gold font-semibold">Visitor portal</Link>
          </p>
        </form>
        </motion.div>
      </div>
    </div>
  );
}