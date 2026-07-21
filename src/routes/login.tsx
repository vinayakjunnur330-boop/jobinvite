import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, Mail, CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa6";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useServerFn } from "@tanstack/react-start";
import { getMyRoles } from "@/lib/roles.functions";
import { checkMagicLinkQuota } from "@/lib/auth-security.functions";
import { getHydratedCareerPilotSession, persistCareerPilotSession } from "@/lib/auth-persistence";

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
type Tab = "otp" | "password";
type OtpStep = "email" | "code";
type PwView = "signin" | "signup" | "forgot" | "forgot_sent";

const SESSION_KEY = "user_session";

function LoginPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();

  const [tab, setTab] = useState<Tab>("otp");

  // OTP state
  const [otpStep, setOtpStep] = useState<OtpStep>("email");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendOk, setResendOk] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const [nowTick, setNowTick] = useState(Date.now());
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Password state
  const [pwView, setPwView] = useState<PwView>("signin");
  const [pwEmail, setPwEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  // OAuth
  const [oauthBusy, setOauthBusy] = useState<Provider | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);

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

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [cooldownUntil]);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const pwEmailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pwEmail);
  const cooldownMs = Math.max(0, cooldownUntil - nowTick);
  const cooldownSec = Math.ceil(cooldownMs / 1000);

  const humanize = (raw: string): string => {
    const m = raw.toLowerCase();
    if (m.includes("rate") || m.includes("too many") || m.includes("429")) return "Too many attempts. Please wait a moment and try again.";
    if (m.includes("invalid login") || m.includes("invalid credentials") || m.includes("invalid_grant")) return "That email and password don't match. Try again or reset your password.";
    if (m.includes("email not confirmed")) return "Please confirm your email first — check your inbox for the verification link.";
    if (m.includes("user already registered") || m.includes("already been registered")) return "An account with this email already exists. Try signing in instead.";
    if (m.includes("password") && m.includes("6")) return "Password must be at least 6 characters.";
    if (m.includes("network") || m.includes("fetch")) return "Network issue. Check your connection and try again.";
    if (m.includes("expired")) return "This code has expired. Tap 'Resend' to get a new one.";
    if (m.includes("otp") || m.includes("token")) return "That code doesn't match. Double-check the 6 digits or resend a new code.";
    return raw || "Something went wrong. Please try again.";
  };

  const formatRetry = (ms: number): string => {
    const s = Math.ceil(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.ceil(s / 60);
    return m < 60 ? `${m} min` : `${Math.ceil(m / 60)}h`;
  };

  // ---------- OTP ----------
  const sendCode = async (isResend = false) => {
    if (!emailOk || cooldownMs > 0) return;
    isResend ? setResending(true) : setBusy(true);
    if (isResend) { setResendError(null); setResendOk(false); }
    else setEmailError(null);
    try {
      const quota = await checkQuota({ data: { email } });
      if (!quota.allowed) {
        setCooldownUntil(Date.now() + quota.retryAfterMs);
        const msg = `Please wait ${formatRetry(quota.retryAfterMs)} before requesting another code.`;
        if (isResend) setResendError(msg); else setEmailError(msg);
        toast.error(msg);
        return;
      }
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      if (error) throw error;
      setCooldownUntil(Date.now() + 30_000);
      if (isResend) { setResendOk(true); toast.success("New code sent"); }
      else { setOtpStep("code"); toast.success("Verification code sent"); }
    } catch (err) {
      const msg = humanize(err instanceof Error ? err.message : "Failed to send code");
      if (isResend) setResendError(msg); else setEmailError(msg);
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
      const msg = humanize(err instanceof Error ? err.message : "Invalid code");
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  // ---------- Password ----------
  const signInWithPassword = async () => {
    if (!pwEmailOk || password.length < 6 || pwBusy) return;
    setPwBusy(true); setPwError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: pwEmail, password });
      if (error) throw error;
      if (data.session) {
        persistCareerPilotSession(data.session, { touchLastLogin: true });
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user: data.session.user, token: data.session.access_token }));
      }
      toast.success("Signed in");
      await routeAfterAuth();
    } catch (err) {
      const msg = humanize(err instanceof Error ? err.message : "Sign in failed");
      setPwError(msg); toast.error(msg);
    } finally { setPwBusy(false); }
  };

  const signUpWithPassword = async () => {
    if (!pwEmailOk || password.length < 6 || password !== password2 || pwBusy) return;
    setPwBusy(true); setPwError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: pwEmail,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}` },
      });
      if (error) throw error;
      if (data.session) {
        persistCareerPilotSession(data.session, { touchLastLogin: true });
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user: data.session.user, token: data.session.access_token }));
        toast.success("Welcome to CareerPilot");
        await routeAfterAuth();
      } else {
        toast.success("Account created — check your inbox to verify");
        setPwView("signin");
      }
    } catch (err) {
      const msg = humanize(err instanceof Error ? err.message : "Sign up failed");
      setPwError(msg); toast.error(msg);
    } finally { setPwBusy(false); }
  };

  const sendReset = async () => {
    if (!pwEmailOk || pwBusy) return;
    setPwBusy(true); setPwError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(pwEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setPwView("forgot_sent");
      toast.success("Reset link sent");
    } catch (err) {
      const msg = humanize(err instanceof Error ? err.message : "Couldn't send reset email");
      setPwError(msg); toast.error(msg);
    } finally { setPwBusy(false); }
  };

  const oauth = async (provider: Provider) => {
    if (oauthBusy) return;
    setOauthBusy(provider); setOauthError(null);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`,
      });
      if (result.error) throw result.error;
    } catch (err) {
      const msg = humanize(err instanceof Error ? err.message : "OAuth failed");
      setOauthError(msg); toast.error(msg); setOauthBusy(null);
    }
  };

  const inputCls =
    "w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder:text-white/35 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300";

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-[#05060a]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Ambient gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-indigo-500/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-fuchsia-500/[0.06] blur-[140px]" />
      </div>

      {/* Top-right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-50">
        <button
          onClick={() => navigate({ to: "/" })}
          className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white/80 text-[11px] font-medium hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-xl"
        >
          ← Back
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px] bg-black/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] mt-14 sm:mt-0"
      >
        {/* Brand */}
        <div className="mb-7 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-indigo-500/30 border border-white/10 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
            <KeyRound className="size-5 text-cyan-300" />
          </div>
          <h1 className="text-[24px] font-semibold tracking-tight text-white">Welcome to CareerPilot</h1>
          <p className="text-white/50 text-sm mt-1">Sign in to continue</p>
        </div>

        {/* Social */}
        <div className="space-y-2.5 mb-5">
          <button
            type="button"
            onClick={() => oauth("google")}
            disabled={!!oauthBusy}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl text-white text-[14px] font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            {oauthBusy === "google" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><FcGoogle className="w-5 h-5" /> Continue with Google</>}
          </button>
          <button
            type="button"
            onClick={() => oauth("apple")}
            disabled={!!oauthBusy}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl text-white text-[14px] font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            {oauthBusy === "apple" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><FaApple className="w-5 h-5" /> Continue with Apple</>}
          </button>
        </div>

        {oauthError && (
          <div role="alert" className="mb-4 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3.5 py-2.5 text-[12.5px] text-amber-300">{oauthError}</div>
        )}

        <div className="flex items-center gap-4 mb-5">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-white/40 text-[11px] font-medium uppercase tracking-widest">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Tab pill */}
        <div className="relative mb-5 grid grid-cols-2 gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white/10 border border-white/10 shadow-[0_4px_20px_rgba(34,211,238,0.15)]"
            style={{ left: tab === "otp" ? 4 : "50%" }}
          />
          {(["otp", "password"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setOtpError(null); setPwError(null); }}
              className={`relative z-10 py-2 text-[12.5px] font-medium rounded-full transition-colors cursor-pointer ${tab === t ? "text-white" : "text-white/50 hover:text-white/80"}`}
            >
              {t === "otp" ? "Passcode" : "Password"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "otp" && otpStep === "email" && (
            <motion.form
              key="otp-email"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.22 }}
              onSubmit={(e) => { e.preventDefault(); sendCode(false); }}
            >
              <label htmlFor="email" className="block text-[12.5px] font-medium text-white/70 mb-2 px-1">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(null); }}
                autoComplete="email"
                inputMode="email"
                placeholder="name@example.com"
                style={{ fontSize: "16px" }}
                className={inputCls}
              />
              {email.length > 0 && !emailOk && (
                <p className="mt-1.5 text-[11.5px] text-red-300 px-1">Enter a valid email</p>
              )}
              {emailError && (
                <div role="alert" className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-[12.5px] text-red-300">{emailError}</div>
              )}
              <button
                type="submit"
                disabled={!emailOk || busy}
                className="mt-4 w-full py-3.5 rounded-xl font-semibold text-[14px] text-black bg-gradient-to-r from-cyan-300 to-white hover:opacity-90 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(34,211,238,0.25)]"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : <>Send verification code <ArrowRight className="size-4" /></>}
              </button>
            </motion.form>
          )}

          {tab === "otp" && otpStep === "code" && (
            <motion.div
              key="otp-code"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
            >
              <button
                onClick={() => { setOtpStep("email"); setOtpCode(""); setOtpError(null); setResendError(null); setResendOk(false); }}
                className="inline-flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white transition-colors cursor-pointer mb-4"
              >
                <ArrowLeft className="size-3.5" /> Back
              </button>
              <div className="text-center mb-5">
                <div className="mx-auto w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mb-3">
                  <Mail className="size-5 text-white/80" />
                </div>
                <h2 className="text-[18px] font-semibold text-white">Check your email</h2>
                <p className="mt-1 text-[12.5px] text-white/50">Code sent to <span className="text-white/90">{email}</span></p>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); verifyCode(); }}>
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6)); if (otpError) setOtpError(null); }}
                  placeholder="••••••"
                  className="w-full text-center tracking-[0.5em] font-mono text-[22px] py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                />
                {otpError && <p role="alert" className="mt-2 text-[12px] text-red-300 text-center">{otpError}</p>}
                <button
                  type="submit"
                  disabled={otpCode.length !== 6 || verifying}
                  className="mt-4 w-full py-3.5 rounded-xl font-semibold text-[14px] text-black bg-gradient-to-r from-cyan-300 to-white hover:opacity-90 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  {verifying ? <Loader2 className="size-4 animate-spin" /> : <>Verify & sign in <ArrowRight className="size-4" /></>}
                </button>
              </form>

              {resendOk && (
                <div className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-2.5 text-[12.5px] text-emerald-300">
                  <CheckCircle2 className="size-4" /> New code sent
                </div>
              )}
              {resendError && (
                <div role="alert" className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3.5 py-2.5 text-[12.5px] text-amber-300 text-center">{resendError}</div>
              )}
              <div className="text-center mt-5">
                <button
                  type="button"
                  onClick={() => sendCode(true)}
                  disabled={resending || busy || cooldownMs > 0}
                  className="text-[13px] text-white/50 hover:text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                >
                  {resending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  {cooldownMs > 0 ? <>Resend in <span className="font-mono tabular-nums">{cooldownSec}s</span></> : <>Didn't get it? <span className="underline underline-offset-2">Resend code</span></>}
                </button>
              </div>
            </motion.div>
          )}

          {tab === "password" && pwView !== "forgot" && pwView !== "forgot_sent" && (
            <motion.form
              key={`pw-${pwView}`}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
              onSubmit={(e) => { e.preventDefault(); pwView === "signin" ? signInWithPassword() : signUpWithPassword(); }}
            >
              <label className="block text-[12.5px] font-medium text-white/70 mb-2 px-1">Email address</label>
              <input
                type="email"
                value={pwEmail}
                onChange={(e) => { setPwEmail(e.target.value); if (pwError) setPwError(null); }}
                autoComplete="email"
                placeholder="name@example.com"
                style={{ fontSize: "16px" }}
                className={inputCls}
              />

              <label className="block text-[12.5px] font-medium text-white/70 mb-2 mt-4 px-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (pwError) setPwError(null); }}
                  autoComplete={pwView === "signup" ? "new-password" : "current-password"}
                  placeholder="••••••••"
                  style={{ fontSize: "16px" }}
                  className={inputCls + " pr-11"}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} aria-label="Toggle password visibility" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer">
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {pwView === "signup" && (
                <>
                  <label className="block text-[12.5px] font-medium text-white/70 mb-2 mt-4 px-1">Confirm password</label>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password2}
                    onChange={(e) => { setPassword2(e.target.value); if (pwError) setPwError(null); }}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    style={{ fontSize: "16px" }}
                    className={inputCls}
                  />
                  {password2.length > 0 && password !== password2 && (
                    <p className="mt-1.5 text-[11.5px] text-red-300 px-1">Passwords don't match</p>
                  )}
                </>
              )}

              {pwView === "signin" && (
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => { setPwView("forgot"); setPwError(null); }}
                    className="text-[12px] text-cyan-300/90 hover:text-cyan-200 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {pwError && (
                <div role="alert" className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-[12.5px] text-red-300">{pwError}</div>
              )}

              <button
                type="submit"
                disabled={!pwEmailOk || password.length < 6 || pwBusy || (pwView === "signup" && password !== password2)}
                className="mt-4 w-full py-3.5 rounded-xl font-semibold text-[14px] text-black bg-gradient-to-r from-cyan-300 to-white hover:opacity-90 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(34,211,238,0.25)]"
              >
                {pwBusy ? <Loader2 className="size-4 animate-spin" /> : <>{pwView === "signin" ? "Sign in" : "Create account"} <ArrowRight className="size-4" /></>}
              </button>

              <p className="mt-4 text-center text-[12.5px] text-white/50">
                {pwView === "signin" ? "New to CareerPilot?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => { setPwView(pwView === "signin" ? "signup" : "signin"); setPwError(null); }}
                  className="text-white hover:text-cyan-300 transition-colors cursor-pointer underline underline-offset-2"
                >
                  {pwView === "signin" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </motion.form>
          )}

          {tab === "password" && pwView === "forgot" && (
            <motion.form
              key="pw-forgot"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
              onSubmit={(e) => { e.preventDefault(); sendReset(); }}
            >
              <button type="button" onClick={() => setPwView("signin")} className="inline-flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white transition-colors cursor-pointer mb-3">
                <ArrowLeft className="size-3.5" /> Back to sign in
              </button>
              <h2 className="text-[18px] font-semibold text-white">Reset your password</h2>
              <p className="text-[12.5px] text-white/50 mt-1 mb-4">Enter your email and we'll send you a secure reset link.</p>
              <label className="block text-[12.5px] font-medium text-white/70 mb-2 px-1">Email address</label>
              <input
                type="email"
                value={pwEmail}
                onChange={(e) => { setPwEmail(e.target.value); if (pwError) setPwError(null); }}
                autoComplete="email"
                placeholder="name@example.com"
                style={{ fontSize: "16px" }}
                className={inputCls}
              />
              {pwError && (
                <div role="alert" className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-[12.5px] text-red-300">{pwError}</div>
              )}
              <button
                type="submit"
                disabled={!pwEmailOk || pwBusy}
                className="mt-4 w-full py-3.5 rounded-xl font-semibold text-[14px] text-black bg-gradient-to-r from-cyan-300 to-white hover:opacity-90 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2"
              >
                {pwBusy ? <Loader2 className="size-4 animate-spin" /> : <>Send reset link <ArrowRight className="size-4" /></>}
              </button>
            </motion.form>
          )}

          {tab === "password" && pwView === "forgot_sent" && (
            <motion.div
              key="pw-forgot-sent"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
              className="text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center mb-4">
                <CheckCircle2 className="size-5 text-emerald-300" />
              </div>
              <h2 className="text-[18px] font-semibold text-white">Check your inbox</h2>
              <p className="text-[12.5px] text-white/60 mt-1">We sent password reset instructions to <span className="text-white">{pwEmail}</span>.</p>
              <button
                type="button"
                onClick={() => setPwView("signin")}
                className="mt-5 w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-[13.5px] font-medium transition-colors cursor-pointer"
              >
                Back to sign in
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-6 text-[11px] text-center text-white/35 leading-relaxed">
          By continuing you agree to our Terms &amp; Privacy.
        </p>

        <div className="mt-6 text-center">
          <Link to="/admin-login" className="text-white/35 text-[12px] hover:text-white/80 transition-colors">
            Admin Console
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
