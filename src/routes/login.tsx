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
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center bg-[#050505] overflow-hidden text-white">
      {/* Cinematic full-screen background */}
      <div className="absolute inset-0 z-0 bg-[#050505]" aria-hidden />
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="bg-purple-600/15 blur-[150px] w-[800px] h-[800px] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="bg-indigo-600/10 blur-[140px] w-[600px] h-[600px] rounded-full absolute top-1/4 -right-40" />
        <div className="bg-crimson-600/10 blur-[140px] w-[600px] h-[600px] rounded-full absolute -bottom-40 left-1/4" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      {/* Desktop-proportioned glass card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[480px] bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-10 md:p-12 rounded-3xl flex flex-col gap-8"
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
        <div className="relative grid grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1">
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
              type={showPw ?=