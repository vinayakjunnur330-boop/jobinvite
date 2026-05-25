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

type Mode = "signin" | "signup";

function LoginPage() {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [wave, setWave] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const triggerWave = () => {
    setWave(true);
    setTimeout(() => setWave(false), 1200);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerWave();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password: password || crypto.randomUUID(),
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: `${name} ${surname}`.trim() },
          },
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
    <div className="auth-page relative min-h-[calc(100vh-4rem)] w-full overflow-hidden flex items-center justify-center px-4 py-10">
      <div className="ap-bg" aria-hidden />
      <motion.div aria-hidden className="ap-orb ap-orb-1"
        animate={{ x: [0, 60, -40, 0], y: [0, -50, 40, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div aria-hidden className="ap-orb ap-orb-2"
        animate={{ x: [0, -70, 50, 0], y: [0, 60, -30, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div aria-hidden className="ap-orb ap-orb-3"
        animate={{ x: [0, 40, -60, 0], y: [0, -40, 30, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }} />
      <div className="ap-grid" aria-hidden />
      <Particles />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[980px]"
      >
        <div className="ap-card-wrap">
          <div className="ap-card-border" aria-hidden />
          <div className="ap-card grid md:grid-cols-[1fr_1.1fr] gap-6 md:gap-10 items-center">
            {/* Character */}
            <div className="ap-character-stage order-2 md:order-1">
              <Character mode={mode} wave={wave} />
            </div>

            {/* Form column */}
            <div className="order-1 md:order-2">
              <div className="text-center md:text-left mb-5">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="ap-logo mb-3 mx-auto md:mx-0"
                >
                  <Sparkles className="size-5 text-white" />
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
                  {isSignup ? "Join the next-gen career platform" : "Sign in to continue your journey"}
                </p>
              </div>

              <div className="ap-toggle">
                <motion.div
                  className="ap-toggle-pill"
                  animate={{ x: isSignup ? "100%" : "0%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button type="button" onClick={() => setMode("signin")}
                  className={`ap-toggle-btn ${!isSignup ? "ap-toggle-active" : ""}`}>Login</button>
                <button type="button" onClick={() => setMode("signup")}
                  className={`ap-toggle-btn ${isSignup ? "ap-toggle-active" : ""}`}>Register</button>
              </div>

              <form onSubmit={submit} className="space-y-3 mt-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: isSignup ? 40 : -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isSignup ? -40 : 40 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-3"
                  >
                    {isSignup ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <FloatingInput icon={<UserIcon className="size-4" />} label="Name"
                            type="text" value={name} onChange={setName} required />
                          <FloatingInput icon={<UserIcon className="size-4" />} label="Surname"
                            type="text" value={surname} onChange={setSurname} required />
                        </div>
                        <FloatingInput icon={<Mail className="size-4" />} label="Email"
                          type="email" value={email} onChange={setEmail} required />
                        <FloatingInput icon={<Lock className="size-4" />} label="Password"
                          type={showPw ? "text" : "password"} value={password} onChange={setPassword} required
                          suffix={<button type="button" onClick={() => setShowPw(s => !s)} className="text-white/40 hover:text-emerald-300 transition-colors">{showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>} />
                      </>
                    ) : (
                      <>
                        <FloatingInput icon={<Mail className="size-4" />} label="Email"
                          type="email" value={email} onChange={setEmail} required />
                        <FloatingInput icon={<Lock className="size-4" />} label="Password"
                          type={showPw ? "text" : "password"} value={password} onChange={setPassword} required
                          suffix={<button type="button" onClick={() => setShowPw(s => !s)} className="text-white/40 hover:text-cyan-300 transition-colors">{showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>} />
                        <div className="flex justify-end">
                          <button type="button" className="ap-forgot text-xs">Forgot password?</button>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={busy}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onHoverStart={triggerWave}
                  className={`ap-submit w-full mt-1 ${isSignup ? "ap-submit-green" : "ap-submit-cyan"}`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {busy ? <><span className="ap-spinner" /> Please wait…</>
                      : <>{isSignup ? "Next" : "Login"} <ArrowRight className="size-4" /></>}
                  </span>
                </motion.button>
              </form>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">or continue with</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.button type="button" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                  onClick={() => social("google")} disabled={busy} className="ap-social">
                  <svg className="size-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
                  Google
                </motion.button>
                <motion.button type="button" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                  onClick={() => social("apple")} disabled={busy} className="ap-social">
                  <svg className="size-4 fill-white" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09z"/></svg>
                  Apple
                </motion.button>
              </div>

              <p className="text-center md:text-left text-[11px] text-white/40 mt-4">
                By continuing, you agree to our{" "}
                <Link to="/about" className="text-cyan-300/80 hover:text-cyan-300 transition-colors">Terms</Link>{" "}&{" "}
                <Link to="/about" className="text-cyan-300/80 hover:text-cyan-300 transition-colors">Privacy</Link>.
              </p>
            </div>
          </div>
        </div>
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
      <input type={type} required={required} value={value}
        onChange={(e) => onChange(e.target.value)} placeholder=" " className="ap-input peer" />
      <label className="ap-input-label">{label}</label>
      {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 z-10">{suffix}</span>}
      <span className="ap-input-glow" aria-hidden />
    </div>
  );
}

function Particles() {
  const dots = Array.from({ length: 22 });
  return (
    <div className="ap-particles" aria-hidden>
      {dots.map((_, i) => {
        const size = 2 + Math.random() * 3;
        const left = Math.random() * 100;
        const delay = Math.random() * 8;
        const dur = 10 + Math.random() * 12;
        return (
          <motion.span key={i} className="ap-dot"
            style={{ left: `${left}%`, width: size, height: size }}
            initial={{ y: "110vh", opacity: 0 }}
            animate={{ y: "-10vh", opacity: [0, 0.8, 0] }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: "linear" }} />
        );
      })}
    </div>
  );
}

/* ---------------- Animated SVG Character ---------------- */
function Character({ mode, wave }: { mode: Mode; wave: boolean }) {
  const isSignup = mode === "signup";
  return (
    <div className="ap-char-wrap">
      <motion.div className="ap-char-glow" aria-hidden
        animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
      <motion.svg
        viewBox="0 0 220 320"
        className="ap-char-svg"
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1, y: [0, -8, 0] }}
        transition={{ x: { duration: 0.9, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.9 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
      >
        {/* shadow */}
        <ellipse cx="110" cy="300" rx="55" ry="8" fill="rgba(0,0,0,0.45)" />

        {/* Left arm (crossed in signup, hanging/waving in signin) */}
        <AnimatePresence mode="wait">
          {isSignup ? (
            <motion.g key="larm-cross" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <path d="M70 165 Q95 175 130 168 L132 182 Q95 192 70 182 Z" fill="#3a4150" />
              <circle cx="132" cy="175" r="10" fill="#f4c9a8" />
            </motion.g>
          ) : (
            <motion.g key="larm-down" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <path d="M72 160 Q66 200 70 235 L84 235 Q86 200 86 162 Z" fill="#3a4150" />
              <circle cx="77" cy="240" r="9" fill="#f4c9a8" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Body / jacket */}
        <path d="M70 160 Q70 145 110 142 Q150 145 150 160 L150 235 Q110 245 70 235 Z" fill="#4b5263" />
        <path d="M108 145 L108 235" stroke="#2d323d" strokeWidth="2" />
        {/* White tee peek */}
        <path d="M96 145 Q110 152 124 145 L124 158 Q110 162 96 158 Z" fill="#f5f7fa" />

        {/* Pants */}
        <path d="M75 235 L100 235 L100 295 L82 295 Z" fill="#1c1f27" />
        <path d="M120 235 L145 235 L138 295 L120 295 Z" fill="#1c1f27" />
        {/* Shoes */}
        <ellipse cx="89" cy="298" rx="14" ry="6" fill="#ffffff" />
        <ellipse cx="131" cy="298" rx="14" ry="6" fill="#ffffff" />

        {/* Right arm — animates wave on submit, crossed on signup */}
        <AnimatePresence mode="wait">
          {isSignup ? (
            <motion.g key="rarm-cross" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <path d="M150 165 Q125 175 90 168 L88 182 Q125 192 150 182 Z" fill="#3a4150" />
              <circle cx="88" cy="175" r="10" fill="#f4c9a8" />
            </motion.g>
          ) : (
            <motion.g
              key="rarm-side"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, rotate: wave ? [0, -55, -35, -55, -20, 0] : 0 }}
              exit={{ opacity: 0 }}
              transition={{ rotate: { duration: 1.1, ease: "easeInOut" } }}
              style={{ transformOrigin: "148px 162px" }}
            >
              <path d="M148 160 Q156 200 150 235 L136 235 Q134 200 134 162 Z" fill="#3a4150" />
              <circle cx="143" cy="240" r="9" fill="#f4c9a8" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Neck */}
        <rect x="102" y="118" width="16" height="20" fill="#e9b890" />

        {/* Head */}
        <motion.g
          animate={{ rotate: wave ? [0, -6, 4, 0] : [0, 2, -2, 0] }}
          transition={{ duration: wave ? 1 : 6, repeat: wave ? 0 : Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "110px 95px" }}
        >
          <ellipse cx="110" cy="92" rx="32" ry="36" fill="#f4c9a8" />
          {/* Hair — blonde */}
          <path d="M78 80 Q82 50 110 48 Q142 50 144 82 Q138 70 120 68 Q108 75 96 70 Q86 72 80 84 Z" fill="#f5d27a" />
          <path d="M82 80 Q90 64 108 66 L102 82 Q94 80 86 90 Z" fill="#e6bf60" />
          {/* Ears */}
          <ellipse cx="78" cy="95" rx="5" ry="7" fill="#e9b890" />
          <ellipse cx="142" cy="95" rx="5" ry="7" fill="#e9b890" />
          {/* Eyes */}
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
            transition={{ duration: 4, times: [0, 0.46, 0.5, 0.54, 1], repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "110px 92px" }}
          >
            <ellipse cx="100" cy="92" rx="3" ry="4" fill="#1a1f2b" />
            <ellipse cx="120" cy="92" rx="3" ry="4" fill="#1a1f2b" />
          </motion.g>
          {/* Brows */}
          <path d="M94 84 Q100 81 106 84" stroke="#a8862e" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M114 84 Q120 81 126 84" stroke="#a8862e" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Mouth */}
          <AnimatePresence mode="wait">
            {isSignup ? (
              <motion.path key="m-smile" d="M102 108 Q110 114 118 108" stroke="#3a2417" strokeWidth="2.2" fill="none" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} />
            ) : (
              <motion.path key="m-grin" d="M100 107 Q110 117 120 107 Q110 112 100 107 Z" fill="#3a2417"
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                style={{ transformOrigin: "110px 110px" }} />
            )}
          </AnimatePresence>
          {/* Cheeks */}
          <circle cx="92" cy="104" r="3.5" fill="#ffb3a7" opacity="0.55" />
          <circle cx="128" cy="104" r="3.5" fill="#ffb3a7" opacity="0.55" />
        </motion.g>

        {/* Sparkle on wave */}
        <AnimatePresence>
          {wave && (
            <motion.g key="spark" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <path d="M165 55 L168 62 L175 65 L168 68 L165 75 L162 68 L155 65 L162 62 Z" fill="#fff7b0" />
            </motion.g>
          )}
        </AnimatePresence>
      </motion.svg>
    </div>
  );
}

const css = `
.auth-page {
  background: radial-gradient(ellipse at center, #0b2a55 0%, #07142e 45%, #04081a 100%);
  color: #fff;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
}
.ap-bg {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(700px 500px at 20% 30%, rgba(59,130,246,.25), transparent 60%),
    radial-gradient(800px 600px at 80% 70%, rgba(14,165,233,.22), transparent 60%),
    radial-gradient(900px 600px at 50% 50%, rgba(99,102,241,.14), transparent 70%);
}
.ap-grid {
  position: absolute; inset: 0; pointer-events: none; opacity: .35;
  background-image:
    linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
}
.ap-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
.ap-orb-1 { width: 420px; height: 420px; top: -120px; left: -100px; background: radial-gradient(circle, #3b82f6, transparent 70%); opacity: .45; }
.ap-orb-2 { width: 480px; height: 480px; bottom: -160px; right: -120px; background: radial-gradient(circle, #06b6d4, transparent 70%); opacity: .4; }
.ap-orb-3 { width: 360px; height: 360px; top: 40%; left: 60%; background: radial-gradient(circle, #6366f1, transparent 70%); opacity: .35; }

.ap-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.ap-dot { position: absolute; border-radius: 50%;
  background: radial-gradient(circle, #fff, rgba(59,130,246,.6));
  box-shadow: 0 0 8px rgba(59,130,246,.6); }

.ap-card-wrap { position: relative; border-radius: 28px; }
.ap-card-border {
  position: absolute; inset: -1.5px; border-radius: 28px;
  background: conic-gradient(from var(--angle,0deg), #3b82f6, #06b6d4, #6366f1, #3b82f6);
  opacity: .8; filter: blur(2px);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude; padding: 1.5px;
  animation: ap-rotate 6s linear infinite; pointer-events: none;
}
.ap-card {
  position: relative; border-radius: 27px; padding: 32px;
  background: linear-gradient(155deg, rgba(15,30,60,.7), rgba(8,16,36,.6));
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border: 1px solid rgba(255,255,255,.08);
  box-shadow: 0 30px 80px -20px rgba(59,130,246,.4), inset 0 1px 0 rgba(255,255,255,.06);
}

.ap-character-stage {
  position: relative; display: flex; align-items: center; justify-content: center;
  min-height: 320px;
}
.ap-char-wrap { position: relative; width: 100%; max-width: 260px; }
.ap-char-svg { width: 100%; height: auto; filter: drop-shadow(0 20px 30px rgba(59,130,246,.35)); }
.ap-char-glow {
  position: absolute; inset: -20% 0 0 0; margin: auto;
  width: 80%; height: 80%; border-radius: 50%;
  background: radial-gradient(circle, rgba(59,130,246,.6), transparent 65%);
  filter: blur(40px); z-index: -1;
}

.ap-logo {
  width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  box-shadow: 0 10px 30px -8px rgba(6,182,212,.55), 0 0 0 1px rgba(255,255,255,.1) inset;
}
.ap-title {
  font-size: clamp(22px, 4vw, 28px); font-weight: 800; letter-spacing: -.02em;
  background: linear-gradient(135deg, #fff 0%, #bae6fd 50%, #93c5fd 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.ap-subtitle { font-size: 13px; color: rgba(255,255,255,.55); margin-top: 4px; }

.ap-toggle {
  position: relative; display: grid; grid-template-columns: 1fr 1fr;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.06);
  border-radius: 999px; padding: 4px; overflow: hidden;
}
.ap-toggle-pill {
  position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px);
  border-radius: 999px;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  box-shadow: 0 6px 20px -4px rgba(6,182,212,.55);
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
  transition: border-color .3s ease, background .3s ease;
}
.ap-input-wrap:focus-within {
  border-color: rgba(6,182,212,.6); background: rgba(255,255,255,.05);
  box-shadow: 0 0 0 4px rgba(6,182,212,.08), 0 8px 30px -10px rgba(59,130,246,.35);
}
.ap-input-icon {
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: rgba(255,255,255,.4); transition: color .3s ease; pointer-events: none;
}
.ap-input-wrap:focus-within .ap-input-icon { color: #67e8f9; }
.ap-input {
  width: 100%; height: 100%; background: transparent; border: none; outline: none;
  font-size: 14px; color: #fff; padding-top: 8px;
}
.ap-input-label {
  position: absolute; left: 42px; top: 50%; transform: translateY(-50%);
  font-size: 14px; color: rgba(255,255,255,.45);
  pointer-events: none; transition: all .25s ease;
}
.ap-input:focus ~ .ap-input-label,
.ap-input:not(:placeholder-shown) ~ .ap-input-label {
  top: 10px; transform: translateY(0); font-size: 10px;
  color: #67e8f9; letter-spacing: .08em; text-transform: uppercase;
}
.ap-input-glow {
  position: absolute; left: 14px; right: 14px; bottom: 0; height: 1px;
  background: linear-gradient(90deg, transparent, #06b6d4, #3b82f6, transparent);
  opacity: 0; transition: opacity .3s ease;
}
.ap-input-wrap:focus-within .ap-input-glow { opacity: 1; }

.ap-forgot { color: rgba(255,255,255,.55); position: relative; padding-bottom: 2px; transition: color .25s ease; }
.ap-forgot::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 1px;
  background: linear-gradient(90deg, #3b82f6, #06b6d4);
  transform: scaleX(0); transform-origin: left; transition: transform .3s ease; }
.ap-forgot:hover { color: #67e8f9; }
.ap-forgot:hover::after { transform: scaleX(1); }

.ap-submit {
  position: relative; height: 52px; border-radius: 14px; overflow: hidden;
  color: #fff; font-weight: 700; font-size: 14px; letter-spacing: .02em;
  box-shadow: 0 10px 30px -8px rgba(6,182,212,.55), 0 0 0 1px rgba(255,255,255,.1) inset;
  transition: box-shadow .35s ease, background-position .8s ease;
  background-size: 200% 200%;
  animation: ap-shift 6s ease infinite;
}
.ap-submit-green { background: linear-gradient(135deg, #10b981 0%, #22c55e 50%, #34d399 100%); }
.ap-submit-cyan  { background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #22d3ee 100%); }
.ap-submit:hover:not(:disabled) {
  box-shadow: 0 18px 50px -10px rgba(6,182,212,.7), 0 0 0 1px rgba(255,255,255,.18) inset,
              0 0 40px -6px rgba(59,130,246,.6);
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
  background: rgba(255,255,255,.08); border-color: rgba(6,182,212,.35);
  box-shadow: 0 8px 24px -8px rgba(59,130,246,.4);
}
.ap-social:disabled { opacity: .5; cursor: not-allowed; }

@property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
@keyframes ap-rotate { to { --angle: 360deg; } }
@keyframes ap-spin { to { transform: rotate(360deg); } }
@keyframes ap-shift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

@media (max-width: 768px) {
  .ap-card { padding: 24px 20px; }
  .ap-character-stage { min-height: 240px; }
  .ap-char-wrap { max-width: 200px; }
}
@media (prefers-reduced-motion: reduce) {
  .ap-card-border, .ap-submit, .ap-orb, .ap-dot { animation: none !important; }
}
`;
