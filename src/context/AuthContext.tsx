import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  clearCareerPilotSession,
  getHydratedCareerPilotSession,
  persistCareerPilotSession,
  readCareerPilotSession,
} from "@/lib/auth-persistence";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signOut: () => Promise<{ error: AuthError | null } | void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readCareerPilotSession()?.session ?? null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setLoading(false);
      if (s) persistCareerPilotSession(s, { touchLastLogin: event === "SIGNED_IN" });
      if (event === "SIGNED_OUT") clearCareerPilotSession();
    });

    getHydratedCareerPilotSession().then((hydratedSession) => {
      if (!active) return;
      setSession(hydratedSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthCtx = {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session?.user,
    loading,
    signOut: async () => {
      clearCareerPilotSession();
      setSession(null);
      return supabase.auth.signOut();
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within <AuthProvider>");
  return v;
}
