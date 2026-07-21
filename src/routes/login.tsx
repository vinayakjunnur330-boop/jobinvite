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
    if (m.includes("network") || m.includes("fetch")) return "Network issue. Check your connection and try again.";
    if (m.includes("not found") || m.includes("user")) return "We couldn't find that email. Try a different address.";
    return raw || "Something went wrong. Please try again.";
  };

  const formatRetry = (ms: number): string => {
    const s = Math.ceil(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.ceil(s / 60);
    if (m < 60) return `${m} min`;
    return `${Math.ceil(m / 60)}h`;
  };

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
      const msg = /expired|invalid/i.test(raw) ? "That code is invalid or expired. Request a new one." : humanizeAuthError(raw);
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  const oauth = async (provider: Provider) => {
    if (oauthBusy) return;
    setOauthBusy(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`,
      });
      if (result.error) throw result.error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "OAuth failed");
      setOauthBusy(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#050505] transition-colors duration-500 relative overflow-hidden p-4">
      <motion.div
        aria-hidden
        className="absolute -top-1/4 -left-1/4 w-[700px] h-[700px] rounded-full blur-[140px] opacity-40 dark:opacity-60"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.35), transparent 60%)" }}
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full blur-[140px] opacity-40 dark:opacity-60"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.35), transparent 60%)" }}
        animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute top-6 right-8 z-50 flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 text-gray-700 dark:text-white hover:bg-white dark:hover:bg-white/20 transition-all cursor-pointer"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <button
          onClick={() => navigate({ to: "/" })}

          className="px-4 py-2 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 text-gray-700 dark:text-white text-xs font-medium hover:bg-white dark:hover:bg-white/20 transition-all cursor-pointer"
        >
          ← Back to Zoiee
        </button>
      </div>

      <div className="relative w-full max-w-[440px] bg-white/70 dark:bg-black/40 backdrop-blur-3xl border border-gray-200 dark:border-white/10 p-10 rounded-3xl shadow-2xl">
        {authStep === "sent" && (
          <button
            onClick={() => {
              setAuthStep("email");
              setResendError(null);
              setResendOk(false);
              setOtpCode("");
              setOtpError(null);
            }}
            className="absolute top-5 left-5 inline-flex items-center gap-1.5 text-[12px] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" /> Use a different email
          </button>
        )}

        <AnimatePresence mode="wait">
          {authStep === "email" ? (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-center mb-8">
                <div className="text-[10px] uppercase tracking-[0.28em] text-gray-500 dark:text-white/40 mb-3">
                  CareerPilot
                </div>
                <h1 className="text-[26px] font-semibold tracking-tight text-gray-900 dark:text-white">
                  Sign in to CareerPilot
                </h1>
                <p className="mt-2 text-[13px] text-gray-500 dark:text-white/50">
                  Enter your email — we'll send you a 6-digit verification code.
                </p>

              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendLink(false);
                }}
                className="flex flex-col gap-5"
                noValidate
              >
                <div>
                  <label htmlFor="email" className="block text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-white/50 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(null); }}
                      autoComplete="email"
                      autoFocus
                      placeholder="you@work.com"
                      className={`bg-transparent border-b py-3 w-full outline-none transition-all text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 ${
                        email.length > 0 && !emailOk
                          ? "border-red-400 focus:border-red-500"
                          : "border-gray-300 dark:border-white/20 focus:border-blue-500"
                      }`}
                    />
                  </div>
                  {email.length > 0 && !emailOk && (
                    <p className="mt-1 text-[11.5px] text-red-500 dark:text-red-300/90">Enter a valid email</p>
                  )}
                </div>

                {emailError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-400/40 dark:border-red-400/30 bg-red-500/5 dark:bg-red-500/10 px-3.5 py-2.5 text-[12.5px] text-red-600 dark:text-red-300 leading-relaxed"
                  >
                    {emailError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!emailOk || busy}
                  className="group mt-1 h-11 w-full rounded-full font-medium text-[13.5px] bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  {busy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Send Verification Code
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}

                </button>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                  <span className="text-[10.5px] uppercase tracking-[0.2em] text-gray-400 dark:text-white/35">Or continue with</span>
                  <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {([
                    { id: "google" as Provider, label: "Google", Icon: FcGoogle },
                    { id: "apple" as Provider, label: "Apple", Icon: FaApple },
                  ]).map(({ id, label, Icon }) => {
                    const loading = oauthBusy === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => oauth(id)}
                        disabled={!!oauthBusy}
                        className="h-11 flex items-center justify-center gap-2 rounded-full bg-white dark:bg-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.1] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white/85 text-[12.5px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Icon className="w-[16px] h-[16px]" /> {label}</>}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2 text-[11px] text-center text-gray-500 dark:text-white/40 leading-relaxed">
                  By continuing you agree to our Terms & Privacy.
                </p>
                <p className="text-[11.5px] text-center text-gray-500 dark:text-white/45">
                  Administrator?{" "}
                  <Link to="/admin-login" className="text-blue-500 hover:text-blue-600 dark:text-cyan-300 dark:hover:text-cyan-200 underline-offset-4 hover:underline">
                    Admin console
                  </Link>
                </p>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="sent"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-center mb-2 mt-4">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 dark:border-blue-400/20 flex items-center justify-center mb-4">
                  <Mail className="size-6 text-blue-500 dark:text-blue-300" />
                </div>
                <h1 className="text-[24px] font-semibold tracking-tight text-gray-900 dark:text-white">
                  Check your email
                </h1>
                <p className="mt-2 text-[13px] text-gray-500 dark:text-white/50 px-2">
                  We sent a secure sign-in link and a 6-digit code to <span className="text-gray-900 dark:text-white font-medium">{email}</span>.
                  Click the link or enter the code below.
                </p>
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); verifyCode(); }}
                className="mt-6 mb-4"
              >
                <label className="block text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-white/50 mb-2 text-center">
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
                  className="w-full text-center tracking-[0.6em] font-mono text-[22px] py-3 rounded-xl bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                />
                {otpError && (
                  <p role="alert" className="mt-2 text-[12px] text-red-500 dark:text-red-300 text-center">{otpError}</p>
                )}
                <button
                  type="submit"
                  disabled={otpCode.length !== 6 || verifying}
                  className="mt-4 h-11 w-full rounded-full font-medium text-[13.5px] bg-blue-500 hover:bg-blue-600 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  {verifying ? <Loader2 className="size-4 animate-spin" /> : <>Verify & Sign in <ArrowRight className="size-4" /></>}
                </button>
              </form>

              <div className="mt-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4 text-[12px] text-gray-600 dark:text-white/60 leading-relaxed">
                <p className="mb-1.5 font-medium text-gray-900 dark:text-white">Tips</p>
                <ul className="space-y-1 list-disc pl-4">
                  <li>The code and link expire in 60 minutes.</li>
                  <li>Check spam or promotions if it hasn't arrived.</li>
                </ul>
              </div>


              {resendOk && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/5 px-3.5 py-2.5 text-[12.5px] text-emerald-600 dark:text-emerald-300"
                >
                  <CheckCircle2 className="size-4" /> New link on the way
                </motion.div>
              )}

              {resendError && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-xl border border-amber-400/40 dark:border-amber-400/30 bg-amber-500/5 dark:bg-amber-500/10 px-3.5 py-2.5 text-[12.5px] text-amber-700 dark:text-amber-300 leading-relaxed text-center"
                >
                  Couldn't resend: {resendError}
                </motion.div>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => sendLink(true)}
                  disabled={resending || busy || cooldownMs > 0}
                  className="text-sm text-gray-500 hover:text-cyan-500 dark:hover:text-cyan-300 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                >
                  {resending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  {cooldownMs > 0 ? (
                    <>Resend available in <span className="font-mono tabular-nums">{cooldownSec}s</span></>
                  ) : (
                    <>Didn't receive it? <span className="underline underline-offset-2">Resend link</span></>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
