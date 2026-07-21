import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { persistCareerPilotSession, clearCareerPilotSession, CAREERPILOT_SESSION_KEY } from "@/lib/auth-persistence";
import { toast } from "sonner";

// Sign out after 30 minutes of inactivity; warn 60s before.
const IDLE_MS = 30 * 60 * 1000;
const WARN_MS = 60 * 1000;
const REFRESH_LEAD_MS = 5 * 60 * 1000;
const IDLE_KEY = "cp_last_activity";

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;

export function SessionManager() {
  const { session, signOut } = useAuth();
  const [warnOpen, setWarnOpen] = useState(false);
  const [warnDeadline, setWarnDeadline] = useState<number>(0);
  const [msLeft, setMsLeft] = useState(WARN_MS);
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
      const deadline = Date.now() + WARN_MS;
      setWarnDeadline(deadline);
      setMsLeft(WARN_MS);
      setWarnOpen(true);
      countdownRef.current = window.setInterval(() => {
        setMsLeft(Math.max(0, deadline - Date.now()));
      }, 200);
    }, IDLE_MS - WARN_MS);
    idleTimerRef.current = window.setTimeout(() => {
      doSignOut("idle");
    }, IDLE_MS);
  }, [clearTimers, doSignOut, isAuthed]);

  const stay = useCallback(async () => {
    setWarnOpen(false);
    try {
      const { data } = await supabase.auth.refreshSession();
      if (data.session) persistCareerPilotSession(data.session);
    } catch { /* ignore */ }
    scheduleIdle();
  }, [scheduleIdle]);

  // Activity listeners → reset idle timer. When the warning is showing,
  // any user activity auto-dismisses it and refreshes the session.
  useEffect(() => {
    if (!isAuthed) return;
    scheduleIdle();
    const onActivity = () => {
      if (warnOpen) { stay(); return; }
      scheduleIdle();
    };
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    return () => {
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, warnOpen]);

  // Proactive token refresh.
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
        if (error || !data.session) { await doSignOut("expired"); return; }
        persistCareerPilotSession(data.session);
      } catch { /* retry on next focus/online */ }
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

  // Cross-tab sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      const isSupabaseKey = e.key.startsWith("sb-") && e.key.endsWith("-auth-token");
      if (isSupabaseKey || e.key === CAREERPILOT_SESSION_KEY) {
        if (!e.newValue) { if (isAuthed) doSignOut("manual"); }
        else { supabase.auth.getSession(); }
      }
      if (e.key === IDLE_KEY && e.newValue) {
        if (isAuthed && !warnOpen) scheduleIdle();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isAuthed, warnOpen, doSignOut, scheduleIdle]);

  if (!warnOpen) return null;

  const secondsLeft = Math.ceil(msLeft / 1000);
  const totalMs = Math.max(1, warnDeadline - (warnDeadline - WARN_MS));
  const pct = Math.max(0, Math.min(100, (msLeft / totalMs) * 100));

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0b0f] p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Still there?</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-white/60">
          Signing you out in{" "}
          <span className="font-mono font-medium text-gray-900 dark:text-white tabular-nums">
            {secondsLeft}s
          </span>{" "}
          due to inactivity. Move your mouse or press any key to stay signed in.
        </p>
        <div className="mt-4 h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-[width] duration-200 ease-linear"
            style={{ width: `${pct}%` }}
            aria-hidden
          />
        </div>
        <div
          role="timer"
          aria-live="polite"
          aria-label={`Auto sign-out in ${secondsLeft} seconds`}
          className="sr-only"
        >
          {secondsLeft} seconds remaining
        </div>
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
