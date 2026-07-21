import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2, KeyRound, RefreshCw, Check } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaFacebookF } from "react-icons/fa6";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useServerFn } from "@tanstack/react-start";
import { getMyRoles } from "@/lib/roles.functions";
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

type View = "login" | "forgot" | "forgot_sent" | "otp_email" | "otp_verify";
const SESSION_KEY = "user_session";
const RESEND_SECONDS = 30;

function LoginPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();

  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthBusy, setOauthBusy] = useState<"google" | "apple" | null>(null);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendIn, setResendIn] = useState(0);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const checkRoles = useServerFn(getMyRoles);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const humanize = (raw: string): string => {
    const m = raw.toLowerCase();
    if (m.includes("rate") || m.includes("too many") || m.includes("429")) return "Too many attempts. Please wait a moment and try again.";
    if (m.includes("invalid login") || m.includes("invalid credentials") || m.includes("invalid_grant")) return "Email and password don't match.";
    if (m.includes("email not confirmed")) return "Please confirm your email first — check your inbox.";
    if (m.includes("user already registered")) return "An account with this email already exists.";
    if (m.includes("password") && m.includes("6")) return "Password must be at least 6 characters.";
    if (m.includes("network") || m.includes("fetch")) return "Network issue. Check your connection.";
    return raw || "Something went wrong. Please try again.";
  };

  const routeAfterAuth = async () => {
    if (next) { window.location.assign(next); return; }
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

  const signIn = async () => {
    if (!emailOk || password.length < 6 || busy) return;
    setBusy(true); setError(null);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      if (data.session) {
        persistCareerPilotSession(data.session, { touchLastLogin: true });
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user: data.session.user, token: data.session.access_token }));
      }
      toast.success("Signed in");
      await routeAfterAuth();
    } catch (err) {
      const msg = humanize(err instanceof Error ? err.message : "Sign in failed");
      setError(msg); toast.error(msg);
    } finally { setBusy(false); }
  };

  const sendReset = async () => {
    if (!emailOk || busy) return;
    setBusy(true); setError(null);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) throw err;
      setView("forgot_sent");
      toast.success("Reset link sent");
    } catch (err) {
      const msg = humanize(err instanceof Error ? err.message : "Couldn't send reset email");
      setError(msg); toast.error(msg);
    } finally { setBusy(false); }
  };

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setInterval(() => setResendIn((v) => (v <= 1 ? 0 : v - 1)), 1000);
    return () => window.clearInterval(id);
  }, [resendIn]);

  const sendOtp = async (isResend = false) => {
    if (!emailOk || busy) return;
    setBusy(true); setError(null);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (err) throw err;
      setOtp(["", "", "", "", "", ""]);
      setResendIn(RESEND_SECONDS);
      setView("otp_verify");
      toast.success(isResend ? "New code sent" : "Verification code sent");
      setTimeout(() => otpRefs.current[0]?.focus(), 60);
    } catch (err) {
      const msg = humanize(err instanceof Error ? err.message : "Couldn't send code");
      setError(msg); toast.error(msg);
    } finally { setBusy(false); }
  };

  const verifyOtp = async (codeOverride?: string) => {
    const code = (codeOverride ?? otp.join("")).trim();
    if (code.length !== 6 || busy) return;
    setBusy(true); setError(null);
    try {
      const { data, error: err } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
      if (err) throw err;
      if (data.session) {
        persistCareerPilotSession(data.session, { touchLastLogin: true });
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user: data.session.user, token: data.session.access_token }));
      }
      toast.success("Signed in");
      await routeAfterAuth();
    } catch (err) {
      const raw = err instanceof Error ? err.message.toLowerCase() : "";
      const msg = raw.includes("expired") ? "That code expired. Request a new one."
        : raw.includes("invalid") || raw.includes("token") ? "Incorrect code. Double-check and try again."
        : humanize(err instanceof Error ? err.message : "Verification failed");
      setError(msg); toast.error(msg);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 30);
    } finally { setBusy(false); }
  };

  const onOtpChange = (i: number, raw: string) => {
    const chars = raw.replace(/\D/g, "").split("");
    if (chars.length === 0) {
      const next = [...otp]; next[i] = ""; setOtp(next); return;
    }
    const next = [...otp];
    let idx = i;
    for (const c of chars) {
      if (idx > 5) break;
      next[idx] = c; idx++;
    }
    setOtp(next);
    const focusIdx = Math.min(idx, 5);
    otpRefs.current[focusIdx]?.focus();
    if (next.every((d) => d !== "") && next.join("").length === 6) {
      verifyOtp(next.join(""));
    }
  };

  const onOtpKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      const next = [...otp]; next[i - 1] = ""; setOtp(next);
      otpRefs.current[i - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && i > 0) {
      otpRefs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      otpRefs.current[i + 1]?.focus();
    }
  };



  const oauth = async (provider: "google" | "apple") => {
    if (oauthBusy) return;
    setOauthBusy(provider); setError(null);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`,
      });
      if (result.error) throw result.error;
    } catch (err) {
      const msg = humanize(err instanceof Error ? err.message : "OAuth failed");
      setError(msg); toast.error(msg); setOauthBusy(null);
    }
  };

  const unsupportedProvider = (name: string) => {
    toast.info(`${name} sign-in isn't available yet. Try Google or email.`);
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "linear-gradient(135deg, #7cb3ff 0%, #5aa0ff 50%, #4a90ff 100%)",
      }}
    >
      {/* Abstract blob shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg className="absolute -top-20 -left-20 w-[520px] h-[520px] opacity-70" viewBox="0 0 400 400" fill="none">
          <path d="M80 120 Q140 60 200 120 T320 120" stroke="url(#g1)" strokeWidth="42" strokeLinecap="round" fill="none" />
          <path d="M60 220 Q120 160 180 220 T300 220" stroke="url(#g1)" strokeWidth="34" strokeLinecap="round" fill="none" opacity="0.7" />
          <defs>
            <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#93c5fd" />
            </linearGradient>
          </defs>
        </svg>
        <svg className="absolute top-1/4 right-0 w-[560px] h-[560px] opacity-80" viewBox="0 0 400 400" fill="none">
          <path d="M320 60 Q260 120 300 200 T240 340" stroke="url(#g2)" strokeWidth="48" strokeLinecap="round" fill="none" />
          <path d="M360 140 Q300 200 340 280" stroke="url(#g2)" strokeWidth="36" strokeLinecap="round" fill="none" opacity="0.65" />
          <defs>
            <linearGradient id="g2" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#bfdbfe" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
        </svg>
        <svg className="absolute bottom-0 left-1/3 w-[520px] h-[520px] opacity-70" viewBox="0 0 400 400" fill="none">
          <path d="M80 300 Q160 240 240 300 T380 300" stroke="url(#g3)" strokeWidth="40" strokeLinecap="round" fill="none" />
          <defs>
            <linearGradient id="g3" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#7dd3fc" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Back button */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <button
          onClick={() => navigate({ to: "/" })}
          className="px-3 py-1.5 rounded-full bg-white/25 backdrop-blur-md border border-white/40 text-white text-[11px] font-medium hover:bg-white/35 transition-colors cursor-pointer"
        >
          ← Back
        </button>
      </div>

      {/* Glass card */}
      <div
        className="relative z-10 w-full max-w-[420px] rounded-3xl p-8 sm:p-10 border border-white/40 shadow-[0_20px_60px_rgba(30,58,138,0.35)]"
        style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.55) 0%, rgba(37,99,235,0.55) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {view === "login" && (
          <>
            <div className="mb-6">
              <p className="text-white/90 text-[13px] font-semibold tracking-wide">CareerPilot</p>
              <h1 className="text-white text-[34px] font-bold leading-tight mt-0.5">Login</h1>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); signIn(); }} className="space-y-4">
              <div>
                <label className="block text-white text-[13px] font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                  autoComplete="email"
                  placeholder="username@gmail.com"
                  style={{ fontSize: "16px" }}
                  className="w-full px-4 py-3 bg-white rounded-lg text-slate-900 placeholder:text-slate-400 outline-none border border-transparent focus:border-white focus:ring-2 focus:ring-white/60 transition"
                />
              </div>

              <div>
                <label className="block text-white text-[13px] font-medium mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
                    autoComplete="current-password"
                    placeholder="Password"
                    style={{ fontSize: "16px" }}
                    className="w-full px-4 py-3 pr-11 bg-white rounded-lg text-slate-900 placeholder:text-slate-400 outline-none border border-transparent focus:border-white focus:ring-2 focus:ring-white/60 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label="Toggle password"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between -mt-1">
                <button
                  type="button"
                  onClick={() => { setView("forgot"); setError(null); }}
                  className="text-white/95 text-[13px] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
                <button
                  type="button"
                  onClick={() => { setError(null); if (emailOk) sendOtp(false); else { setError("Enter your email first"); } }}
                  className="inline-flex items-center gap-1 text-white/95 text-[13px] hover:underline cursor-pointer"
                >
                  <KeyRound className="size-3.5" /> Use code instead
                </button>
              </div>

              {error && (
                <div role="alert" className="rounded-lg border border-red-300/50 bg-red-500/20 px-3.5 py-2.5 text-[12.5px] text-white">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!emailOk || password.length < 6 || busy}
                className="w-full py-3.5 rounded-lg font-semibold text-[15px] text-white bg-[#0b1e3f] hover:bg-[#0a1a36] active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
              </button>

              <p className="text-center text-white/95 text-[13px] pt-1">or continue with</p>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => oauth("google")}
                  disabled={!!oauthBusy}
                  className="flex items-center justify-center py-2.5 rounded-lg bg-white hover:bg-slate-50 shadow-md transition disabled:opacity-60 cursor-pointer"
                  aria-label="Continue with Google"
                >
                  {oauthBusy === "google" ? <Loader2 className="size-5 animate-spin text-slate-600" /> : <FcGoogle className="size-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => unsupportedProvider("GitHub")}
                  className="flex items-center justify-center py-2.5 rounded-lg bg-white hover:bg-slate-50 shadow-md transition cursor-pointer"
                  aria-label="Continue with GitHub"
                >
                  <FaGithub className="size-5 text-slate-900" />
                </button>
                <button
                  type="button"
                  onClick={() => unsupportedProvider("Facebook")}
                  className="flex items-center justify-center py-2.5 rounded-lg bg-white hover:bg-slate-50 shadow-md transition cursor-pointer"
                  aria-label="Continue with Facebook"
                >
                  <FaFacebookF className="size-5 text-[#1877F2]" />
                </button>
              </div>

              <p className="text-center text-white/95 text-[13px] pt-2">
                Don't have an account?{" "}
                <Link to="/login" search={{ form: "1" }} className="font-semibold text-white hover:underline">
                  Register for free
                </Link>
              </p>
            </form>
          </>
        )}

        {view === "forgot" && (
          <form onSubmit={(e) => { e.preventDefault(); sendReset(); }}>
            <button
              type="button"
              onClick={() => { setView("login"); setError(null); }}
              className="inline-flex items-center gap-1.5 text-white/90 text-[12px] hover:text-white cursor-pointer mb-4"
            >
              <ArrowLeft className="size-3.5" /> Back
            </button>
            <h2 className="text-white text-[26px] font-bold">Reset password</h2>
            <p className="text-white/85 text-[13px] mt-1 mb-5">Enter your email and we'll send you a secure reset link.</p>
            <label className="block text-white text-[13px] font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
              autoComplete="email"
              placeholder="username@gmail.com"
              style={{ fontSize: "16px" }}
              className="w-full px-4 py-3 bg-white rounded-lg text-slate-900 placeholder:text-slate-400 outline-none border border-transparent focus:border-white focus:ring-2 focus:ring-white/60 transition"
            />
            {error && (
              <div role="alert" className="mt-3 rounded-lg border border-red-300/50 bg-red-500/20 px-3.5 py-2.5 text-[12.5px] text-white">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={!emailOk || busy}
              className="mt-4 w-full py-3.5 rounded-lg font-semibold text-[15px] text-white bg-[#0b1e3f] hover:bg-[#0a1a36] transition disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Send reset link"}
            </button>
          </form>
        )}

        {view === "forgot_sent" && (
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-white/25 border border-white/40 flex items-center justify-center mb-4">
              <CheckCircle2 className="size-5 text-white" />
            </div>
            <h2 className="text-white text-[22px] font-bold">Check your inbox</h2>
            <p className="text-white/85 text-[13px] mt-2">
              We sent reset instructions to <span className="font-semibold text-white">{email}</span>.
            </p>
            <button
              type="button"
              onClick={() => setView("login")}
              className="mt-5 w-full py-3 rounded-lg bg-white/20 hover:bg-white/30 border border-white/40 text-white text-[13.5px] font-medium transition cursor-pointer"
            >
              Back to sign in
            </button>
          </div>
        )}
        {view === "otp_verify" && (
          <div>
            <button
              type="button"
              onClick={() => { setView("login"); setError(null); }}
              className="inline-flex items-center gap-1.5 text-white/90 text-[12px] hover:text-white cursor-pointer mb-4"
            >
              <ArrowLeft className="size-3.5" /> Back
            </button>
            <h2 className="text-white text-[26px] font-bold">Enter code</h2>
            <p className="text-white/85 text-[13px] mt-1 mb-5">
              We sent a 6-digit code to <span className="font-semibold text-white break-all">{email}</span>.
            </p>

            <div className="flex items-center justify-between gap-2 sm:gap-2.5" onPaste={(e) => {
              const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
              if (txt.length) { e.preventDefault(); onOtpChange(0, txt); }
            }}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  value={d}
                  onChange={(e) => onOtpChange(i, e.target.value)}
                  onKeyDown={(e) => onOtpKey(i, e)}
                  onFocus={(e) => e.currentTarget.select()}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  aria-label={`Digit ${i + 1}`}
                  style={{ fontSize: "20px" }}
                  className="w-11 h-14 sm:w-12 sm:h-14 text-center font-semibold bg-white rounded-lg text-slate-900 outline-none border border-transparent focus:border-white focus:ring-2 focus:ring-white/60 transition"
                />
              ))}
            </div>

            {error && (
              <div role="alert" className="mt-4 rounded-lg border border-red-300/50 bg-red-500/20 px-3.5 py-2.5 text-[12.5px] text-white">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => verifyOtp()}
              disabled={otp.join("").length !== 6 || busy}
              className="mt-5 w-full py-3.5 rounded-lg font-semibold text-[15px] text-white bg-[#0b1e3f] hover:bg-[#0a1a36] transition disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Verify & sign in"}
            </button>

            <div className="mt-4 text-center text-white/90 text-[13px]">
              Didn't get the code?{" "}
              <button
                type="button"
                onClick={() => sendOtp(true)}
                disabled={resendIn > 0 || busy}
                className="font-semibold text-white hover:underline disabled:opacity-60 disabled:no-underline disabled:cursor-not-allowed"
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <Link to="/admin-login" className="text-white/70 text-[12px] hover:text-white transition-colors">
          Admin Console
        </Link>
      </div>
    </div>
  );
}
