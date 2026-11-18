import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: { pathname: string } } };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    nav(loc.state?.from?.pathname ?? "/dashboard", { replace: true });
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
      <div
        className="hidden md:flex flex-col bg-navy text-white p-10 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(16, 36, 58, 0.85), rgba(16, 36, 58, 0.95)), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 flex flex-col justify-between flex-1 w-full">
          <div>
            {/* Refined Logo: Blend screen applied to remove dark background and enhance gold/ivory visibility */}
            <img src="/logo.png" alt="Amalia Connect Logo" className="h-14 md:h-16 w-auto object-cover object-center mix-blend-screen scale-[1.15] drop-shadow-[0_0_15px_rgba(198,161,91,0.3)] transition-transform hover:scale-[1.2]" />
            <div className="text-xs text-[#d9dce1] mt-1 tracking-widest">
              LIVE SECURE. CONNECT BETTER.
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-semibold max-w-sm leading-tight">
              Smart estate management for a safer, better community.
            </h1>
            <p className="mt-4 text-sm text-[#d6dee7] max-w-md">
              Pre-authorise visitors, verify at the gate, and stay connected with your estate team.
            </p>
          </div>
          <div className="text-xs text-[#aeb9c7]">Amalia Prestige Estate</div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <form onSubmit={onSubmit} className="glass-card w-full p-6">
          <h2 className="text-xl mb-1">Sign in</h2>
          <p className="text-slate text-sm mb-5">Welcome back to Amalia Connect.</p>

          <label className="block text-xs font-bold text-slate mb-1">Email</label>
          <input
            type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-line rounded-lg p-3 mb-3 bg-white/70"
            placeholder="you@example.com"
          />

          <label className="block text-xs font-bold text-slate mb-1">Password</label>
          <input
            type="password" required value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-line rounded-lg p-3 mb-4 bg-white/70"
            placeholder="••••••••"
          />

          {error && <div className="badge-danger mb-3">{error}</div>}

          <button disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-center text-sm text-slate mt-4">
            Don't have an account? <Link to="/register" className="text-gold font-semibold">Create one</Link> · <Link to="/visitor-portal" className="text-gold font-semibold">Visitor portal</Link>
          </p>
        </form>
        </motion.div>
      </div>
    </div>
  );
}