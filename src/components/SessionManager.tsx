import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { persistCareerPilotSession, clearCareerPilotSession, CAREERPILOT_SESSION_KEY } from "@/lib/auth-persistence";
import { toast } from "sonner";

// Sign out after 30 minutes of inactivity; warn 60s before.
const IDLE_MS = 30 * 60 * 1000;
const WARN_MS = 60 * 1000;
// Proactively refresh the access token when it's within this window of expiring.
const REFRESH_LEAD_MS = 5 * 60 * 1000;
const IDLE_KEY = "cp_last_activity";

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "visibilitychange",
];

export function SessionManager() {
  const { session, signOut } = useAuth();
  const [warnOpen, setWarnOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WARN_MS / 1000);
  const idleTimerRef = useRef<number | null>(null);
  const warnTimerRef = useRef<number | null>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const isAuthed = !!session;

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    if (warnTimerRef.current) window.clearTimeout(warnTimerRef.current);
    if (countdownRef.current) window.clearInterval(countdownRef.current);
    idleTimerRef.current = null;
    warnTimerRef.current = null;
    countdownRef.current = null;
  }, []);

  const doSignOut = useCallback(async (reason: "idle" | "expired" | "manual") => {
    clearTimers();
    setWarnOpen(false);
    clearCareerPilotSession();
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    await signOut().catch(() => {});
    if (reason === "idle") toast.info("Signed out due to inactivity");
    else if (reason === "expired") toast.info("Your session expired — please sign in again");
  }, [clearTimers, signOut]);

  const scheduleIdle = useCallback(() => {
    clearTimers();
    if (!isAuthed) return;
    try { localStorage.setItem(IDLE_KEY, String(Date.now())); } catch { /* ignore */ }
    warnTimerRef.current = window.setTimeout(() => {
      setSecondsLeft(WARN_MS / 1000);
      setWarnOpen(true);
      countdownRef.current = window.setInterval(() => {
        setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
    }, IDLE_MS - WARN_MS);
    idleTimerRef.current = window.setTimeout(() => {
      doSignOut("idle");
    }, IDLE_MS);
  }, [clearTimers, doSignOut, isAuthed]);

  // Activity listeners → reset idle timer.
  useEffect(() => {
    if (!isAuthed) return;
    scheduleIdle();
    const onActivity = () => {
      if (warnOpen) return; // require explicit "Stay signed in" once warned
      scheduleIdle();
    };
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    return () => {
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, warnOpen]);

  // Proactive token refresh: schedule based on session.expires_at, and refresh on focus/online.
  useEffect(() => {
    if (!isAuthed || !session) return;

    const scheduleRefresh = () => {
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
      const expiresAtMs = (session.expires_at ?? 0) * 1000;
      const delay = Math.max(0, expiresAtMs - Date.now() - REFRESH_LEAD_MS);
      refreshTimerRef.current = window.setTimeout(refreshNow, delay || 5_000);
    };

    const refreshNow = async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error || !data.session) {
          // Refresh token invalid/expired → sign out cleanly.
          await doSignOut("expired");
          return;
        }
        persistCareerPilotSession(data.session);
      } catch {
        // network hiccup — try again on next focus/online
      }
    };

    const onFocus = () => { refreshNow(); };
    const onOnline = () => { refreshNow(); };

    scheduleRefresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);
    return () => {
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
    };
  }, [isAuthed, session, doSignOut]);

  // Cross-tab sync: react to storage changes so sign-in/out propagates instantly.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      // Supabase writes its session under a key like sb-<ref>-auth-token
      const isSupabaseKey = e.key.startsWith("sb-") && e.key.endsWith("-auth-token");
      if (isSupabaseKey || e.key === CAREERPILOT_SESSION_KEY) {
        if (!e.newValue) {
          // Session cleared elsewhere → mirror sign-out in this tab.
          if (isAuthed) doSignOut("manual");
        } else {
          // Session updated elsewhere → pick it up.
          supabase.auth.getSession();
        }
      }
      if (e.key === IDLE_KEY && e.newValue) {
        // Another tab saw activity — reset our idle timer too.
        if (isAuthed && !warnOpen) scheduleIdle();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isAuthed, warnOpen, doSignOut, scheduleIdle]);

  const stay = async () => {
    setWarnOpen(false);
    try {
      const { data } = await supabase.auth.refreshSession();
      if (data.session) persistCareerPilotSession(data.session);
    } catch { /* ignore */ }
    scheduleIdle();
  };

  if (!warnOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0b0f] p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Still there?</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-white/60">
          You'll be signed out in <span className="font-medium text-gray-900 dark:text-white">{secondsLeft}s</span> due to inactivity.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => doSignOut("manual")}
            className="flex-1 h-10 rounded-full border border-gray-200 dark:border-white/15 text-sm font-medium text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5"
          >
            Sign out
          </button>
          <button
            onClick={stay}
            className="flex-1 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-sm font-medium text-white"
          >
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
}
