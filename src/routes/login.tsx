import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — CareerPilot AI" },
      { name: "description", content: "Sign in or create an account to save your career assessments, roadmaps, and AI chat history." },
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
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  // Particle network background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let particles: P[] = [];

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.floor((w * h) / 16000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.6 + 0.4,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 240, 255, 0.55)";
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            ctx.strokeStyle = `rgba(120,160,255,${(1 - dist / 120) * 0.18})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  // Mouse spotlight
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      wrapRef.current.style.setProperty("--mx", `${e.clientX}px`);
      wrapRef.current.style.setProperty("--my", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

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
        setSuccess(true);
        toast.success("Account created. Check your email to confirm.");
        setTimeout(() => { setSuccess(false); setMode("signin"); }, 1400);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSuccess(true);
        toast.success("Welcome back");
        setTimeout(() => navigate({ to: "/dashboard" }), 700);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
      if (res.error) throw res.error instanceof Error ? res.error : new Error(String(res.error));
      if (!res.redirected) navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={wrapRef} className="cinematic-login relative min-h-[calc(100vh-4rem)] w-full overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Backgrounds */}
      <div className="cl-gradient" aria-hidden />
      <div className="cl-grid" aria-hidden />
      <canvas ref={canvasRef} className="cl-particles" aria-hidden />
      <div className="cl-glow cl-glow-top" aria-hidden />
      <div className="cl-glow cl-glow-bottom" aria-hidden />
      <div className="cl-spotlight" aria-hidden />

      {/* Card */}
      <div className="cl-card-wrap relative z-10 w-full max-w-[440px]">
        <div className="cl-border" aria-hidden />
        <div className="cl-card">
          <div className="text-center mb-7">
            <div className="cl-logo mx-auto mb-4">
              <div className="cl-logo-core" />
            </div>
            <h1 className="cl-title">{mode === "signin" ? "ACCESS PORTAL" : "CREATE ACCOUNT"}</h1>
            <p className="cl-subtitle">
              {mode === "signin" ? "Resume your flight plan" : "Begin your career journey"}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-1 p-1 bg-black/40 border border-white/5 rounded-full mb-5">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all ${
                  mode === m ? "bg-gradient-to-r from-cyan-400/20 to-blue-500/20 text-cyan-300 shadow-[0_0_20px_-4px_rgba(0,240,255,0.4)]" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="cl-google w-full mb-5"
          >
            <svg className="size-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {mode === "signup" && (
              <CinematicInput icon={<UserIcon className="size-4" />} type="text" placeholder="Full name" value={name} onChange={setName} required />
            )}
            <CinematicInput icon={<Mail className="size-4" />} type="email" placeholder="Email address" value={email} onChange={setEmail} required />
            <CinematicInput
              icon={<Lock className="size-4" />}
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={setPassword}
              required
              suffix={
                <button type="button" onClick={() => setShowPw(s => !s)} className="text-slate-500 hover:text-cyan-300 transition-colors">
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
            />

            {mode === "signin" && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200 select-none">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="sr-only peer" />
                  <span className="size-4 rounded border border-cyan-400/30 bg-black/40 grid place-items-center peer-checked:border-cyan-400 peer-checked:bg-cyan-400/10 peer-checked:shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-all">
                    <Check className="size-3 text-cyan-300 opacity-0 peer-checked:opacity-100 transition" />
                  </span>
                  Remember me
                </label>
                <button type="button" className="text-slate-400 hover:text-cyan-300 transition-colors">Forgot password?</button>
              </div>
            )}

            <button
              type="submit"
              disabled={busy || success}
              className={`cl-submit w-full mt-2 ${success ? "cl-submit-success" : ""}`}
            >
              {success ? (
                <span className="flex items-center justify-center gap-2"><Check className="size-5" /> Success</span>
              ) : busy ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="cl-spinner" /> Authenticating
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="size-4" />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-500 mt-6">
            By continuing, you agree to our{" "}
            <Link to="/about" className="text-cyan-300/80 hover:text-cyan-300">Terms</Link>.
          </p>
        </div>
      </div>

      <style>{cinematicCss}</style>
    </div>
  );
}

function CinematicInput({
  icon, type, placeholder, value, onChange, required, suffix,
}: {
  icon: React.ReactNode; type: string; placeholder: string; value: string;
  onChange: (v: string) => void; required?: boolean; suffix?: React.ReactNode;
}) {
  return (
    <div className="cl-input-wrap">
      <span className="cl-input-icon">{icon}</span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cl-input"
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</span>}
    </div>
  );
}

const cinematicCss = `
.cinematic-login { background: #05070a; color: #f0f4ff; }
.cl-gradient { position:absolute; inset:0; pointer-events:none;
  background:
    radial-gradient(1200px 800px at 20% -10%, rgba(0,240,255,.10), transparent 60%),
    radial-gradient(1000px 700px at 90% 10%, rgba(168,85,247,.10), transparent 60%),
    radial-gradient(900px 600px at 50% 110%, rgba(79,140,255,.10), transparent 60%),
    linear-gradient(180deg,#05070a 0%,#0b0e14 100%); }
.cl-grid { position:absolute; inset:0; pointer-events:none;
  background-image:
    linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse at center, black 35%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 35%, transparent 75%);
  animation: clGridPan 24s linear infinite; }
.cl-particles { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; opacity:.85; }
.cl-glow { position:absolute; width:520px; height:520px; border-radius:50%; filter:blur(140px); opacity:.22; pointer-events:none; }
.cl-glow-top { top:-200px; right:-140px; background: radial-gradient(circle, #00f0ff, transparent 70%); animation: clFloat 10s ease-in-out infinite; }
.cl-glow-bottom { bottom:-220px; left:-140px; background: radial-gradient(circle, #a855f7, transparent 70%); animation: clFloat 12s ease-in-out infinite reverse; }
.cl-spotlight { position:absolute; inset:0; pointer-events:none;
  background: radial-gradient(600px 400px at var(--mx,50%) var(--my,50%), rgba(0,240,255,.06), transparent 60%); }

.cl-card-wrap { animation: clEnter 1s cubic-bezier(.22,1,.36,1) both, clFloat2 6s ease-in-out infinite 1s; }
.cl-border { position:absolute; inset:-1.5px; border-radius:24px;
  background: conic-gradient(from var(--angle,0deg), #00f0ff, #4f8cff, #a855f7, #00f0ff);
  filter: blur(8px); opacity:.55; animation: clRotate 5s linear infinite;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude; padding:1.5px; pointer-events:none; }
.cl-card { position:relative; background: rgba(14,18,28,.6); backdrop-filter: blur(22px) saturate(140%);
  -webkit-backdrop-filter: blur(22px) saturate(140%); border:1px solid rgba(120,160,255,.18);
  border-radius:22px; padding:36px 32px; overflow:hidden; }

.cl-logo { width:60px; height:60px; border-radius:50%;
  background: conic-gradient(from 0deg, #00f0ff, #4f8cff, #a855f7, #00f0ff);
  display:grid; place-items:center; animation: clRotate 6s linear infinite;
  box-shadow: 0 0 30px -6px rgba(0,240,255,.4); }
.cl-logo-core { width:50px; height:50px; border-radius:50%;
  background: radial-gradient(circle at 30% 30%, #0f172a, #020408);
  border:1px solid rgba(255,255,255,.06); }

.cl-title { font-family: ui-sans-serif, system-ui, sans-serif; font-weight:800;
  font-size: clamp(20px, 3.5vw, 26px); letter-spacing:.18em;
  background: linear-gradient(90deg, #f0f4ff, #00f0ff, #4f8cff);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  text-shadow: 0 0 30px rgba(0,240,255,.15); }
.cl-subtitle { font-size:12px; color:#94a3b8; margin-top:6px; letter-spacing:.05em; }

.cl-google { display:inline-flex; align-items:center; justify-content:center; gap:10px;
  height:46px; border-radius:999px; background: rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.08); color:#f0f4ff; font-size:13px; font-weight:600;
  transition: all .3s ease; }
.cl-google:hover { background: rgba(255,255,255,.08); border-color: rgba(0,240,255,.3);
  box-shadow: 0 0 20px -6px rgba(0,240,255,.3); }
.cl-google:disabled { opacity:.5; cursor: not-allowed; }

.cl-input-wrap { position:relative; display:flex; align-items:center;
  background: rgba(6,10,18,.7); border:1px solid rgba(120,160,255,.14);
  border-radius:999px; padding: 0 16px 0 42px; height:48px;
  transition: border-color .3s ease, box-shadow .3s ease, transform .2s ease; }
.cl-input-wrap:focus-within { border-color: rgba(0,240,255,.55);
  box-shadow: 0 0 0 3px rgba(0,240,255,.10), inset 0 0 12px rgba(0,240,255,.08);
  transform: translateY(-1px); }
.cl-input-icon { position:absolute; left:16px; top:50%; transform:translateY(-50%);
  color:#64748b; transition: color .3s ease; pointer-events:none; }
.cl-input-wrap:focus-within .cl-input-icon { color:#00f0ff; }
.cl-input { width:100%; height:100%; background:transparent; border:none; outline:none;
  font-size:14px; color:#f0f4ff; letter-spacing:.01em; }
.cl-input::placeholder { color:#64748b; transition: opacity .25s ease, transform .25s ease; }
.cl-input:focus::placeholder { opacity:.5; transform: translateX(4px); }

.cl-submit { position:relative; height:50px; border-radius:999px; overflow:hidden;
  background: linear-gradient(135deg, rgba(0,240,255,.22), rgba(79,140,255,.22));
  border:1px solid rgba(0,240,255,.3); color:#f0f4ff;
  font-weight:700; font-size:14px; letter-spacing:.04em;
  transition: transform .25s ease, box-shadow .35s ease, border-color .35s ease; }
.cl-submit:hover:not(:disabled) { transform: translateY(-2px) scale(1.01);
  border-color: rgba(0,240,255,.6);
  box-shadow: 0 0 30px -4px rgba(0,240,255,.45), 0 8px 30px -10px rgba(0,240,255,.3); }
.cl-submit:active:not(:disabled) { transform: translateY(0) scale(.985); }
.cl-submit:disabled { opacity:.85; cursor: wait; }
.cl-submit-success { background: linear-gradient(135deg, rgba(52,211,153,.3), rgba(0,240,255,.2));
  border-color: rgba(52,211,153,.6); box-shadow: 0 0 30px -4px rgba(52,211,153,.5); }

.cl-spinner { width:18px; height:18px; border:2.5px solid rgba(255,255,255,.15);
  border-top-color:#00f0ff; border-radius:50%; animation: clSpin .8s linear infinite; }

@property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
@keyframes clRotate { from { --angle: 0deg; } to { --angle: 360deg; } }
@keyframes clEnter { from { opacity:0; transform: translateY(40px) scale(.96); filter: blur(6px); }
                    to   { opacity:1; transform: translateY(0)   scale(1);   filter: blur(0); } }
@keyframes clFloat2 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes clFloat  { 0%,100% { transform: translate(0,0) scale(1); opacity:.22; }
                      50%     { transform: translate(20px,30px) scale(1.05); opacity:.3; } }
@keyframes clGridPan { 0% { background-position: 0 0; } 100% { background-position: 64px 64px; } }
@keyframes clSpin { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
  .cl-card-wrap, .cl-border, .cl-logo, .cl-grid, .cl-glow { animation: none !important; }
}
`;
