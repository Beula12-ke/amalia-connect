import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { AppRole } from "@/types";

export function ProtectedRoute({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow?: AppRole[];
}) {
  const { user, role, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-ivory text-slate">Loading…</div>;
  }
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (allow && role && !allow.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}