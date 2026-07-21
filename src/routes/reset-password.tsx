import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, ArrowRight, Eye, EyeOff, CheckCircle2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { persistCareerPilotSession } from "@/lib/auth-persistence";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — CareerPilot AI" },
      { name: "description", content: "Choose a new password to regain access to your CareerPilot AI account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

const SESSION_KEY = "user_session";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Supabase parses the recovery link and emits a PASSWORD_RECOVERY event / session
  useEffect(() => {
    let mounted = true;

    // Some links land with tokens in the hash — supabase-js consumes them on load.
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setHasSession(!!data.session);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(!!session);
      }
    });

    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const humanize = (raw: string): string => {
    const m = raw.toLowerCase();
    if (m.includes("same as") || m.includes("different")) return "Please choose a password different from your current one.";
    if (m.includes("weak") || (m.includes("password") && m.includes("6"))) return "Password must be at least 6 characters.";
    if (m.includes("expired") || m.includes("invalid") || m.includes("not authenticated")) return "This reset link is invalid or has expired. Request a new one from the sign-in screen.";
    if (m.includes("rate") || m.includes("429")) return "Too many attempts. Please wait a moment and try again.";
    return raw || "Something went wrong. Please try again.";
  };

  const submit = async () => {
    if (password.length < 6 || password !== confirm || busy) return;
    setBusy(true); setError(null);
    try {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      if (data.user) {
        const { data: s } = await supabase.auth.getSession();
        if (s.session) {
          persistCareerPilotSession(s.session, { touchLastLogin: true });
          localStorage.setItem(SESSION_KEY, JSON.stringify({ user: s.session.user, token: s.session.access_token }));
        }
      }
      setDone(true);
      toast.success("Password updated");
      setTimeout(() => navigate({ to: "/dashboard" }), 1200);
    } catch (err) {
      const msg = humanize(err instanceof Error ? err.message : "Couldn't update password");
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder:text-white/35 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300";

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-[#05060a]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-indigo-500/15 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px] bg-black/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-indigo-500/30 border border-white/10 flex items-center justify-center mb-4">
            {done ? <CheckCircle2 className="size-5 text-emerald-300" /> : <ShieldCheck className="size-5 text-cyan-300" />}
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-white">
            {done ? "Password updated" : "Set a new password"}
          </h1>
          <p className="text-white/50 text-[13px] mt-1">
            {done ? "Taking you to your dashboard…" : "Choose a strong password you haven't used before."}
          </p>
        </div>

        {!ready ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-white/50" />
          </div>
        ) : !hasSession ? (
          <div className="text-center">
            <div role="alert" className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3.5 py-3 text-[12.5px] text-amber-300">
              This reset link is invalid or has expired. Request a new one from the sign-in screen.
            </div>
            <button
              onClick={() => navigate({ to: "/login" })}
              className="mt-5 w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-[13.5px] font-medium transition-colors cursor-pointer"
            >
              Back to sign in
            </button>
          </div>
        ) : done ? (
          <div className="text-center">
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="w-full py-3.5 rounded-xl font-semibold text-[14px] text-black bg-gradient-to-r from-cyan-300 to-white hover:opacity-90 active:scale-[0.98] transition cursor-pointer inline-flex items-center justify-center gap-2"
            >
              Go to dashboard <ArrowRight className="size-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <label className="block text-[12.5px] font-medium text-white/70 mb-2 px-1">New password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                style={{ fontSize: "16px" }}
                className={inputCls + " pr-11"}
              />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label="Toggle password" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer">
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            <label className="block text-[12.5px] font-medium text-white/70 mb-2 mt-4 px-1">Confirm password</label>
            <input
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); if (error) setError(null); }}
              autoComplete="new-password"
              placeholder="Re-enter password"
              style={{ fontSize: "16px" }}
              className={inputCls}
            />
            {confirm.length > 0 && password !== confirm && (
              <p className="mt-1.5 text-[11.5px] text-red-300 px-1">Passwords don't match</p>
            )}

            {error && (
              <div role="alert" className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-[12.5px] text-red-300">{error}</div>
            )}

            <button
              type="submit"
              disabled={password.length < 6 || password !== confirm || busy}
              className="mt-5 w-full py-3.5 rounded-xl font-semibold text-[14px] text-black bg-gradient-to-r from-cyan-300 to-white hover:opacity-90 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(34,211,238,0.25)]"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <>Update password <ArrowRight className="size-4" /></>}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
