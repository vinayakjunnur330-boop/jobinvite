import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { Loader2, Lock, Mail, User, Send, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

type Msg = { role: "user" | "bot"; content: string; at: number };

const WELCOME: Msg = {
  role: "bot",
  at: Date.now(),
  content:
    "Welcome to our ecosystem. Please log in or create an account to access your workspace. How can I assist you today?",
};

const REPLIES: { match: RegExp; reply: string }[] = [
  { match: /(feature|what.*do|platform|product)/i, reply: "Aether is an enterprise workspace with executive analytics, live data tables, and an AI concierge. Create an account to unlock the full dashboard." },
  { match: /(secure|security|safe|privacy|data)/i, reply: "All sessions are encrypted in transit, credentials are hashed, and the gateway enforces a strict authentication boundary before any workspace data is rendered." },
  { match: /(login|sign in|get in|access)/i, reply: "Use the Sign In tab on the right. If you don't have an account yet, switch to Create Account — it takes about 20 seconds." },
  { match: /(price|cost|plan|pricing)/i, reply: "The Starter tier is free for individuals. Team and Enterprise tiers unlock SSO, audit logs, and dedicated support." },
  { match: /(help|support|contact)/i, reply: "I'm here 24/7. Ask about features, security, onboarding, or pricing — or drop your email after signing in and our team will reach out." },
  { match: /(hi|hello|hey|yo)/i, reply: "Hello — glad to have you here. Would you like a quick tour of what's behind the gateway?" },
];

function botReply(text: string): string {
  for (const r of REPLIES) if (r.match.test(text)) return r.reply;
  return "Got it. Once you're signed in, the full dashboard, analytics, and live data tools will be available to you.";
}

function ripple(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const span = document.createElement("span");
  const size = Math.max(rect.width, rect.height);
  span.className = "aether-ripple";
  span.style.width = span.style.height = `${size}px`;
  span.style.left = `${e.clientX - rect.left - size / 2}px`;
  span.style.top = `${e.clientY - rect.top - size / 2}px`;
  el.appendChild(span);
  setTimeout(() => span.remove(), 650);
}

function passwordStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0-4
}

export function AuthGateway({ onAuthed }: { onAuthed: (email: string) => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exiting, setExiting] = useState(false);

  const [msgs, setMsgs] = useState<Msg[]>([WELCOME]);
  const [chatInput, setChatInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const sendChat = (text?: string) => {
    const t = (text ?? chatInput).trim();
    if (!t) return;
    setChatInput("");
    setMsgs((m) => [...m, { role: "user", content: t, at: Date.now() }]);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "bot", content: botReply(t), at: Date.now() }]);
    }, 550);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr("Enter a valid work email.");
    if (pw.length < 8) return setErr("Password must be at least 8 characters.");
    if (mode === "signup" && name.trim().length < 2) return setErr("Tell us your name.");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setExiting(true);
      setTimeout(() => onAuthed(email), 650);
    }, 1100);
  };

  const strength = passwordStrength(pw);
  const strengthLabel = ["Too weak", "Weak", "Fair", "Strong", "Excellent"][strength];
  const strengthColor = ["#3f3f46", "#ef4444", "#f59e0b", "#6366f1", "#22c55e"][strength];

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden aether-gateway ${exiting ? "aether-exit" : ""}`}
      style={{ background: "radial-gradient(ellipse at 20% 10%, #1e1b4b 0%, #09090b 45%, #09090b 100%)" }}
    >
      {/* ambient orbs */}
      <div className="aether-orb" style={{ top: "-10%", left: "-5%", background: "#6366f1" }} />
      <div className="aether-orb" style={{ bottom: "-15%", right: "-10%", background: "#4f46e5", animationDelay: "2s" }} />
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)" }} />

      <div className="relative h-full w-full grid lg:grid-cols-2 gap-6 p-4 md:p-8 overflow-auto">
        {/* LEFT — Chatbot */}
        <section className="flex flex-col aether-panel min-h-[420px]">
          <header className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                <Sparkles className="size-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white tracking-tight">Aether AI Concierge</div>
                <div className="text-[10px] font-mono text-emerald-400">● ONLINE • SECURE CHANNEL</div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
              <ShieldCheck className="size-3 text-indigo-400" /> E2E
            </div>
          </header>

          <div ref={chatRef} className="aether-scroll flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-[aether-in_.35s_ease-out]`}>
                <div
                  className={`max-w-[85%] text-sm leading-relaxed px-4 py-2.5 rounded-2xl ${
                    m.role === "user"
                      ? "rounded-br-sm text-white"
                      : "rounded-bl-sm text-zinc-100 bg-white/[0.04] border border-white/10"
                  }`}
                  style={m.role === "user" ? { background: "linear-gradient(135deg,#6366f1,#4f46e5)" } : undefined}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {msgs.length === 1 && (
              <div className="pt-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Suggested</div>
                <div className="flex flex-wrap gap-2">
                  {["What does the platform do?", "Is my data secure?", "How do I get in?"].map((s) => (
                    <button key={s} onClick={() => sendChat(s)} className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-400/60 text-zinc-200 aether-trans">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Ask Aether anything…"
              className="flex-1 bg-white/[0.04] border border-white/10 text-white placeholder:text-zinc-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/30 aether-trans"
            />
            <button onClick={(e) => { ripple(e); sendChat(); }} className="aether-ripple-host relative overflow-hidden size-10 rounded-xl text-white flex items-center justify-center aether-trans hover:scale-105" style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }} aria-label="Send">
                <Send className="size-4" />
            </button>
          </div>
        </section>

        {/* RIGHT — Auth */}
        <section className="flex items-center justify-center">
          <div className="w-full max-w-md aether-panel p-7 md:p-9">
            <div className="flex items-center gap-2 mb-6">
              <div className="size-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", boxShadow: "0 0 30px -4px #6366f1" }}>
                <Lock className="size-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-mono tracking-widest text-indigo-300/80">AETHER • GATEWAY</div>
                <h1 className="text-xl font-semibold text-white tracking-tight">
                  {mode === "signin" ? "Welcome back" : "Create your account"}
                </h1>
              </div>
            </div>

            {/* Tabs */}
            <div className="relative grid grid-cols-2 mb-6 bg-white/[0.04] border border-white/10 rounded-xl p-1">
              <button onClick={() => setMode("signin")} className={`relative z-10 py-2 text-sm font-medium aether-trans ${mode === "signin" ? "text-white" : "text-zinc-400"}`}>Sign In</button>
              <button onClick={() => setMode("signup")} className={`relative z-10 py-2 text-sm font-medium aether-trans ${mode === "signup" ? "text-white" : "text-zinc-400"}`}>Create Account</button>
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg aether-trans"
                style={{
                  left: mode === "signin" ? 4 : "calc(50% + 0px)",
                  background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                  boxShadow: "0 6px 20px -8px #6366f1",
                }}
              />
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <FloatingField icon={<User className="size-4" />} label="Full name" value={name} onChange={setName} type="text" />
              )}
              <FloatingField icon={<Mail className="size-4" />} label="Work email" value={email} onChange={setEmail} type="email" />
              <FloatingField icon={<Lock className="size-4" />} label="Password" value={pw} onChange={setPw} type="password" />

              {mode === "signup" && pw.length > 0 && (
                <div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full aether-trans" style={{ width: `${(strength / 4) * 100}%`, background: strengthColor }} />
                  </div>
                  <div className="mt-1.5 text-[11px] font-mono text-zinc-400 flex justify-between">
                    <span>Password strength</span><span style={{ color: strengthColor }}>{strengthLabel}</span>
                  </div>
                </div>
              )}

              {err && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{err}</div>}

              <button
                type="submit"
                disabled={loading}
                onMouseDown={ripple}
                className="aether-ripple-host relative overflow-hidden w-full py-3 rounded-xl text-white font-semibold text-sm aether-trans hover:scale-[1.01] disabled:opacity-70 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", boxShadow: "0 10px 40px -10px #6366f1" }}
              >
                {loading ? (
                  <><Loader2 className="size-4 animate-spin" /> Authorizing…</>
                ) : (
                  <>{mode === "signin" ? "Sign In Securely" : "Create Account"} <ArrowRight className="size-4" /></>
                )}
              </button>

              <p className="text-[11px] text-center text-zinc-500 pt-1">
                Protected by Aether Gateway · Encrypted in transit
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

function FloatingField({
  icon, label, value, onChange, type,
}: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; type: string }) {
  const [focus, setFocus] = useState(false);
  const active = focus || value.length > 0;
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">{icon}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className="peer w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-3 pt-5 pb-2 text-sm text-white focus:outline-none focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/30 aether-trans"
      />
      <label
        className="absolute left-10 pointer-events-none aether-trans text-zinc-400"
        style={{
          top: active ? "6px" : "50%",
          transform: active ? "translateY(0)" : "translateY(-50%)",
          fontSize: active ? "10px" : "13px",
          letterSpacing: active ? "0.08em" : "0",
          textTransform: active ? "uppercase" : "none",
          color: active ? "#a5b4fc" : undefined,
        }}
      >
        {label}
      </label>
    </div>
  );
}
