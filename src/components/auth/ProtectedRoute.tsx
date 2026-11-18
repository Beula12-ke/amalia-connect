import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { AppRole } from "@/types";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow?: AppRole[];
}) {
  const { user, role, loading } = useAuth();
  const loc = useLocation();

  // CRITICAL FIX: Wait for Supabase to finish loading the session
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-ivory text-navy flex-col gap-4">
        <Loader2 className="animate-spin text-gold" size={40} />
        <div className="font-bold tracking-widest text-sm text-slate uppercase">Securing Session...</div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (allow && role && !allow.includes(role)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
}