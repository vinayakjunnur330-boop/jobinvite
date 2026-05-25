import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — CareerPilot AI" },
      { name: "description", content: "Sign in or create an account on CareerPilot AI." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back ✨");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const social = async (provider: "google" | "apple") => {
    setBusy(true);
    try {
      const res = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/dashboard" });
      if (res.error) throw res.error instanceof Error ? res.error : new Error(String(res.error));
      if (!res.redirected) navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  const isSignup = mode === "signup";

  return (
    <div className="auth-page relative min-h-[calc(100vh-4rem)] w-full overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Animated background */}
      <div className="ap-bg" aria-hidden />
      <motion.div
        aria-hidden
        className="ap-orb ap-orb-1"
        animate={{ x: [0, 60, -40, 0], y: [0, -50, 40, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="ap-orb ap-orb-2"
        animate={{ x: [0, -70, 50, 0], y: [0, 60, -30, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="ap-orb ap-orb-3"
        animate={{ x: [0, 40, -60, 0], y: [0, -40, 30, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="ap-grid" aria-hidden />
      <Particles />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="ap-card-wrap"
        >
          <div className="ap-card-border" aria-hidden />
          <div className="ap-card">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="ap-logo mx-auto mb-4"
              >
                <Sparkles className="size-6 text-white" />
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.h1
                  key={mode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="ap-title"
                >
                  {isSignup ? "Create Account" : "Welcome Back"}
                </motion.h1>
              </AnimatePresence>
              <p className="ap-subtitle">
                {isSignup ? "Start your career journey today" : "Sign in to continue your journey"}
              </p>
            </div>

            {/* Toggle */}
            <div className="ap-toggle">
              <motion.div
                className="ap-toggle-pill"
                animate={{ x: isSignup ? "100%" : "0%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`ap-toggle-btn ${!isSignup ? "ap-toggle-active" : ""}`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`ap-toggle-btn ${isSignup ? "ap-toggle-active" : ""}`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-3.5 mt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: isSignup ? 30 : -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isSignup ? -30 : 30 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-3.5"
                >
                  {isSignup && (
                    <FloatingInput
                      icon={<UserIcon className="size-4" />}
                      label="Full Name"
                      type="text"
                      value={name}
                      onChange={setName}
                      required
                    />
                  )}
                  <FloatingInput
                    icon={<Mail className="size-4" />}
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    required
                  />
                  <FloatingInput
                    icon={<Lock className="size-4" />}
                    label="Password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={setPassword}
                    required
                    suffix={
                      <button type="button" onClick={() => setShowPw((s) => !s)} className="text-white/40 hover:text-pink-300 transition-colors">
                        {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    }
                  />
                </motion.div>
              </AnimatePresence>

              {!isSignup && (
                <div className="flex justify-end">
                  <button type="button" className="ap-forgot text-xs">
                    Forgot password?
                  </button>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={busy}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="ap-submit w-full mt-2"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {busy ? (
                    <><span className="ap-spinner" /> Please wait…</>
                  ) : (
                    <>{isSignup ? "Sign Up" : "Log In"} <ArrowRight className="size-4" /></>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">or continue with</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </div>

            {/* Social */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => social("google")}
                disabled={busy}
                className="ap-social"
              >
                <svg className="size-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
                Google
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => social("apple")}
                disabled={busy}
                className="ap-social"
              >
                <svg className="size-4 fill-white" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                Apple
              </motion.button>
            </div>

            <p className="text-center text-[11px] text-white/40 mt-6">
              By continuing, you agree to our{" "}
              <Link to="/about" className="text-pink-300/80 hover:text-pink-300 transition-colors">Terms</Link>
              {" "}&{" "}
              <Link to="/about" className="text-pink-300/80 hover:text-pink-300 transition-colors">Privacy</Link>.
            </p>
          </div>
        </motion.div>
      </motion.div>

      <style>{css}</style>
    </div>
  );
}

function FloatingInput({
  icon, label, type, value, onChange, required, suffix,
}: {
  icon: React.ReactNode; label: string; type: string; value: string;
  onChange: (v: string) => void; required?: boolean; suffix?: React.ReactNode;
}) {
  return (
    <div className="ap-input-wrap group">
      <span className="ap-input-icon">{icon}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="ap-input peer"
      />
      <label className="ap-input-label">{label}</label>
      {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 z-10">{suffix}</span>}
      <span className="ap-input-glow" aria-hidden />
    </div>
  );
}

function Particles() {
  const dots = Array.from({ length: 24 });
  return (
    <div className="ap-particles" aria-hidden>
      {dots.map((_, i) => {
        const size = 2 + Math.random() * 3;
        const left = Math.random() * 100;
        const delay = Math.random() * 8;
        const dur = 10 + Math.random() * 12;
        return (
          <motion.span
            key={i}
            className="ap-dot"
            style={{ left: `${left}%`, width: size, height: size }}
            initial={{ y: "110vh", opacity: 0 }}
            animate={{ y: "-10vh", opacity: [0, 0.8, 0] }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: "linear" }}
          />
        );
      })}
    </div>
  );
}

const css = `
.auth-page {
  background: radial-gradient(ellipse at top, #1a0b2e 0%, #0a0514 50%, #050208 100%);
  color: #fff;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
}
.ap-bg {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(800px 600px at 15% 20%, rgba(168,85,247,.18), transparent 60%),
    radial-gradient(700px 500px at 85% 80%, rgba(236,72,153,.16), transparent 60%),
    radial-gradient(900px 600px at 50% 50%, rgba(59,130,246,.10), transparent 70%);
}
.ap-grid {
  position: absolute; inset: 0; pointer-events: none; opacity: .4;
  background-image:
    linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
}
.ap-orb {
  position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
}
.ap-orb-1 { width: 420px; height: 420px; top: -120px; left: -100px; background: radial-gradient(circle, #a855f7, transparent 70%); opacity: .45; }
.ap-orb-2 { width: 480px; height: 480px; bottom: -160px; right: -120px; background: radial-gradient(circle, #ec4899, transparent 70%); opacity: .4; }
.ap-orb-3 { width: 360px; height: 360px; top: 40%; left: 60%; background: radial-gradient(circle, #3b82f6, transparent 70%); opacity: .35; }

.ap-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.ap-dot { position: absolute; border-radius: 50%;
  background: radial-gradient(circle, #fff, rgba(236,72,153,.6));
  box-shadow: 0 0 8px rgba(236,72,153,.6); }

.ap-card-wrap { position: relative; border-radius: 28px; }
.ap-card-border {
  position: absolute; inset: -1.5px; border-radius: 28px;
  background: conic-gradient(from var(--angle,0deg), #a855f7, #ec4899, #3b82f6, #a855f7);
  opacity: .8; filter: blur(2px);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude; padding: 1.5px;
  animation: ap-rotate 6s linear infinite; pointer-events: none;
}
.ap-card {
  position: relative; border-radius: 27px; padding: 36px 32px;
  background: linear-gradient(155deg, rgba(30,15,50,.65), rgba(15,10,30,.55));
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border: 1px solid rgba(255,255,255,.08);
  box-shadow: 0 30px 80px -20px rgba(168,85,247,.35), inset 0 1px 0 rgba(255,255,255,.06);
}

.ap-logo {
  width: 56px; height: 56px; border-radius: 18px;
  display: grid; place-items: center;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  box-shadow: 0 10px 30px -8px rgba(236,72,153,.6), 0 0 0 1px rgba(255,255,255,.1) inset;
}
.ap-title {
  font-size: clamp(22px, 4vw, 28px); font-weight: 800; letter-spacing: -.02em;
  background: linear-gradient(135deg, #fff 0%, #f0abfc 50%, #93c5fd 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.ap-subtitle { font-size: 13px; color: rgba(255,255,255,.55); margin-top: 6px; }

.ap-toggle {
  position: relative; display: grid; grid-template-columns: 1fr 1fr;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.06);
  border-radius: 999px; padding: 4px; overflow: hidden;
}
.ap-toggle-pill {
  position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px);
  border-radius: 999px;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  box-shadow: 0 6px 20px -4px rgba(236,72,153,.55);
}
.ap-toggle-btn {
  position: relative; z-index: 1; padding: 10px 0; font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,.55); transition: color .3s ease;
}
.ap-toggle-active { color: #fff; }

.ap-input-wrap {
  position: relative; display: flex; align-items: center;
  background: rgba(255,255,255,.035); border: 1px solid rgba(255,255,255,.08);
  border-radius: 14px; padding: 0 14px 0 42px; height: 52px;
  transition: border-color .3s ease, background .3s ease, transform .2s ease;
}
.ap-input-wrap:focus-within {
  border-color: rgba(236,72,153,.6); background: rgba(255,255,255,.05);
  box-shadow: 0 0 0 4px rgba(236,72,153,.08), 0 8px 30px -10px rgba(168,85,247,.35);
}
.ap-input-icon {
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: rgba(255,255,255,.4); transition: color .3s ease; pointer-events: none;
}
.ap-input-wrap:focus-within .ap-input-icon { color: #f0abfc; }
.ap-input {
  width: 100%; height: 100%; background: transparent; border: none; outline: none;
  font-size: 14px; color: #fff; padding-top: 8px;
}
.ap-input-label {
  position: absolute; left: 42px; top: 50%; transform: translateY(-50%);
  font-size: 14px; color: rgba(255,255,255,.45);
  pointer-events: none; transition: all .25s ease; background: transparent;
}
.ap-input:focus ~ .ap-input-label,
.ap-input:not(:placeholder-shown) ~ .ap-input-label {
  top: 10px; transform: translateY(0); font-size: 10px;
  color: #f0abfc; letter-spacing: .08em; text-transform: uppercase;
}
.ap-input-glow {
  position: absolute; left: 14px; right: 14px; bottom: 0; height: 1px;
  background: linear-gradient(90deg, transparent, #ec4899, #a855f7, transparent);
  opacity: 0; transition: opacity .3s ease;
}
.ap-input-wrap:focus-within .ap-input-glow { opacity: 1; }

.ap-forgot {
  color: rgba(255,255,255,.55); position: relative; padding-bottom: 2px;
  transition: color .25s ease;
}
.ap-forgot::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 1px;
  background: linear-gradient(90deg, #a855f7, #ec4899);
  transform: scaleX(0); transform-origin: left; transition: transform .3s ease;
}
.ap-forgot:hover { color: #f0abfc; }
.ap-forgot:hover::after { transform: scaleX(1); }

.ap-submit {
  position: relative; height: 52px; border-radius: 14px; overflow: hidden;
  color: #fff; font-weight: 700; font-size: 14px; letter-spacing: .02em;
  background: linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #3b82f6 100%);
  background-size: 200% 200%;
  box-shadow: 0 10px 30px -8px rgba(236,72,153,.55), 0 0 0 1px rgba(255,255,255,.1) inset;
  transition: box-shadow .35s ease, background-position .8s ease;
  animation: ap-shift 6s ease infinite;
}
.ap-submit:hover:not(:disabled) {
  box-shadow: 0 18px 50px -10px rgba(236,72,153,.7), 0 0 0 1px rgba(255,255,255,.18) inset,
              0 0 40px -6px rgba(168,85,247,.6);
}
.ap-submit:disabled { opacity: .7; cursor: wait; }

.ap-spinner {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.25);
  border-top-color: #fff; border-radius: 50%; animation: ap-spin .8s linear infinite;
}

.ap-social {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  height: 46px; border-radius: 12px; font-size: 13px; font-weight: 600; color: #fff;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
  transition: all .3s ease;
}
.ap-social:hover:not(:disabled) {
  background: rgba(255,255,255,.08); border-color: rgba(236,72,153,.35);
  box-shadow: 0 8px 24px -8px rgba(168,85,247,.4);
}
.ap-social:disabled { opacity: .5; cursor: not-allowed; }

@property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
@keyframes ap-rotate { to { --angle: 360deg; } }
@keyframes ap-spin { to { transform: rotate(360deg); } }
@keyframes ap-shift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

@media (max-width: 480px) {
  .ap-card { padding: 28px 22px; }
}
@media (prefers-reduced-motion: reduce) {
  .ap-card-border, .ap-submit, .ap-orb, .ap-dot { animation: none !important; }
}
`;
