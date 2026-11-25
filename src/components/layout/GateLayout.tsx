import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function GateLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060c14] relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <motion.div className="absolute w-96 h-96 rounded-full bg-cyan-500/20 blur-[120px]" animate={{ x: [0, 100, 0], y: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity }} />
      <motion.div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-gold/20 blur-[120px]" animate={{ x: [0, -100, 0], y: [0, -50, 0] }} transition={{ duration: 25, repeat: Infinity }} />

      <header className="relative z-10 bg-white/5 backdrop-blur-md border-b border-white/10 text-white flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Amalia Connect" className="h-8 object-contain" />
          <span className="font-bold tracking-wide">Security Terminal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-slate-300">{time}</span>
          <button onClick={handleSignOut} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>
      <main className="relative z-10 flex-1 w-full px-6 py-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="w-full">
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}