import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Lock, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — CareerPilot AI" },
      { name: "description", content: "Access your CareerPilot AI flight deck." },
    ],
  }),
  component: LoginGateway,
});

type Provider = "google" | "github" | "apple" | "linkedin" | "reddit";

const PROVIDERS: { id: Provider; label: string; bg: string; icon: JSX.Element }[] = [
  { id: "google", label: "Google",   bg: "hover:bg-white hover:text-slate-900",
    icon: <svg viewBox="0 0 24 24" className="size-5"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1A6.2 6.2 0 1 1 12 5.8a5.6 5.6 0 0 1 4 1.55l2.7-2.6A9.7 9.7 0 1 0 12 21.8c5.6 0 9.3-3.9 9.3-9.5 0-.65-.07-1.15-.16-1.65H12Z"/></svg> },
  { id: "github", label: "GitHub",   bg: "hover:bg-slate-100 hover:text-slate-900",
    icon: <svg viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M12 1.3A10.7 10.7 0 0 0 1.3 12c0 4.73 3.07 8.74 7.32 10.16.54.1.74-.23.74-.52v-1.9c-2.98.65-3.6-1.27-3.6-1.27-.49-1.25-1.2-1.58-1.2-1.58-.98-.67.07-.66.07-.66 1.08.08 1.65 1.11 1.65 1.11.96 1.65 2.52 1.17 3.14.9.1-.7.38-1.18.69-1.45-2.38-.27-4.88-1.19-4.88-5.3 0-1.17.42-2.13 1.1-2.88-.11-.27-.48-1.36.1-2.84 0 0 .9-.29 2.95 1.1A10.2 10.2 0 0 1 12 6.7c.91 0 1.83.12 2.69.36 2.05-1.39 2.95-1.1 2.95-1.1.58 1.48.22 2.57.11 2.84.68.75 1.1 1.71 1.1 2.88 0 4.12-2.5 5.02-4.89 5.29.38.33.73 1 .73 2.02v3c0 .29.2.63.75.52A10.7 10.7 0 0 0 22.7 12 10.7 10.7 0 0 0 12 1.3Z"/></svg> },
  { id: "apple",  label: "Apple",    bg: "hover:bg-white hover:text-black",
    icon: <svg viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M16.4 12.7c0-2.6 2.1-3.8 2.2-3.9-1.2-1.7-3-2-3.7-2-1.6-.16-3.1.93-3.9.93-.8 0-2-.9-3.4-.88-1.7.02-3.3 1-4.2 2.5-1.8 3.1-.46 7.7 1.3 10.2.86 1.2 1.88 2.6 3.2 2.55 1.3-.05 1.78-.83 3.34-.83s2 .83 3.36.8c1.4-.02 2.27-1.25 3.12-2.46.98-1.4 1.38-2.78 1.4-2.85-.03-.01-2.7-1.03-2.72-4.06ZM14.04 4.1c.72-.88 1.2-2.1 1.07-3.3-1.03.04-2.28.69-3 1.56-.66.78-1.24 2.02-1.08 3.2 1.14.1 2.31-.58 3-1.46Z"/></svg> },
  { id: "linkedin", label: "LinkedIn", bg: "hover:bg-[#0A66C2] hover:text-white",
    icon: <svg viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg> },
  { id: "reddit", label: "Reddit",   bg: "hover:bg-[#FF4500] hover:text-white",
    icon: <svg viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M22 12.14a2.14 2.14 0 0 0-3.62-1.54 10.5 10.5 0 0 0-5.7-1.8l.97-4.57 3.18.68a1.53 1.53 0 1 0 .15-.93l-3.55-.76a.46.46 0 0 0-.55.36L11.83 8.8a10.5 10.5 0 0 0-5.78 1.8 2.14 2.14 0 1 0-2.36 3.5 4.2 4.2 0 0 0-.05.66c0 3.36 3.9 6.08 8.71 6.08s8.7-2.72 8.7-6.08c0-.22-.02-.43-.05-.64A2.14 2.14 0 0 0 22 12.14Zm-14 1.5a1.43 1.43 0 1 1 2.86 0 1.43 1.43 0 0 1-2.86 0Zm8.06 3.84a4.97 4.97 0 0 1-3.74 1.29h-.02a4.97 4.97 0 0 1-3.74-1.29.39.39 0 1 1 .56-.55c.7.7 1.99 1.06 3.18 1.06h.02c1.19 0 2.48-.36 3.18-1.06a.39.39 0 0 1 .56.55Zm-.32-2.4a1.43 1.43 0 1 1 0-2.85 1.43 1.43 0 0 1 0 2.85Z"/></svg> },
];

function setMockSession(provider: Provider) {
  try {
    localStorage.setItem("cp_mock_auth", JSON.stringify({
      provider, signedInAt: Date.now(),
      name: provider === "google" ? "Alex Morgan" : provider.charAt(0).toUpperCase() + provider.slice(1) + " User",
    }));
  } catch {}
}

export function isAuthed() {
  if (typeof window === "undefined") return false;
  try { return !!localStorage.getItem("cp_mock_auth"); } catch { return false; }
}

function LoginGateway() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loadingProvider, setLoadingProvider] = useState<Provider | "email" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (isAuthed()) navigate({ to: "/dashboard" });
  }, [navigate]);

  const handleOAuth = async (p: Provider) => {
    setLoadingProvider(p);
    await new Promise((r) => setTimeout(r, 900));
    setMockSession(p);
    setTransitioning(true);
    await new Promise((r) => setTimeout(r, 700));
    navigate({ to: "/dashboard" });
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || password.length < 6) {
      toast.error("Enter a valid email and a password (6+ chars).");
      return;
    }
    setLoadingProvider("email");
    await new Promise((r) => setTimeout(r, 900));
    setMockSession("google");
    setTransitioning(true);
    await new Promise((r) => setTimeout(r, 700));
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#070A13] text-white">
      {/* Cosmic ambient backdrop */}
      <div className="absolute inset-0 cosmic-bg" />
      <div className="absolute inset-0 grid-bg radial-fade opacity-40" />
      <motion.div
        aria-hidden
        className="absolute -top-32 -left-24 size-[480px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.5), transparent 60%)" }}
        animate={{ x: [0, 30, -10, 0], y: [0, 20, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-32 -right-24 size-[520px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.45), transparent 60%)" }}
        animate={{ x: [0, -25, 15, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#070A13] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1.05, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <div className="size-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-[0_0_60px_rgba(99,102,241,0.6)]">
                <Sparkles className="size-8 text-white" />
              </div>
              <div className="mt-4 text-sm font-mono tracking-widest text-indigo-200">ENTERING FLIGHT DECK</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 min-h-[100dvh] grid lg:grid-cols-2">
        {/* Brand panel */}
        <div className="hidden lg:flex flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Sparkles className="size-5 text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg">CareerPilot AI</span>
          </div>
          <div className="max-w-md">
            <div className="font-mono text-xs text-indigo-300 tracking-widest mb-3">FLIGHT_DECK_v4.2</div>
            <h1 className="text-5xl font-extrabold tracking-tight leading-[1.05]">
              Navigate your career like a <span className="text-gradient-brand">first-class pilot</span>.
            </h1>
            <p className="mt-5 text-slate-400 text-[15px] leading-relaxed">
              AI-graded resumes, mentor-matched roadmaps, and a real-time job market radar — built for ambitious engineers, designers, and operators.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
              {[
                { v: "94%", l: "ATS pass rate" },
                { v: "2.4k+", l: "Career paths" },
                { v: "180+", l: "Tracked skills" },
              ].map((s) => (
                <div key={s.l} className="rounded-lg border border-slate-800 px-3 py-3">
                  <div className="text-lg font-bold text-white">{s.v}</div>
                  <div className="text-slate-500 font-mono uppercase tracking-wider mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400" />
            SOC 2 Type II · End-to-end encrypted · GDPR ready
          </div>
        </div>

        {/* Auth card */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md glass-strong rounded-3xl p-8 shadow-2xl"
            style={{ boxShadow: "0 0 0 1px rgba(99,102,241,0.18), 0 40px 100px -20px rgba(0,0,0,0.7), 0 0 80px -20px rgba(99,102,241,0.35)" }}
          >
            <div className="flex items-center justify-between mb-7">
              <div>
                <div className="font-mono text-[10px] text-indigo-300 tracking-widest">{mode === "signin" ? "RETURNING_PILOT" : "NEW_PILOT"}</div>
                <h2 className="text-2xl font-bold tracking-tight mt-1">
                  {mode === "signin" ? "Welcome back" : "Create your account"}
                </h2>
              </div>
              <div className="flex rounded-full border border-slate-800 p-0.5 bg-slate-950/60 text-xs">
                {(["signin", "signup"] as const).map((m) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`px-3 py-1.5 rounded-full font-medium transition ${mode === m ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}>
                    {m === "signin" ? "Sign in" : "Sign up"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-5">
              {PROVIDERS.map((p) => (
                <motion.button
                  key={p.id}
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                  onClick={() => handleOAuth(p.id)}
                  disabled={!!loadingProvider}
                  title={`Continue with ${p.label}`}
                  className={`relative h-11 rounded-xl border border-slate-800 bg-slate-950/50 flex items-center justify-center transition-all ${p.bg} disabled:opacity-50`}
                >
                  {loadingProvider === p.id ? <Loader2 className="size-4 animate-spin" /> : p.icon}
                </motion.button>
              ))}
            </div>

            <div className="flex items-center gap-3 my-5 text-[10px] font-mono tracking-widest text-slate-500">
              <div className="flex-1 h-px bg-slate-800" />
              OR CONTINUE WITH EMAIL
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            <form onSubmit={handleEmail} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full h-11 rounded-xl bg-slate-950/60 border border-slate-800 pl-10 pr-3 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                <input
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 rounded-xl bg-slate-950/60 border border-slate-800 pl-10 pr-3 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit" disabled={!!loadingProvider}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(99,102,241,0.45)] transition-shadow disabled:opacity-60"
              >
                {loadingProvider === "email" ? <Loader2 className="size-4 animate-spin" /> : <>
                  {mode === "signin" ? "Sign in to dashboard" : "Create account"} <ArrowRight className="size-4" />
                </>}
              </motion.button>
            </form>

            <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
              <button className="hover:text-indigo-300 transition">Forgot password?</button>
              <span>By continuing you agree to our Terms.</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
