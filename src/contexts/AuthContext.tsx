import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { AppRole, Profile } from "@/types";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  session: null, user: null, profile: null, role: null, loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false); // Only stop loading if there is DEFINITELY no session
    });

    // 2. Listen for login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const query = supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single() as unknown as Promise<{ data: Profile | null; error: any }>;

    query
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) console.error("Profile Fetch Error:", error);
        setProfile((data as unknown as Profile) || null);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Profile Exception:", err);
        setProfile(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [session?.user?.id]);

  const value = useMemo<AuthState>(() => ({
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.role ?? null,
    loading,
    signOut: async () => { await supabase.auth.signOut(); },
  }), [session, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }