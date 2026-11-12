import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function AppShell() {
  const { profile, signOut } = useAuth();
  usePushNotifications();
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-navy text-white px-6 py-4 flex items-center justify-between">
        <img src="/logo.png" alt="Amalia Connect" className="h-12 object-contain" />
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden sm:inline text-[#d9dce1]">{profile?.full_name}</span>
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