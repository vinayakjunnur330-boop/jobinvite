import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowRight, Sun, Moon } from "lucide-react";
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

type Mode = "signin" | "signup";
type Provider = "google" | "apple";

const SESSION_KEY = "user_session";

function LoginPage() {
  const navigate = useNavigate();
  const { form } = Route.useSearch();
  const showLoginForm = form === "1";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<Provider | null>(null);
  const [theme, , toggleTheme] = useTheme();

  const checkRoles = useServerFn(getMyRoles);
  const routeAfterAuth = async () => {
    try {
      const r = await checkRoles();
      navigate({ to: r.isAdmin ? "/admin" : "/dashboard" });
    } catch {
      navigate({ to: "/dashboard" });
    }
  };

  // Bulletproof auth persistence
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

  // If concierge should show, render nothing (GuestConcierge overlay takes over)
  if (!showLoginForm) return null;

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
          options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: fullName.trim() } },
        });
        if (error) throw error;
        toast.success("Account created. Check your inbox to confirm.");
        setMode("signin");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          persistCareerPilotSession(data.session, { touchLastLogin: true });
          localStorage.setItem(SESSION_KEY, JSON.stringify({ user: data.session.user, token: data.session.access_token }));
        }
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
      {/* Ambient orbs */}
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

      {/* Top-right theme toggle + back */}
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

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[420px] bg-white/70 dark:bg-black/40 backdrop-blur-3xl border border-gray-200 dark:border-white/10 p-10 rounded-3xl shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="text-[10px] uppercase tracking-[0.28em] text-gray-500 dark:text-white/40 mb-3">
              CareerPilot
            </div>
            <h1 className="text-[26px] font-semibold tracking-tight text-gray-900 dark:text-white">
              {mode === "signin" ? "Sign in to CareerPilot" : "Create your account"}
            </h1>
            <p className="mt-2 text-[13px] text-gray-500 dark:text-white/50">
              {mode === "signin" ? "Welcome back. Continue your journey." : "Start your personalized career path."}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center justify-center gap-6 mb-7 border-b border-gray-200 dark:border-white/10">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`relative pb-3 text-[13px] font-medium transition-colors ${
                  mode === m
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70"
                }`}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
                {mode === m && (
                  <motion.span
                    layoutId="login-tab-underline"
                    className="absolute left-0 right-0 -bottom-px h-px bg-blue-500"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={submitAuth} className="flex flex-col gap-5" noValidate>
            {mode === "signup" && (
              <AppleField
                id="fullName"
                label="Full name"
                value={fullName}
                onChange={setFullName}
                autoComplete="name"
              />
            )}
            <AppleField
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              error={email.length > 0 && !emailOk ? "Enter a valid email" : undefined}
            />
            <AppleField
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
                  className="text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
              error={mode === "signup" && password.length > 0 && password.length < 8 ? "8+ characters required" : undefined}
            />

            {mode === "signin" && (
              <div className="flex justify-end -mt-2">
                <button
                  type="button"
                  onClick={() => toast.message("Password reset coming soon")}
                  className="text-[12px] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit || busy}
              className="group mt-1 h-11 w-full rounded-full font-medium text-[13.5px] bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "Sign In" : "Create Account"}
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
      </AnimatePresence>
    </div>
  );
}

function AppleField({
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
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-white/50 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={`bg-transparent border-b py-3 w-full outline-none transition-all text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 ${trailing ? "pr-8" : ""} ${
            error
              ? "border-red-400 focus:border-red-500"
              : "border-gray-300 dark:border-white/20 focus:border-blue-500"
          }`}
        />
        {trailing && <div className="absolute right-1 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error && <p className="mt-1 text-[11.5px] text-red-500 dark:text-red-300/90">{error}</p>}
    </div>
  );
}
