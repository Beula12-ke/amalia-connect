import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "./NotificationBell";

export function AppShell() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-navy text-white px-6 py-4 flex items-center justify-between">
        {/* Refined Logo: Blend screen applied to remove dark background and enhance gold/ivory visibility */}
        <img src="/logo.png" alt="Amalia Connect" className="h-14 md:h-16 w-auto object-cover object-center mix-blend-screen scale-[1.15] drop-shadow-[0_0_15px_rgba(198,161,91,0.3)] transition-transform hover:scale-[1.2]" loading="lazy" />
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden sm:inline text-[#d9dce1]">{profile?.full_name}</span>
          <NotificationBell />
          <button onClick={signOut} className="btn-secondary text-navy">Sign out</button>
        </div>
      </header>
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-7 max-w-[1400px] w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}