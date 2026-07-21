import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 relative"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Top-right controls */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-50 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/15 text-zinc-700 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/20 transition-colors cursor-pointer"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <button
          onClick={() => navigate({ to: "/" })}
          className="px-3 py-1.5 rounded-full bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/15 text-zinc-700 dark:text-white text-[11px] font-medium hover:bg-zinc-100 dark:hover:bg-white/20 transition-colors cursor-pointer"
        >
          ← Back
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[400px] bg-white dark:bg-zinc-900 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-zinc-100 dark:border-white/10 p-8 sm:p-10 flex flex-col items-center mt-16 sm:mt-0"
      >
        {authStep === "email" ? (
          <>
            {/* Brand */}
            <div className="mb-8 text-center">
              <h1 className="text-[24px] font-bold tracking-tight text-zinc-900 dark:text-white">CareerPilot</h1>
              <p className="text-zinc-500 dark:text-white/50 text-sm mt-1">Sign in to your account</p>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); sendLink(false); }}
              className="w-full"
              noValidate
            >
              {/* Social */}
              <div className="w-full space-y-3 mb-6">
                <button
                  type="button"
                  onClick={() => oauth("google")}
                  disabled={!!oauthBusy}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-700 dark:text-white text-[14px] font-medium hover:bg-zinc-50 dark:hover:bg-white/[0.08] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {oauthBusy === "google"
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><FcGoogle className="w-5 h-5" /> Continue with Google</>}
                </button>
                <button
                  type="button"
                  onClick={() => oauth("apple")}
                  disabled={!!oauthBusy}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-700 dark:text-white text-[14px] font-medium hover:bg-zinc-50 dark:hover:bg-white/[0.08] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {oauthBusy === "apple"
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><FaApple className="w-5 h-5 text-zinc-900 dark:text-white" /> Continue with Apple</>}
                </button>
              </div>

              {oauthError && (
                <div role="alert" className="mb-4 rounded-xl border border-amber-300 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-500/10 px-3.5 py-2.5 text-[12.5px] text-amber-700 dark:text-amber-300 leading-relaxed">
                  {oauthError}
                </div>
              )}

              {/* Divider */}
              <div className="w-full flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
                <span className="text-zinc-400 dark:text-white/40 text-[11px] font-medium uppercase tracking-widest">or</span>
                <div className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-[13px] font-medium text-zinc-700 dark:text-white/70 mb-2 px-1">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(null); }}
                  autoComplete="email"
                  inputMode="email"
                  placeholder="name@example.com"
                  style={{ fontSize: "16px" }}
                  className={`w-full px-4 py-3 bg-zinc-50 dark:bg-white/[0.04] border rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all ${
                    email.length > 0 && !emailOk
                      ? "border-red-300 focus:border-red-500"
                      : "border-zinc-200 dark:border-white/10 focus:border-zinc-900 dark:focus:border-white/40"
                  }`}
                />
                {email.length > 0 && !emailOk && (
                  <p className="mt-1.5 text-[11.5px] text-red-500 dark:text-red-300/90 px-1">Enter a valid email</p>
                )}
              </div>

              {emailError && (
                <div role="alert" className="mb-4 rounded-xl border border-red-200 dark:border-red-400/30 bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5 text-[12.5px] text-red-600 dark:text-red-300 leading-relaxed">
                  {emailError}
                </div>
              )}

              <button
                type="submit"
                disabled={!emailOk || busy}
                className="w-full py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-[14px] rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : <>Send code <ArrowRight className="size-4" /></>}
              </button>

              <p className="mt-6 text-[11px] text-center text-zinc-400 dark:text-white/40 leading-relaxed">
                By continuing you agree to our Terms &amp; Privacy.
              </p>
            </form>

            <div className="mt-8">
              <Link to="/admin-login" className="text-zinc-400 dark:text-white/40 text-sm font-medium hover:text-zinc-900 dark:hover:text-white transition-colors">
                Admin Console
              </Link>
            </div>
          </>
        ) : (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full relative"
          >
            <button
              onClick={() => {
                setAuthStep("email");
                setResendError(null);
                setResendOk(false);
                setOtpCode("");
                setOtpError(null);
              }}
              className="absolute -top-2 -left-2 inline-flex items-center gap-1.5 text-[12px] text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5" /> Back
            </button>

            <div className="text-center mb-6 mt-6">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/10 flex items-center justify-center mb-4">
                <Mail className="size-5 text-zinc-700 dark:text-white" />
              </div>
              <h1 className="text-[22px] font-bold tracking-tight text-zinc-900 dark:text-white">Check your email</h1>
              <p className="mt-2 text-[13px] text-zinc-500 dark:text-white/50">
                We sent a 6-digit code to <span className="text-zinc-900 dark:text-white font-medium">{email}</span>.
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); verifyCode(); }} className="w-full">
              <label className="block text-[13px] font-medium text-zinc-700 dark:text-white/70 mb-2 px-1">Verification code</label>
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
                className="w-full text-center tracking-[0.5em] font-mono text-[20px] py-3 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white/40 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all"
              />
              {otpError && (
                <p role="alert" className="mt-2 text-[12px] text-red-500 dark:text-red-300 text-center">{otpError}</p>
              )}
              <button
                type="submit"
                disabled={otpCode.length !== 6 || verifying}
                className="mt-4 w-full py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-[14px] rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {verifying ? <Loader2 className="size-4 animate-spin" /> : <>Verify & Sign in <ArrowRight className="size-4" /></>}
              </button>
            </form>

            {resendOk && (
              <div className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2.5 text-[12.5px] text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-4" /> New code on the way
              </div>
            )}

            {resendError && (
              <div role="alert" className="mt-4 rounded-xl border border-amber-200 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-500/10 px-3.5 py-2.5 text-[12.5px] text-amber-700 dark:text-amber-300 leading-relaxed text-center">
                Couldn't resend: {resendError}
              </div>
            )}

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => sendLink(true)}
                disabled={resending || busy || cooldownMs > 0}
                className="text-[13px] text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
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
