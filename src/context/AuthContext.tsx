import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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

function sameSession(a: Session | null, b: Session | null) {
  return (
    (a?.access_token ?? null) === (b?.access_token ?? null) &&
    (a?.expires_at ?? null) === (b?.expires_at ?? null) &&
    (a?.user?.id ?? null) === (b?.user?.id ?? null)
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const cachedSession = readCareerPilotSession()?.session ?? null;
    if (cachedSession) {
      setSession((current) => (sameSession(current, cachedSession) ? current : cachedSession));
      setLoading(false);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession((current) => (sameSession(current, s) ? current : s));
      setLoading(false);
      if (s) persistCareerPilotSession(s, { touchLastLogin: event === "SIGNED_IN" });
      if (event === "SIGNED_OUT") clearCareerPilotSession();
    });

    getHydratedCareerPilotSession().then((hydratedSession) => {
      if (!active) return;
      setSession((current) => (sameSession(current, hydratedSession) ? current : hydratedSession));
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
      clearCareerPilotSession();
      setSession(null);
      return supabase.auth.signOut();
  }, []);

  const value: AuthCtx = useMemo(() => ({
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session?.user,
    loading,
    signOut,
  }), [session, loading, signOut]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within <AuthProvider>");
  return v;
}
