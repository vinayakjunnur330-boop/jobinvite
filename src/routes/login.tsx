import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaGithub, FaFacebook, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useServerFn } from "@tanstack/react-start";
import { getMyRoles } from "@/lib/roles.functions";
import { getHydratedCareerPilotSession, persistCareerPilotSession } from "@/lib/auth-persistence";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "CareerPilot AI — Sign in" },
      { name: "description", content: "Sign in to CareerPilot AI — your intelligent career co-pilot." },
    ],
  }),
  component: LoginPage,
});

type Mode = "signin" | "signup";
type Provider = "google" | "apple" | "github" | "facebook" | "instagram" | "twitter";

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<Provider | null>(null);

  const checkRoles = useServerFn(getMyRoles);
  const routeAfterAuth = async () => {
    try {
      const r = await checkRoles();
      navigate({ to: r.isAdmin ? "/admin" : "/workspace" });
    } catch {
      navigate({ to: "/workspace" });
    }
  };

  useEffect(() => {
    getHydratedCareerPilotSession().then((s) => { if (s) routeAfterAuth(); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = emailOk && password.length >= 8 && (mode === "signin" || fullName.trim().length >= 2);

  const submitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/workspace`, data: { full_name: fullName.trim() } },
        });
        if (error) throw error;
        toast.success("Account created. Check your inbox to confirm.");
        setMode("signin");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) persistCareerPilotSession(data.session, { touchLastLogin: true });
        toast.success("Welcome back.");
        await routeAfterAuth();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (provider: Provider) => {
    if (oauthBusy) return;
    if (provider !== "google" && provider !== "apple") {
      toast.info(
        `${provider[0].toUpperCase() + provider.slice(1)} sign-in is coming soon. Please continue with Google or Apple for now.`,
      );
      return;
    }
    setOauthBusy(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/workspace`,
      });
      if (result.error) throw result.error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "OAuth failed");
      setOauthBusy(null);
    }
  };

  const socials: { id: Provider; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "google", label: "Google", Icon: (p) => <FcGoogle {...p} /> },
    { id: "apple", label: "Apple", Icon: (p) => <FaApple {...p} /> },
    { id: "github", label: "GitHub", Icon: (p) => <FaGithub {...p} /> },
    { id: "facebook", label: "Facebook", Icon: (p) => <FaFacebook {...p} className={`${p.className ?? ""} text-[#1877F2]`} /> },
    { id: "instagram", label: "Instagram", Icon: (p) => <FaInstagram {...p} className={`${p.className ?? ""} text-[#E1306C]`} /> },
    { id: "twitter", label: "X", Icon: (p) => <FaXTwitter {...p} /> },
  ];

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden text-white">
      {/* Cinematic mesh gradient background */}
      <div className="absolute inset-0 bg-[#050508]" aria-hidden />
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute -top-40 -left-40 h-[70vw] w-[70vw] rounded-full blur-[140px] opacity-70"
          style={{ background: "radial-gradient(circle at 30% 30%, #4c1d95 0%, transparent 60%)" }}
          animate={{ x: [0, 80, -40, 0], y: [0, 60, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 h-[60vw] w-[60vw] rounded-full blur-[140px] opacity-60"
          style={{ background: "radial-gradient(circle at 50% 50%, #7c1d3f 0%, transparent 60%)" }}
          animate={{ x: [0, -80, 40, 0], y: [0, -60, 30, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 left-1/4 h-[55vw] w-[55vw] rounded-full blur-[140px] opacity-50"
          style={{ background: "radial-gradient(circle at 50% 50%, #1e1b4b 0%, transparent 60%)" }}
          animate={{ x: [0, 40, -60, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* Card */}
      <div className="relative h-full w-full flex items-center justify-center overflow-y-auto p-4 sm:p-8">
        {/* Ambient glow behind glass */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/20 blur-[120px]"
        />
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[540px] mx-auto rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] p-10 md:p-14 flex flex-col gap-8"
        >
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="relative grid place-items-center size-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[0_8px_24px_-8px_rgba(168,85,247,0.7)]">
              <Sparkles className="size-5 text-white" />
            </span>
            <div>
              <div className="text-[15px] font-semibold tracking-tight">CareerPilot AI</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Intelligent Careers</div>
            </div>
          </div>


          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-tight leading-tight">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-2 text-[14px] text-white/50">
                {mode === "signin" ? "Sign in to continue your journey." : "Start your personalized career path today."}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Mode toggle */}
          <div className="relative mt-6 grid grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`relative z-10 py-2.5 text-[13px] font-medium transition-colors ${
                  mode === m ? "text-white" : "text-white/50 hover:text-white/80"
                }`}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white/10 border border-white/10 shadow-[0_4px_16px_rgba(139,92,246,0.3)]"
              style={{ left: mode === "signin" ? 4 : "calc(50% + 0px)" }}
              aria-hidden
            />
          </div>

          <form onSubmit={submitAuth} className="flex flex-col gap-8" noValidate>
            <div className="space-y-4">
              {mode === "signup" && (

              <FloatField id="fullName" label="Full name" value={fullName} onChange={setFullName} autoComplete="name" />
            )}
            <FloatField
              id="email"
              type="email"
              label="Email address"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              error={email.length > 0 && !emailOk ? "Enter a valid email" : undefined}
            />
            <FloatField
              id="password"
              type={showPw ? "text" : "password"}
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="text-white/50 hover:text-white transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
              error={mode === "signup" && password.length > 0 && password.length < 8 ? "8+ characters required" : undefined}
            />
            </div>

            <button

              type="submit"
              disabled={!canSubmit || busy}
              className="group relative w-full h-12 rounded-xl font-semibold text-[14px] text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-[0_8px_32px_-8px_rgba(168,85,247,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {busy ? <Loader2 className="size-4 animate-spin" /> : mode === "signin" ? "Sign In" : "Create Account"}
                {!busy && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 pt-2">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">Or continue with</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Social grid */}
            <div className="grid grid-cols-3 gap-4">
              {socials.map(({ id, label, Icon }) => {
                const loading = oauthBusy === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => oauth(id)}
                    disabled={!!oauthBusy}
                    aria-label={`Continue with ${label}`}
                    title={`Continue with ${label}`}
                    className="group relative aspect-square flex items-center justify-center rounded-2xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-white/80" />
                    ) : (
                      <Icon className="w-6 h-6 text-white" />
                    )}
                  </button>
                );
              })}
            </div>


            <p className="text-[11px] text-center text-white/40 pt-2">
              By continuing you agree to our{" "}
              <button type="button" onClick={() => toast.message("Terms of Service")} className="text-white/70 hover:text-white underline-offset-4 hover:underline">
                Terms
              </button>{" "}
              &{" "}
              <button type="button" onClick={() => toast.message("Privacy Policy")} className="text-white/70 hover:text-white underline-offset-4 hover:underline">
                Privacy
              </button>
              .
            </p>
            <p className="text-[12px] text-center text-white/50">
              Administrator?{" "}
              <Link to="/admin-login" className="text-violet-300 hover:text-violet-200 underline-offset-4 hover:underline">
                Admin console
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

// ────────────────────────────── Floating-label input ──────────────────────────────
function FloatField({
  id, label, value, onChange, type = "text", autoComplete, error, trailing,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  error?: string;
  trailing?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <div>
      <div
        className={`relative rounded-xl border bg-white/5 transition-all duration-200 ${
          error
            ? "border-red-400/40"
            : focused
              ? "border-white/20 ring-2 ring-white/20"
              : "border-white/10"
        }`}
      >
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-3 transition-all duration-200 ${
            active
              ? "top-1.5 text-[10px] uppercase tracking-[0.15em] text-white/50"
              : "top-1/2 -translate-y-1/2 text-[14px] text-white/40"
          }`}
        >
          {label}
        </label>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          className="w-full h-14 bg-transparent px-3 pt-5 pb-1 pr-10 text-[14px] text-white placeholder-transparent focus:outline-none"
        />
        {trailing && <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error && <p className="mt-1.5 text-[12px] text-red-300/90">{error}</p>}
    </div>
  );
}
