import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Loader2, ArrowRight, Sun, Moon, ArrowLeft, Mail } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa6";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useServerFn } from "@tanstack/react-start";
import { getMyRoles } from "@/lib/roles.functions";
import { getHydratedCareerPilotSession, persistCareerPilotSession } from "@/lib/auth-persistence";
import { useTheme } from "@/lib/theme";

type LoginSearch = { form?: "1" };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): LoginSearch => ({
    form: s.form === "1" ? "1" : undefined,
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
type AuthStep = "email" | "otp";

const SESSION_KEY = "user_session";

function LoginPage() {
  const navigate = useNavigate();
  const { form } = Route.useSearch();
  const showLoginForm = form === "1";

  const [authStep, setAuthStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<Provider | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [theme, , toggleTheme] = useTheme();

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const checkRoles = useServerFn(getMyRoles);
  const routeAfterAuth = async () => {
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
      navigate({ to: "/dashboard" });
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
    if (authStep === "otp") {
      setTimeout(() => otpRefs.current[0]?.focus(), 120);
    }
  }, [authStep]);

  if (!showLoginForm) return null;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const humanizeAuthError = (raw: string): string => {
    const m = raw.toLowerCase();
    if (m.includes("expired")) return "This code has expired. Request a new one below.";
    if (m.includes("invalid") && m.includes("token")) return "That code doesn't match. Double-check the 6 digits and try again.";
    if (m.includes("otp") && m.includes("invalid")) return "Invalid code. Please re-enter the 6 digits from your email.";
    if (m.includes("rate") || m.includes("too many") || m.includes("429")) return "Too many attempts. Please wait a minute before trying again.";
    if (m.includes("network") || m.includes("fetch")) return "Network issue. Check your connection and try again.";
    if (m.includes("not found") || m.includes("user")) return "We couldn't find that email. Try a different address.";
    return raw || "Something went wrong. Please try again.";
  };

  const sendCode = async (isResend = false) => {
    if (!emailOk) return;
    isResend ? setResending(true) : setBusy(true);
    if (isResend) setResendError(null);
    else setEmailError(null);
    setOtpError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
      toast.success(isResend ? "New code sent" : "Verification code sent");
      if (!isResend) {
        setOtp(["", "", "", "", "", ""]);
        setAuthStep("otp");
      }
    } catch (err) {
      const msg = humanizeAuthError(err instanceof Error ? err.message : "Failed to send code");
      if (isResend) setResendError(msg);
      else setEmailError(msg);
      toast.error(msg);
    } finally {
      isResend ? setResending(false) : setBusy(false);
    }
  };

  const verifyCode = async (code: string) => {
    if (code.length !== 6 || busy) return;
    setBusy(true);
    setOtpError(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });
      if (error) throw error;
      if (data.session) {
        persistCareerPilotSession(data.session, { touchLastLogin: true });
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user: data.session.user, token: data.session.access_token }));
      }
      toast.success("Welcome back.");
      await routeAfterAuth();
    } catch (err) {
      const msg = humanizeAuthError(err instanceof Error ? err.message : "Invalid or expired code");
      setOtpError(msg);
      toast.error(msg);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setBusy(false);
    }
  };

  const handleOtpChange = (i: number, val: string) => {
    if (otpError) setOtpError(null);
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
    if (next.every((d) => d.length === 1)) verifyCode(next.join(""));
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    const focusIndex = Math.min(pasted.length, 5);
    otpRefs.current[focusIndex]?.focus();
    if (pasted.length === 6) verifyCode(pasted);
  };

  const oauth = async (provider: Provider) => {
    if (oauthBusy) return;
    setOauthBusy(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/dashboard`,
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
          onClick={() => navigate({ to: "/login", search: {} })}
          className="px-4 py-2 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 text-gray-700 dark:text-white text-xs font-medium hover:bg-white dark:hover:bg-white/20 transition-all cursor-pointer"
        >
          ← Back to Zoiee
        </button>
      </div>

      <div className="relative w-full max-w-[440px] bg-white/70 dark:bg-black/40 backdrop-blur-3xl border border-gray-200 dark:border-white/10 p-10 rounded-3xl shadow-2xl">
        {authStep === "otp" && (
          <button
            onClick={() => {
              setAuthStep("email");
              setOtp(["", "", "", "", "", ""]);
              setOtpError(null);
              setResendError(null);
            }}
            className="absolute top-5 left-5 inline-flex items-center gap-1.5 text-[12px] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" /> Back to email
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
                  Enter your email — we'll send a 6-digit code.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendCode(false);
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
              key="otp"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-center mb-2 mt-4">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 dark:border-blue-400/20 flex items-center justify-center mb-4">
                  <Mail className="size-5 text-blue-500 dark:text-blue-300" />
                </div>
                <h1 className="text-[24px] font-semibold tracking-tight text-gray-900 dark:text-white">
                  Check your email
                </h1>
                <p className="mt-2 text-[13px] text-gray-500 dark:text-white/50 px-2">
                  We sent a 6-digit code to <span className="text-gray-900 dark:text-white font-medium">{email}</span>
                </p>
              </div>

              <div className="flex justify-center gap-3 my-8">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    disabled={busy}
                    className="w-12 h-14 text-center text-2xl font-semibold bg-black/5 dark:bg-white/5 border border-gray-300 dark:border-white/20 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl transition-all outline-none text-gray-900 dark:text-white disabled:opacity-50"
                  />
                ))}
              </div>

              {busy && (
                <div className="flex items-center justify-center gap-2 text-[12.5px] text-gray-500 dark:text-white/50 mb-4">
                  <Loader2 className="size-3.5 animate-spin" /> Verifying…
                </div>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => sendCode(true)}
                  disabled={resending || busy}
                  className="text-sm text-gray-500 hover:text-cyan-500 dark:hover:text-cyan-300 cursor-pointer transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {resending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  Didn't receive a code? <span className="underline underline-offset-2">Resend</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
