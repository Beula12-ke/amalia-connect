import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Users, Shield, Settings, QrCode, Wrench, Bell, ShieldAlert, FileClock, Building2 } from "lucide-react";

const NAV: Record<string, { to: string; label: string; icon: any }[]> = {
  resident: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/visitors", label: "My Visitors", icon: Users },
    { to: "/visitors/new", label: "Register Visitor", icon: QrCode },
    { to: "/services", label: "Service Requests", icon: Wrench },
    { to: "/announcements", label: "Announcements", icon: Bell },
    { to: "/emergency", label: "Emergency Help", icon: ShieldAlert },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  security: [
    { to: "/gate", label: "Gate Console", icon: Shield },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  estate_manager: [
    { to: "/management", label: "Command Center", icon: LayoutDashboard },
    { to: "/management/visitors", label: "Visitor Oversight", icon: Users },
    { to: "/management/services", label: "Service Desk", icon: Wrench },
    { to: "/management/users", label: "User Management", icon: Users },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  estate_admin: [
    { to: "/management", label: "Command Center", icon: LayoutDashboard },
    { to: "/management/users", label: "User Management", icon: Users },
    { to: "/management/units", label: "Units & Blocks", icon: Building2 },
    { to: "/management/visitors", label: "Visitor Oversight", icon: Users },
    { to: "/management/logs", label: "Audit Logs", icon: FileClock },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  service_provider: [
    { to: "/provider", label: "My Dashboard", icon: Wrench },
    { to: "/settings", label: "Settings", icon: Settings },
  ]
};

export function Sidebar() {
  const { role } = useAuth();
  const items = role ? NAV[role] ?? [] : [];

  return (
    <aside className="w-[250px] shrink-0 bg-[#142c46] text-[#dce4ed] p-4 min-h-[calc(100vh-80px)]">
      <div className="px-3 mb-4 text-[11px] uppercase tracking-widest text-[#aeb9c7] font-bold">
        {role?.replace("_", " ") ?? "Menu"}
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              clsx(
                "px-3 py-3 rounded-lg text-sm font-medium transition flex items-center gap-3",
                isActive ? "bg-[#29435f] text-white shadow-sm" : "hover:bg-[#29435f]/60 hover:text-white"
              )
            }
          >
            <item.icon size={18} className="opacity-80" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}