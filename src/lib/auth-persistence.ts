import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const CAREERPILOT_SESSION_KEY = "careerpilot_session";
export const LAST_LOGIN_KEY = "last_login";

type StoredCareerPilotSession = {
  session: Session;
  user: Session["user"];
  saved_at: string;
  last_login: string;
};

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export function readCareerPilotSession(): StoredCareerPilotSession | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(CAREERPILOT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredCareerPilotSession>;
    if (!parsed.session?.access_token || !parsed.session.refresh_token || !parsed.session.user) return null;
    return parsed as StoredCareerPilotSession;
  } catch {
    return null;
  }
}

export function persistCareerPilotSession(session: Session, options: { touchLastLogin?: boolean } = {}) {
  if (!canUseStorage()) return;
  const now = new Date().toISOString();
  const previous = readCareerPilotSession();
  const lastLogin = options.touchLastLogin ? now : previous?.last_login ?? now;
  const payload: StoredCareerPilotSession = {
    session,
    user: session.user,
    saved_at: now,
    last_login: lastLogin,
  };
  window.localStorage.setItem(CAREERPILOT_SESSION_KEY, JSON.stringify(payload));
  window.localStorage.setItem(LAST_LOGIN_KEY, lastLogin);
}

export function clearCareerPilotSession() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(CAREERPILOT_SESSION_KEY);
}

export async function getHydratedCareerPilotSession(): Promise<Session | null> {
  if (!canUseStorage()) return null;

  const { data } = await supabase.auth.getSession();
  if (data.session) {
    persistCareerPilotSession(data.session);
    return data.session;
  }

  const stored = readCareerPilotSession();
  if (!stored?.session?.access_token || !stored.session.refresh_token) {
    clearCareerPilotSession();
    return null;
  }

  const { data: restored, error } = await supabase.auth.setSession({
    access_token: stored.session.access_token,
    refresh_token: stored.session.refresh_token,
  });

  if (error || !restored.session) {
    clearCareerPilotSession();
    return null;
  }

  persistCareerPilotSession(restored.session);
  return restored.session;
}