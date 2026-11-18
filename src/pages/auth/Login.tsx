import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type ProfileRole = Pick<Database["public"]["Tables"]["profiles"]["Row"], "role">;

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
    
    // 1. Sign in
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return setError(error.message);
    }
    
    // 2. Fetch the role to redirect correctly
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await (supabase.from('profiles').select('role').eq('id', user.id).single() as any);
      setLoading(false);
      
      // 3. Route based on role
      if (profile?.role === 'estate_admin' || profile?.role === 'estate_manager') {
        nav('/management');
      } else if (profile?.role === 'security') {
        nav('/gate');
      } else if (profile?.role === 'service_provider') {
        nav('/provider');
      } else {
        nav('/dashboard');
      }
    } else {
      setLoading(false);
      nav('/dashboard');
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-ivory relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-navy/10 rounded-full blur-3xl animate-float" />
      {/* LEFT PANEL */}
      <div 
        className="hidden md:flex flex-col justify-between text-white p-10 relative overflow-hidden"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(16, 36, 58, 0.85), rgba(16, 36, 58, 0.95)), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Floating Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold/20 rounded-full blur-[100px] animate-float z-0"></div>
        
        {/* Back to Home Button - Moved to Top Right to avoid overlapping the logo */}
        <Link to="/" className="absolute top-8 right-8 text-white/70 hover:text-white flex items-center gap-2 text-sm font-medium z-50 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md transition-all">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="relative z-10 mt-12">
          {/* Standard Logo Placement */}
          <img 
            src="/logo.png" 
            alt="Amalia Connect Logo" 
            className="w-48 object-contain mb-4 drop-shadow-md" 
          />
          <div className="text-xs text-[#d9dce1] tracking-widest">
            LIVE SECURE. CONNECT BETTER.
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-semibold max-w-sm leading-tight">
            Smart estate management for a safer, better community.
          </h1>
          <p className="mt-4 text-sm text-[#d6dee7] max-w-md">
            Pre-authorise visitors, verify at the gate, and stay connected with your estate team.
          </p>
        </div>
        <div className="relative z-10 text-xs text-[#aeb9c7]">
          Amalia Prestige Estate
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