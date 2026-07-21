import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Loader2, ArrowRight, Sun, Moon, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa6";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useServerFn } from "@tanstack/react-start";
import { getMyRoles } from "@/lib/roles.functions";
import { checkMagicLinkQuota } from "@/lib/auth-security.functions";
import { getHydratedCareerPilotSession, persistCareerPilotSession } from "@/lib/auth-persistence";
import { useTheme } from "@/lib/theme";

type LoginSearch = { form?: "1"; next?: string };

function sanitizeNext(v: unknown): string | undefined {
  if (typeof v !== "string" || !v.startsWith("/") || v.startsWith("//")) return undefined;
  return v;
}

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): LoginSearch => ({
    form: s.form === "1" ? "1" : undefined,
    next: sanitizeNext(s.next),
  }),
  head: () => ({
    meta: [
      { title: "CareerPilot AI — Sign in" },
      { name: "description", content: "Sign in to CareerPilot AI — your intelligent career co-pilot." },
    ],
  }),
  component: LoginPage,
});

type Provider = "google" | "apple";
type AuthStep = "email" | "sent";

const SESSION_KEY = "user_session";

function LoginPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();

  const [authStep, setAuthStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<Provider | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendOk, setResendOk] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const [nowTick, setNowTick] = useState(Date.now());
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [theme, , toggleTheme] = useTheme();

  const checkRoles = useServerFn(getMyRoles);
  const checkQuota = useServerFn(checkMagicLinkQuota);
  const routeAfterAuth = async () => {
    if (next) {
      window.location.assign(next);
      return;
    }
    try {
      const r = await checkRoles();
      navigate({ to: r.isAdmin ? "/admin" : "/dashboard" });
    } catch {
      navigate({ to: "/dashboard" });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      if (next) window.location.assign(next);
      else navigate({ to: "/dashboard" });
      return;
    }
    getHydratedCareerPilotSession().then((s) => {
      if (s) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user: s.user, token: s.access_token }));
        routeAfterAuth();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cooldown ticker (drives the "Resend in Ns" label)
  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [cooldownUntil]);



  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const cooldownMs = Math.max(0, cooldownUntil - nowTick);
  const cooldownSec = Math.ceil(cooldownMs / 1000);

  const humanizeAuthError = (raw: string): string => {
    const m = raw.toLowerCase();
    if (m.includes("rate") || m.includes("too many") || m.includes("429")) return "Too many attempts. Please wait a minute before trying again.";
    if (m.includes("network") || m.includes("fetch") || m.includes("failed to fetch")) return "Network issue. Check your connection and try again.";
    if (m.includes("not found") || m.includes("user")) return "We couldn't find that email. Try a different address.";
    if (m.includes("popup") || m.includes("closed") || m.includes("window")) return "Sign-in window was closed before completing. Try again — or use email code sign-in below.";
    if (m.includes("redirect") || m.includes("origin") || m.includes("uri")) return "Your browser blocked the Google redirect. Try again, or sign in with an email code below.";
    if (m.includes("provider") || m.includes("oauth")) return "Google sign-in isn't responding right now. Try again, or use email code sign-in instead.";
    return raw || "Something went wrong. Please try again.";
  };

  const humanizeOtpError = (raw: string): string => {
    const m = raw.toLowerCase();
    if (m.includes("expired")) return "This code has expired. Tap 'Resend code' below to get a new one.";
    if (m.includes("invalid") || m.includes("incorrect") || m.includes("token") || m.includes("otp")) return "That code doesn't match. Double-check the 6 digits from your email, or resend a new code.";
    if (m.includes("rate") || m.includes("too many") || m.includes("429")) return "Too many attempts. Please wait a minute before trying again.";
    if (m.includes("network") || m.includes("fetch")) return "Network issue. Check your connection and try again.";
    return raw || "We couldn't verify that code. Please try again.";
  };

  const formatRetry = (ms: number): string => {
    const s = Math.ceil(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.ceil(s / 60);
    if (m < 60) return `${m} min`;
    return `${Math.ceil(m / 60)}h`;
  };

  const isMobileUA = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);

  const sendLink = async (isResend = false) => {
    if (!emailOk) return;
    if (cooldownMs > 0) return;
    isResend ? setResending(true) : setBusy(true);
    if (isResend) { setResendError(null); setResendOk(false); }
    else setEmailError(null);
    try {
      // Server-side per-email + per-IP throttle before we touch Supabase Auth.
      const quota = await checkQuota({ data: { email } });
      if (!quota.allowed) {
        setCooldownUntil(Date.now() + quota.retryAfterMs);
        const msg =
          quota.reason === "cooldown"
            ? `Please wait ${formatRetry(quota.retryAfterMs)} before requesting another link.`
            : quota.reason === "ip"
              ? `Too many requests from your network. Try again in ${formatRetry(quota.retryAfterMs)}.`
              : `Too many requests for this email. Try again in ${formatRetry(quota.retryAfterMs)}.`;
        if (isResend) setResendError(msg); else setEmailError(msg);
        toast.error(msg);
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      // Client-side cooldown mirrors the server minimum spacing.
      setCooldownUntil(Date.now() + 30_000);
      if (isResend) {
        setResendOk(true);
        toast.success("New code sent");
      } else {
        setAuthStep("sent");
        toast.success("Verification code sent");
      }

    } catch (err) {
      const msg = humanizeAuthError(err instanceof Error ? err.message : "Failed to send link");
      if (isResend) setResendError(msg);
      else setEmailError(msg);
      toast.error(msg);
    } finally {
      isResend ? setResending(false) : setBusy(false);
    }
  };

  const verifyCode = async () => {
    const token = otpCode.replace(/\D/g, "");
    if (token.length !== 6 || verifying) return;
    setVerifying(true);
    setOtpError(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
      if (error) throw error;
      if (data.session) {
        persistCareerPilotSession(data.session, { touchLastLogin: true });
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user: data.session.user, token: data.session.access_token }));
      }
      toast.success("Signed in");
      await routeAfterAuth();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Invalid or expired code";
      const msg = humanizeOtpError(raw);
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  const oauth = async (provider: Provider) => {
    if (oauthBusy) return;
    setOauthBusy(provider);
    setOauthError(null);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`,
      });
      if (result.error) throw result.error;
      // On mobile, if we didn't redirect within a moment, the popup likely was blocked.
      if (isMobileUA && !result.redirected) {
        window.setTimeout(() => {
          if (!document.hidden) {
            setOauthError(
              isIOS
                ? "iOS may have blocked the Google popup. Allow popups for this site in Settings → Safari, or sign in with an email code below."
                : "Your browser may have blocked the Google popup. Allow popups for this site, or sign in with an email code below.",
            );
            setOauthBusy(null);
          }
        }, 2500);
      }
    } catch (err) {
      const msg = humanizeAuthError(err instanceof Error ? err.message : "OAuth failed");
      setOauthError(msg);
      toast.error(msg);
      setOauthBusy(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4"
      style={{ background: "radial-gradient(circle at center, #1a1a2e 0%, #0f0f1a 100%)" }}
    >
      {/* Animated ambient orbs */}
      <motion.div
        aria-hidden
        className="absolute -top-1/4 -left-1/4 w-[720px] h-[720px] rounded-full blur-[160px] opacity-60 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.55), transparent 60%)" }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-1/4 -right-1/4 w-[720px] h-[720px] rounded-full blur-[160px] opacity-60 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.5), transparent 60%)" }}
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-50 flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <button
          onClick={() => navigate({ to: "/" })}
          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-medium hover:bg-white/20 transition-all cursor-pointer"
        >
          ← Back
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-[440px] mt-16 sm:mt-0 rounded-[28px] overflow-hidden border border-white/10 backdrop-blur-3xl shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        {authStep === "email" ? (
          <>
            {/* Creative gradient header with floating robot */}
            <div className="relative h-52 flex items-center justify-center overflow-hidden"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 55%, #2563eb 100%)" }}
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: "radial-gradient(circle, #ffffff33 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-28 h-28 bg-white rounded-3xl flex items-center justify-center shadow-2xl"
                style={{ boxShadow: "0 0 40px rgba(34, 211, 238, 0.6)" }}
              >
                <span className="text-6xl">🤖</span>
              </motion.div>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/90 text-[11px] tracking-[0.3em] font-medium">
                CAREERPILOT • ZOIEE
              </div>
            </div>

            <motion.div
              key="email"
              className="p-7 sm:p-8 -mt-6 relative bg-zinc-950 rounded-t-[28px]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-[30px] font-bold tracking-tight text-white text-center mb-2"
              >
                Unlock the Future
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-center text-white/50 text-[13px] leading-relaxed px-2"
              >
                Sign in to save your journey, analyze your resume,<br className="hidden sm:block" />
                and discover your dream career path ✨
              </motion.p>

              <form
                onSubmit={(e) => { e.preventDefault(); sendLink(false); }}
                className="mt-8 flex flex-col gap-3"
                noValidate
              >
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                  onClick={() => oauth("google")}
                  disabled={!!oauthBusy}
                  className="h-14 w-full rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/30 text-white text-[15px] font-medium flex items-center justify-center gap-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {oauthBusy === "google"
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><FcGoogle className="w-6 h-6" /> Continue with Google</>}
                </motion.button>

                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.52, duration: 0.4 }}
                  onClick={() => oauth("apple")}
                  disabled={!!oauthBusy}
                  className="h-14 w-full rounded-2xl bg-white text-black text-[15px] font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] hover:bg-gray-100"
                >
                  {oauthBusy === "apple"
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><FaApple className="w-6 h-6" /> Continue with Apple</>}
                </motion.button>

                {oauthError && (
                  <div role="alert" className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3.5 py-2.5 text-[12.5px] text-amber-300 leading-relaxed">
                    {oauthError}
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="flex items-center gap-3 my-2"
                >
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                  <span className="text-[10.5px] uppercase tracking-[0.24em] text-white/40">or with email</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.4 }}
                >
                  <label htmlFor="email" className="sr-only">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/40 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(null); }}
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@email.com"
                      style={{ fontSize: "16px" }}
                      className={`w-full h-14 rounded-2xl pl-11 pr-4 bg-white/[0.04] border outline-none transition-all text-white placeholder-white/35 ${
                        email.length > 0 && !emailOk
                          ? "border-red-400/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                          : "border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                      }`}
                    />
                  </div>
                  {email.length > 0 && !emailOk && (
                    <p className="mt-1.5 text-[11.5px] text-red-300/90">Enter a valid email</p>
                  )}
                </motion.div>

                {emailError && (
                  <div role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-[12.5px] text-red-300 leading-relaxed">
                    {emailError}
                  </div>
                )}

                <motion.button
                  type="submit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.72, duration: 0.4 }}
                  disabled={!emailOk || busy}
                  className="group relative overflow-hidden mt-1 h-14 w-full rounded-2xl font-semibold text-[15px] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(90deg, #22d3ee 0%, #3b82f6 100%)",
                    boxShadow: "0 10px 30px -8px rgba(34,211,238,0.45)",
                  }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  {busy
                    ? <Loader2 className="size-4 animate-spin relative" />
                    : <span className="relative inline-flex items-center gap-2">Send Magic OTP ✨</span>}
                </motion.button>

                <p className="mt-4 text-[11px] text-center text-white/40 leading-relaxed">
                  By signing in, you agree to our <span className="underline">Terms</span> &amp; <span className="underline">Privacy Policy</span>
                </p>
                <p className="text-[11.5px] text-center text-white/45">
                  Administrator?{" "}
                  <Link to="/admin-login" className="text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline">
                    Admin console
                  </Link>
                </p>
              </form>
            </motion.div>
          </>
        ) : (
          <motion.div
            key="sent"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="p-7 sm:p-8 bg-zinc-950 relative"
          >
            <button
              onClick={() => {
                setAuthStep("email");
                setResendError(null);
                setResendOk(false);
                setOtpCode("");
                setOtpError(null);
              }}
              className="absolute top-5 left-5 inline-flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5" /> Use a different email
            </button>

            <div className="text-center mb-2 mt-8">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-4 shadow-lg"
                style={{ boxShadow: "0 0 40px rgba(34,211,238,0.5)" }}
              >
                <Mail className="size-7 text-white" />
              </div>
              <h1 className="text-[26px] font-bold tracking-tight text-white">Check your email</h1>
              <p className="mt-2 text-[13px] text-white/50 px-2">
                We sent a 6-digit code to <span className="text-white font-medium">{email}</span>.
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); verifyCode(); }} className="mt-6 mb-4">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-white/50 mb-2 text-center">
                Enter 6-digit code
              </label>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                value={otpCode}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtpCode(v);
                  if (otpError) setOtpError(null);
                }}
                placeholder="••••••"
                className="w-full text-center tracking-[0.6em] font-mono text-[24px] py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-cyan-400 transition-all"
              />
              {otpError && (
                <p role="alert" className="mt-2 text-[12px] text-red-300 text-center">{otpError}</p>
              )}
              <button
                type="submit"
                disabled={otpCode.length !== 6 || verifying}
                className="mt-4 h-14 w-full rounded-2xl font-semibold text-[15px] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(90deg, #22d3ee 0%, #3b82f6 100%)",
                  boxShadow: "0 10px 30px -8px rgba(34,211,238,0.45)",
                }}
              >
                {verifying ? <Loader2 className="size-4 animate-spin" /> : <>Verify & Sign in <ArrowRight className="size-4" /></>}
              </button>
            </form>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[12px] text-white/60 leading-relaxed">
              <p className="mb-1.5 font-medium text-white">Tips</p>
              <ul className="space-y-1 list-disc pl-4">
                <li>The code expires in 60 minutes.</li>
                <li>Check spam or promotions if it hasn't arrived.</li>
              </ul>
            </div>

            {resendOk && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3.5 py-2.5 text-[12.5px] text-emerald-300"
              >
                <CheckCircle2 className="size-4" /> New code on the way
              </motion.div>
            )}

            {resendError && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3.5 py-2.5 text-[12.5px] text-amber-300 leading-relaxed text-center"
              >
                Couldn't resend: {resendError}
              </motion.div>
            )}

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => sendLink(true)}
                disabled={resending || busy || cooldownMs > 0}
                className="text-sm text-white/50 hover:text-cyan-300 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
              >
                {resending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {cooldownMs > 0 ? (
                  <>Resend available in <span className="font-mono tabular-nums">{cooldownSec}s</span></>
                ) : (
                  <>Didn't receive it? <span className="underline underline-offset-2">Resend code</span></>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
