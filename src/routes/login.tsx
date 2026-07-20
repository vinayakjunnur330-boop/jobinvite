import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
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
    <div className="h-screen w-screen flex flex-col lg:flex-row overflow-hidden bg-black m-0 p-0 text-white">
      {/* LEFT — Cinematic Branding */}
      <aside className="hidden lg:flex w-1/2 h-full relative items-center justify-center border-r border-white/10 bg-black overflow-hidden">
        {/* Slow mesh spotlight */}
        <motion.div
          aria-hidden
          className="absolute -top-1/4 -left-1/4 w-[900px] h-[900px] rounded-full blur-[160px]"
          style={{ background: "radial-gradient(circle, rgba(34,211,238,0.18), transparent 60%)" }}
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-1/4 -right-1/4 w-[900px] h-[900px] rounded-full blur-[160px]"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.22), transparent 60%)" }}
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Grain / vignette */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />

        <div className="relative z-10 w-full max-w-[520px] px-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/40 mb-6">
              CareerPilot / Intelligent careers
            </div>
            <h1 className="text-[64px] xl:text-[80px] font-semibold tracking-[-0.03em] leading-[0.95] text-white">
              CareerPilot
              <span className="block bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent">
                AI.
              </span>
            </h1>
            <p className="mt-8 text-[15px] leading-relaxed text-white/55 max-w-md">
              The intelligent co-pilot for your career. Personalized roadmaps, real skill gaps, and
              tailored opportunities — engineered for the next decade of work.
            </p>
            <div className="mt-14 h-px w-24 bg-white/20" />
            <p className="mt-6 text-[12px] tracking-wide text-white/35">
              Trusted by 40+ career domains and thousands of ambitious professionals.
            </p>
          </motion.div>
        </div>
      </aside>

      {/* RIGHT — Login form */}
      <section className="w-full lg:w-1/2 h-full flex items-center justify-center bg-[#050505] relative overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px] px-8 py-10"
        >
          {/* Mobile brand */}
          <div className="lg:hidden mb-8 text-center">
            <div className="text-[22px] font-semibold tracking-tight">CareerPilot AI</div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-[26px] font-semibold tracking-tight leading-tight">
                {mode === "signin" ? "Sign in" : "Create account"}
              </h2>
              <p className="mt-1.5 text-[13px] text-white/45">
                {mode === "signin"
                  ? "Welcome back. Enter your details."
                  : "Start your personalized career path."}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Mode toggle — subtle underline tabs */}
          <div className="mt-7 flex items-center gap-6 border-b border-white/10">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`relative pb-3 text-[13px] font-medium transition-colors ${
                  mode === m ? "text-white" : "text-white/40 hover:text-white/70"
                }`}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
                {mode === m && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute left-0 right-0 -bottom-px h-px bg-cyan-400"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={submitAuth} className="mt-7 flex flex-col gap-4" noValidate>
            {mode === "signup" && (
              <Field id="fullName" label="Full name" value={fullName} onChange={setFullName} autoComplete="name" />
            )}
            <Field
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              error={email.length > 0 && !emailOk ? "Enter a valid email" : undefined}
            />
            <Field
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
                  className="text-white/40 hover:text-white transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
              error={mode === "signup" && password.length > 0 && password.length < 8 ? "8+ characters required" : undefined}
            />

            {mode === "signin" && (
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={() => toast.message("Password reset coming soon")}
                  className="text-[12px] text-white/45 hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit || busy}
              className="group mt-2 h-11 w-full rounded-lg font-medium text-[13.5px] text-black bg-white hover:bg-white/90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
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

            {/* Divider */}
            <div className="mt-2 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10.5px] uppercase tracking-[0.2em] text-white/35">Or continue with</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Compact social row */}
            <div className="grid grid-cols-3 gap-3">
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
                    className="h-11 flex items-center justify-center rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all text-white/70 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-[18px] h-[18px]" />}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-[11px] text-center text-white/35 leading-relaxed">
              By continuing you agree to our{" "}
              <button type="button" onClick={() => toast.message("Terms of Service")} className="text-white/60 hover:text-white underline-offset-4 hover:underline">
                Terms
              </button>{" "}
              &{" "}
              <button type="button" onClick={() => toast.message("Privacy Policy")} className="text-white/60 hover:text-white underline-offset-4 hover:underline">
                Privacy
              </button>
              .
            </p>
            <p className="text-[11.5px] text-center text-white/45">
              Administrator?{" "}
              <Link to="/admin-login" className="text-cyan-300/90 hover:text-cyan-200 underline-offset-4 hover:underline">
                Admin console
              </Link>
            </p>
          </form>
        </motion.div>
      </section>
    </div>
  );
}

// Elegant standard input (not floating)
function Field({
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
      <label htmlFor={id} className="block text-[11.5px] font-medium text-white/60 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={`h-11 w-full bg-transparent border rounded-lg px-4 ${trailing ? "pr-10" : ""} text-[13.5px] text-white placeholder-white/30 focus:outline-none focus:ring-1 transition-all ${
            error
              ? "border-red-400/40 focus:border-red-400 focus:ring-red-400/40"
              : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400"
          }`}
        />
        {trailing && <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error && <p className="mt-1 text-[11.5px] text-red-300/90">{error}</p>}
    </div>
  );
}
