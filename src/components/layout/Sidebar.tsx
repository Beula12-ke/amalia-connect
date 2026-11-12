import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Users, QrCode, Megaphone, Wrench, Siren, Shield, UserCog, Eye } from "lucide-react";

const NAV: Record<string, { to: string; label: string; icon: any }[]> = {
  resident: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/visitors", label: "My Visitors", icon: Users },
    { to: "/visitors/new", label: "Register Visitor", icon: QrCode },
    { to: "/announcements", label: "Announcements", icon: Megaphone },
    { to: "/services", label: "Service Requests", icon: Wrench },
    { to: "/emergency", label: "Emergency", icon: Siren },
  ],
  security: [
    { to: "/gate", label: "Gate Console", icon: Shield },
  ],
  estate_manager: [
    { to: "/management", label: "Overview", icon: LayoutDashboard },
    { to: "/management/announcements", label: "Announcements", icon: Megaphone },
    { to: "/management/services", label: "Service Desk", icon: Wrench },
    { to: "/management/visitors", label: "Visitor Oversight", icon: Eye },
  ],
  estate_admin: [
    { to: "/management", label: "Overview", icon: LayoutDashboard },
    { to: "/management/announcements", label: "Announcements", icon: Megaphone },
    { to: "/management/services", label: "Service Desk", icon: Wrench },
    { to: "/management/visitors", label: "Visitor Oversight", icon: Eye },
    { to: "/management/users", label: "User Management", icon: UserCog },
  ],
};

export function Sidebar() {
  const { role } = useAuth();
  const items = role ? NAV[role] ?? [] : [];

  return (
    <aside className="w-[230px] shrink-0 bg-gradient-to-b from-[#142c46] to-[#0a1524] text-[#dce4ed] p-3.5">
      <div className="px-2.5 mb-3 text-[11px] uppercase tracking-widest text-[#aeb9c7]">
        {role?.replace("_", " ") ?? "Menu"}
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end className={({ isActive }) => clsx("rounded-lg", isActive ? "bg-[#29435f] text-white" : "")}>
            {({ isActive }) => (
              <motion.div whileHover={{ x: 4 }} className={clsx("px-3 py-2.5 rounded-lg text-sm transition flex items-center gap-2", isActive ? "text-white" : "hover:bg-[#29435f]/60")}>
                <item.icon size={16} className="opacity-80" />
                {item.label}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}