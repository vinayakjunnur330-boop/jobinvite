import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowLeft, Mail, Lock, KeyRound, ArrowRight, CheckCircle2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaFacebookF, FaApple } from "react-icons/fa6";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { persistCareerPilotSession } from "@/lib/auth-persistence";

type LoginSearch = { next?: string };

function sanitizeNext(v: unknown): string | undefined {
  if (typeof v !== "string" || !v.startsWith("/") || v.startsWith("//")) return undefined;
  return v;
}

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): LoginSearch => ({
    next: sanitizeNext(s.next),
  }),
  head: () => ({
    meta: [
      { title: "Sign in — CareerPilot AI" },
      { name: "description", content: "Sign in to CareerPilot AI — your intelligent career co-pilot." },
    ],
  }),
  component: LoginPage,
});

type Mode = "password" | "otp" | "forgot" | "signup";
type OtpStage = "request" | "verify";

const RESEND_SECONDS = 30;

function LoginPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const dest = next || "/dashboard";

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<string | null>(null);

  // OTP state
  const [otpStage, setOtpStage] = useState<OtpStage>("request");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [resendIn, setResendIn] = useState(0);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Forgot success state
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  const humanize = (raw: string) => {
    const m = raw.toLowerCase();
    if (m.includes("invalid login")) return "Wrong email or password.";
    if (m.includes("user already")) return "An account with this email already exists.";
    if (m.includes("email not confirmed")) return "Please confirm your email first.";
    if (m.includes("token has expired") || m.includes("invalid") && m.includes("otp")) return "That code is invalid or expired.";
    if (m.includes("rate") || m.includes("429")) return "Too many attempts. Please wait a moment.";
    return raw || "Something went wrong.";
  };

  const goHome = () => navigate({ to: "/" });

  const afterAuth = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) persistCareerPilotSession(data.session, { touchLastLogin: true });
    toast.success("Welcome back!");
    navigate({ to: dest });
  };

  // --- Handlers ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      await afterAuth();
    } catch (err) {
      toast.error(humanize(err instanceof Error ? err.message : "Sign in failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirm) return toast.error("Passwords don't match.");
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin + "/auth/callback" },
      });
      if (error) throw error;
      if (data.session) {
        await afterAuth();
      } else {
        toast.success("Check your email to confirm your account.");
        setMode("password");
      }
    } catch (err) {
      toast.error(humanize(err instanceof Error ? err.message : "Sign up failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw error;
      setForgotSent(true);
      toast.success("Reset link sent — check your inbox.");
    } catch (err) {
      toast.error(humanize(err instanceof Error ? err.message : "Couldn't send reset link"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendOtp = async () => {
    if (isSubmitting) return;
    if (!email.trim()) return toast.error("Enter your email first.");
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true, emailRedirectTo: window.location.origin + "/auth/callback" },
      });
      if (error) throw error;
      setOtpStage("verify");
      setResendIn(RESEND_SECONDS);
      setOtp(Array(6).fill(""));
      toast.success("Code sent to your email.");
      setTimeout(() => otpRefs.current[0]?.focus(), 80);
    } catch (err) {
      toast.error(humanize(err instanceof Error ? err.message : "Couldn't send code"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtp = async (token: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token, type: "email" });
      if (error) throw error;
      await afterAuth();
    } catch (err) {
      toast.error(humanize(err instanceof Error ? err.message : "Invalid code"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "").slice(-1);
    const arr = [...otp];
    arr[i] = clean;
    setOtp(arr);
    if (clean && i < 5) otpRefs.current[i + 1]?.focus();
    if (arr.every((c) => c) && arr.join("").length === 6) verifyOtp(arr.join(""));
  };

  const handleOtpKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const arr = text.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(arr);
    if (text.length === 6) verifyOtp(text);
    else otpRefs.current[text.length]?.focus();
  };

  const handleOAuth = async (provider: "google" | "apple" | "github" | "facebook") => {
    if (oauthBusy) return;
    setOauthBusy(provider);
    try {
      if (provider === "google" || provider === "apple") {
        const res = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth/callback" });
        if (res.error) throw res.error instanceof Error ? res.error : new Error(String(res.error));
        if (res.redirected) return;
        await afterAuth();
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: window.location.origin + "/auth/callback" },
        });
        if (error) throw error;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      toast.error(msg.toLowerCase().includes("provider") ? `${provider} sign-in isn't enabled yet.` : humanize(msg));
    } finally {
      setOauthBusy(null);
    }
  };

  // --- UI helpers ---
  const inputCls =
    "w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder:text-white/35 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15 transition disabled:opacity-50";

  const primaryBtn =
    "w-full py-3.5 rounded-xl font-semibold text-[14px] text-black bg-gradient-to-r from-cyan-300 to-white hover:opacity-95 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(34,211,238,0.25)]";

  const linkBtn = "text-[12.5px] text-white/60 hover:text-cyan-300 transition cursor-pointer";

  const title =
    mode === "signup" ? "Create your account"
    : mode === "forgot" ? "Reset your password"
    : mode === "otp" ? (otpStage === "verify" ? "Enter your code" : "Sign in with a code")
    : "Sign in to your account";

  const subtitle =
    mode === "signup" ? "Start your journey with CareerPilot AI."
    : mode === "forgot" ? (forgotSent ? "Check your inbox for the reset link." : "We'll email you a secure reset link.")
    : mode === "otp" ? (otpStage === "verify" ? `We sent a 6-digit code to ${email}` : "We'll send a one-time code to your email.")
    : "Welcome back — let's continue.";

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-[#050505] p-4 text-white relative overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-cyan-500/15 blur-[130px]" />
        <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-indigo-500/15 blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
      </div>

      {/* Back to home */}
      <button
        onClick={goHome}
        className="absolute top-5 left-5 z-20 inline-flex items-center gap-1.5 text-[12.5px] text-white/60 hover:text-white transition cursor-pointer"
      >
        <ArrowLeft className="size-4" /> Back
      </button>

      <div className="w-full max-w-[420px] bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-10">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/25 to-indigo-500/25 border border-white/10 flex items-center justify-center mb-4">
            {mode === "forgot" && forgotSent ? <CheckCircle2 className="size-5 text-emerald-300" /> : <KeyRound className="size-5 text-cyan-300" />}
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
          <p className="text-white/50 text-[13px] mt-1">{subtitle}</p>
        </div>

        {/* ========== PASSWORD MODE ========== */}
        {mode === "password" && (
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="block text-[12.5px] font-medium text-white/70 mb-2 px-1">Email</label>
              <div className="relative">
                <Mail className="size-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email" required disabled={isSubmitting} value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" autoComplete="email"
                  style={{ fontSize: "16px" }} className={inputCls + " pl-10"}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <label className="text-[12.5px] font-medium text-white/70">Password</label>
                <button type="button" onClick={() => setMode("forgot")} className={linkBtn}>Forgot password?</button>
              </div>
              <div className="relative">
                <Lock className="size-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPw ? "text" : "password"} required disabled={isSubmitting} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  style={{ fontSize: "16px" }} className={inputCls + " pl-10 pr-11"}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer" aria-label="Toggle password">
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className={primaryBtn}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <>Sign in <ArrowRight className="size-4" /></>}
            </button>
            <button type="button" onClick={() => { setMode("otp"); setOtpStage("request"); }} className="w-full py-2 text-[12.5px] text-white/60 hover:text-cyan-300 transition cursor-pointer inline-flex items-center justify-center gap-1.5">
              <KeyRound className="size-3.5" /> Use code instead
            </button>
          </form>
        )}

        {/* ========== OTP MODE ========== */}
        {mode === "otp" && (
          <div className="space-y-3.5">
            {otpStage === "request" ? (
              <>
                <div>
                  <label className="block text-[12.5px] font-medium text-white/70 mb-2 px-1">Email</label>
                  <div className="relative">
                    <Mail className="size-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email" disabled={isSubmitting} value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" autoComplete="email"
                      style={{ fontSize: "16px" }} className={inputCls + " pl-10"}
                    />
                  </div>
                </div>
                <button onClick={sendOtp} disabled={isSubmitting} className={primaryBtn}>
                  {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <>Send code <ArrowRight className="size-4" /></>}
                </button>
              </>
            ) : (
              <>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((v, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1} value={v}
                      disabled={isSubmitting}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKey(i, e)}
                      style={{ fontSize: "18px" }}
                      className="w-11 h-13 aspect-square text-center font-semibold bg-white/[0.04] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition"
                    />
                  ))}
                </div>
                <button
                  onClick={() => verifyOtp(otp.join(""))}
                  disabled={isSubmitting || otp.join("").length !== 6}
                  className={primaryBtn}
                >
                  {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <>Verify code <ArrowRight className="size-4" /></>}
                </button>
                <div className="flex items-center justify-between text-[12.5px] text-white/50 px-1">
                  <button
                    onClick={sendOtp}
                    disabled={isSubmitting || resendIn > 0}
                    className="hover:text-cyan-300 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                  </button>
                  <button onClick={() => setOtpStage("request")} className={linkBtn}>Change email</button>
                </div>
              </>
            )}
            <button
              type="button"
              onClick={() => { setMode("password"); setOtpStage("request"); }}
              className="w-full py-2 text-[12.5px] text-white/60 hover:text-cyan-300 transition cursor-pointer"
            >
              Use password instead
            </button>
          </div>
        )}

        {/* ========== FORGOT MODE ========== */}
        {mode === "forgot" && (
          <div className="space-y-3.5">
            {forgotSent ? (
              <div className="text-center rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-4 text-[13px] text-emerald-200">
                A password-reset link is on its way to <span className="font-semibold">{email}</span>.
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-3.5">
                <div>
                  <label className="block text-[12.5px] font-medium text-white/70 mb-2 px-1">Email</label>
                  <div className="relative">
                    <Mail className="size-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email" required disabled={isSubmitting} value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" autoComplete="email"
                      style={{ fontSize: "16px" }} className={inputCls + " pl-10"}
                    />
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className={primaryBtn}>
                  {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <>Send reset link <ArrowRight className="size-4" /></>}
                </button>
              </form>
            )}
            <button
              type="button"
              onClick={() => { setMode("password"); setForgotSent(false); }}
              className="w-full py-2 text-[12.5px] text-white/60 hover:text-cyan-300 transition cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="size-3.5" /> Back to sign in
            </button>
          </div>
        )}

        {/* ========== SIGNUP MODE ========== */}
        {mode === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-[12.5px] font-medium text-white/70 mb-2 px-1">Email</label>
              <div className="relative">
                <Mail className="size-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email" required disabled={isSubmitting} value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" autoComplete="email"
                  style={{ fontSize: "16px" }} className={inputCls + " pl-10"}
                />
              </div>
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-white/70 mb-2 px-1">Password</label>
              <div className="relative">
                <Lock className="size-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPw ? "text" : "password"} required disabled={isSubmitting} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters" autoComplete="new-password"
                  style={{ fontSize: "16px" }} className={inputCls + " pl-10 pr-11"}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer" aria-label="Toggle password">
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-white/70 mb-2 px-1">Confirm password</label>
              <input
                type={showPw ? "text" : "password"} required disabled={isSubmitting} value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password" autoComplete="new-password"
                style={{ fontSize: "16px" }} className={inputCls}
              />
            </div>
            <button type="submit" disabled={isSubmitting} className={primaryBtn}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <>Create account <ArrowRight className="size-4" /></>}
            </button>
          </form>
        )}

        {/* Divider + Social */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] uppercase tracking-widest text-white/40">or continue with</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "google" as const, icon: <FcGoogle className="size-5" />, label: "Google" },
            { id: "apple" as const, icon: <FaApple className="size-5 text-white" />, label: "Apple" },
            { id: "github" as const, icon: <FaGithub className="size-5 text-white" />, label: "GitHub" },
            { id: "facebook" as const, icon: <FaFacebookF className="size-5 text-[#1877F2]" />, label: "Facebook" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => handleOAuth(p.id)}
              disabled={!!oauthBusy}
              aria-label={`Continue with ${p.label}`}
              className="h-11 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition disabled:opacity-50 cursor-pointer inline-flex items-center justify-center"
            >
              {oauthBusy === p.id ? <Loader2 className="size-4 animate-spin text-white/70" /> : p.icon}
            </button>
          ))}
        </div>

        {/* Footer swap */}
        <p className="mt-6 text-center text-[12.5px] text-white/50">
          {mode === "signup" ? (
            <>Already have an account?{" "}
              <button onClick={() => setMode("password")} className="text-cyan-300 hover:text-cyan-200 font-medium cursor-pointer">Sign in</button>
            </>
          ) : (
            <>New to CareerPilot?{" "}
              <button onClick={() => setMode("signup")} className="text-cyan-300 hover:text-cyan-200 font-medium cursor-pointer">Register for free</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
