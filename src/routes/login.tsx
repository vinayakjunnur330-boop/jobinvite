import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowRight, Send, Minus, Maximize2, Trash2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useServerFn } from "@tanstack/react-start";
import { getMyRoles } from "@/lib/roles.functions";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Aether — Sign in to the Intelligent Workspace" },
      { name: "description", content: "Sign in or create an account on Aether, the intelligent ecosystem for modern workspaces." },
    ],
  }),
  component: GatewayPage,
});

type Mode = "signin" | "signup";
type ChatMsg = { id: string; role: "user" | "bot"; text: string };

// ────────────────────────────── Pre-auth chatbot brain ──────────────────────────────
const KB: { keys: RegExp; reply: string }[] = [
  { keys: /\b(hi|hello|hey|yo|greetings)\b/i, reply: "Hello — I'm **Aether AI Concierge**. I help new visitors understand the platform before they sign in. Ask me about *pricing*, *features*, *security*, or how to *get started*." },
  { keys: /\b(price|pricing|plan|cost|how much)\b/i, reply: "Aether ships three tiers:\n\n• **Starter** — Free for up to 3 seats. All core analytics.\n• **Team** — $19 / seat / mo. Advanced data grid, theme controls, audit logs.\n• **Enterprise Pro** — Custom. SSO, dedicated infra, 99.99% SLA.\n\nCreating an account starts you on Starter — no card required." },
  { keys: /\b(feature|capab|what (does|can)|module)\b/i, reply: "Inside the workspace you get four premium modules:\n\n1. **Executive Overview** — live revenue, latency & conversion metrics with interactive sparklines.\n2. **Identity Data Grid** — search, sort & suspend accounts in real time.\n3. **Global Network** — distributed node health across regions.\n4. **System Controls** — tune cache, AI sampling temperature, and theme accents instantly." },
  { keys: /\b(secure|security|gdpr|soc|encrypt|privacy)\b/i, reply: "Security is foundational: SOC 2 Type II, GDPR-aligned, AES-256 at rest, TLS 1.3 in transit, scoped row-level security on every table, and SSO via Google, Apple, and GitHub." },
  { keys: /\b(join|sign\s?up|register|create.*account|access|get started|onboard|try)\b/i, reply: "I'd love to show you around! Please fill out the **Create Account** form on the right, or click **Sign In** to enter your premium workspace instantly." },
  { keys: /\b(google|apple|github|sso|oauth|social)\b/i, reply: "Single Sign-On is built-in. Use **Google**, **Apple**, or **GitHub** from the auth panel — your session is provisioned in under 600 ms." },
  { keys: /\b(help|support|contact|human)\b/i, reply: "Once you're inside the workspace, support is one click away from the sidebar. Pre-signup, I can answer questions about features, pricing, security, integrations, and onboarding." },
  { keys: /\b(integration|connect|api|webhook)\b/i, reply: "Aether ships REST + Webhooks out of the box, with first-class adapters for Slack, Linear, GitHub, Stripe, and Snowflake. Full API reference unlocks after signup." },
  { keys: /\b(uptime|sla|reliab|status)\b/i, reply: "Platform uptime sits at **99.99%** trailing-30-days, with multi-region failover and proactive health checks every 15 seconds." },
  { keys: /\b(theme|dark|light|color|brand)\b/i, reply: "Dark mode is the default canvas, but you can re-tune the accent — Royal Amethyst, Emerald Mint, or Cosmic Amber — live from System Controls inside the workspace." },
];
function reply(input: string): string {
  for (const k of KB) if (k.keys.test(input)) return k.reply;
  return "Great question. The fastest path is to create a free account — every workspace module unlocks instantly. Meanwhile I can cover **pricing**, **features**, **security**, or **integrations** in detail.";
}
function md(s: string) {
  const esc = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 text-[12px] font-mono">$1</code>')
    .replace(/^[•-] (.+)$/gm, '<div class="flex gap-2"><span class="text-indigo-400">•</span><span>$1</span></div>')
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

// ────────────────────────────── Page ──────────────────────────────
function GatewayPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const [users, setUsers] = useState(1_240_912);
  const [latency, setLatency] = useState(38);
  const [uptime] = useState(99.99);

  // Chat state — persisted into localStorage so it survives the redirect into /workspace.
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("aether-chat") ?? "[]"); } catch { return []; }
  });
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) navigate({ to: "/workspace" }); });
  }, [navigate]);

  // Seed welcome
  useEffect(() => {
    if (msgs.length === 0) {
      setMsgs([{ id: crypto.randomUUID(), role: "bot", text: "Welcome to **Aether** — the intelligent ecosystem for modern workspaces. I'm your concierge. Ask me about *pricing*, *features*, *security*, or how to *get started*." }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { localStorage.setItem("aether-chat", JSON.stringify(msgs)); }, [msgs]);
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [msgs, typing]);

  // Live metric ticker
  useEffect(() => {
    const t = setInterval(() => {
      setUsers((u) => u + Math.floor(Math.random() * 7) + 1);
      setLatency(() => 32 + Math.floor(Math.random() * 18));
    }, 1800);
    return () => clearInterval(t);
  }, []);

  // Validation helpers
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const pwScore = scorePw(password);
  const canSubmit = emailOk && password.length >= 8 && (mode === "signin" || fullName.trim().length >= 2);

  const send = (text?: string) => {
    const t = (text ?? draft).trim();
    if (!t) return;
    setDraft("");
    setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "user", text: t }]);
    setTyping(true);
    const delay = 600 + Math.min(1400, t.length * 14);
    setTimeout(() => {
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "bot", text: reply(t) }]);
      setTyping(false);
    }, delay);
  };

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
        toast.success("Account created. Check your inbox to confirm — then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate({ to: "/workspace" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (provider: "google" | "apple") => {
    try {
      await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/workspace` });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "OAuth failed");
    }
  };

  return (
    <div className="aether-gateway fixed inset-0 z-[60] grid grid-cols-1 lg:grid-cols-2 bg-[#09090B] text-[#FAFAFA] overflow-hidden">
      <style>{styles}</style>

      {/* ─────────── LEFT: Brand Statement ─────────── */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-r border-[#1c1c20]">
        <div className="ag-grid" aria-hidden />
        <div className="ag-glow ag-glow-1" aria-hidden />
        <div className="ag-glow ag-glow-2" aria-hidden />

        <div className="relative z-10 flex items-center gap-3">
          <LogoMark />
          <span className="text-[15px] font-semibold tracking-tight">Aether</span>
          <span className="ml-auto text-[11px] font-mono uppercase tracking-[0.18em] text-[#A1A1AA]">Enterprise Pro</span>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-mono uppercase tracking-[0.22em] text-[#A1A1AA] mb-6">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live · SOC 2 Type II
          </div>
          <h1 className="text-[44px] xl:text-[54px] leading-[1.1] font-semibold tracking-[-0.02em]">
            The Intelligent Ecosystem<br/>
            for <span className="ag-grad">Modern Workspaces.</span>
          </h1>
          <p className="mt-5 text-[15px] leading-[1.6] text-[#A1A1AA] max-w-lg">
            Real-time analytics, identity governance, and global infrastructure controls — orchestrated through a single, refined surface.
          </p>

          {/* Live metric cluster */}
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-lg">
            <MetricCard label="Active Users" value={users.toLocaleString()} accent="indigo" />
            <MetricCard label="API Uptime" value={`${uptime.toFixed(2)}%`} accent="emerald" />
            <MetricCard label="P50 Latency" value={`${latency}ms`} accent="amber" />
          </div>
        </div>

        {/* Pre-auth concierge */}
        <Chat
          embedded
          open={open}
          expanded={expanded}
          msgs={msgs}
          draft={draft}
          typing={typing}
          scrollerRef={scroller}
          onDraft={setDraft}
          onSend={() => send()}
          onSuggest={(s) => send(s)}
          onToggleOpen={() => setOpen((o) => !o)}
          onToggleExpand={() => setExpanded((e) => !e)}
          onClear={() => setMsgs([{ id: crypto.randomUUID(), role: "bot", text: "History cleared. How can I help you next?" }])}
        />

        <div className="relative z-10 text-[11px] font-mono uppercase tracking-[0.18em] text-[#52525B]">
          © {new Date().getFullYear()} Aether Systems · All rights reserved
        </div>
      </aside>

      {/* ─────────── RIGHT: Auth ─────────── */}
      <section className="relative flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="absolute inset-0 ag-grid-light pointer-events-none opacity-40" aria-hidden />
        <div className="relative w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8"><LogoMark /><span className="text-[15px] font-semibold">Aether</span></div>

          <h2 className="text-[28px] leading-[1.2] font-semibold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your workspace"}
          </h2>
          <p className="mt-2 text-[14px] text-[#A1A1AA]">
            {mode === "signin" ? "Enter your credentials to access the workspace." : "Start with the free Starter tier — no card required."}
          </p>

          {/* Tabs */}
          <div className="relative mt-7 grid grid-cols-2 rounded-xl bg-[#121214] border border-[#27272A] p-1">
            <button
              type="button" onClick={() => setMode("signin")}
              className={`relative z-10 py-2.5 text-[13px] font-medium transition-colors ${mode === "signin" ? "text-white" : "text-[#A1A1AA] hover:text-white"}`}
              aria-pressed={mode === "signin"}
            >Sign In</button>
            <button
              type="button" onClick={() => setMode("signup")}
              className={`relative z-10 py-2.5 text-[13px] font-medium transition-colors ${mode === "signup" ? "text-white" : "text-[#A1A1AA] hover:text-white"}`}
              aria-pressed={mode === "signup"}
            >Create Account</button>
            <span
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-gradient-to-b from-[#1f1f24] to-[#16161a] border border-[#2d2d33] shadow-[0_8px_24px_-12px_rgba(99,102,241,0.45)] ag-tab"
              style={{ transform: `translateX(${mode === "signin" ? "4px" : "calc(100% + 4px)"})` }}
              aria-hidden
            />
          </div>

          <form onSubmit={submitAuth} className="mt-6 space-y-4" noValidate>
            {mode === "signup" && (
              <FloatField id="fullName" label="Full Name" value={fullName} onChange={setFullName} autoComplete="name" />
            )}
            <FloatField id="email" type="email" label="Work Email" value={email} onChange={setEmail} autoComplete="email"
              error={email.length > 0 && !emailOk ? "Enter a valid email address" : undefined} />

            <div>
              <FloatField
                id="password" type={showPw ? "text" : "password"} label="Password"
                value={password} onChange={setPassword} autoComplete={mode === "signin" ? "current-password" : "new-password"}
                trailing={
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="text-[#A1A1AA] hover:text-white" aria-label={showPw ? "Hide password" : "Show password"}>
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
                error={mode === "signup" && password.length > 0 && password.length < 8 ? "Use 8+ characters" : undefined}
              />
              {mode === "signup" && password.length > 0 && <PwMeter score={pwScore} />}
            </div>

            <button
              type="submit" disabled={!canSubmit || busy}
              className="ag-primary group relative w-full h-12 rounded-xl font-semibold text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 inline-flex items-center justify-center gap-2">
                {busy ? <Loader2 className="size-4 animate-spin" /> : mode === "signin" ? "Sign In" : "Create Account"}
                {!busy && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
              </span>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="h-px flex-1 bg-[#27272A]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#52525B]">or continue with</span>
              <div className="h-px flex-1 bg-[#27272A]" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <SocialBtn label="Google" onClick={() => oauth("google")}><GoogleIcon /></SocialBtn>
              <SocialBtn label="Apple" onClick={() => oauth("apple")}><AppleIcon /></SocialBtn>
              <SocialBtn label="GitHub" onClick={() => toast.message("GitHub SSO is enabled on Enterprise Pro plans.")}><GitHubIcon /></SocialBtn>
            </div>

            <p className="text-[12px] text-[#A1A1AA] text-center pt-2">
              By continuing you agree to our <button type="button" onClick={() => toast.message("Terms of Service · v4.2 — available inside the workspace.")} className="text-white underline-offset-4 hover:underline">Terms</button> & <button type="button" onClick={() => toast.message("Privacy Policy · v3.1 — GDPR-aligned, SOC 2 Type II.")} className="text-white underline-offset-4 hover:underline">Privacy</button>.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}

// ────────────────────────────── Bits ──────────────────────────────
function LogoMark() {
  return (
    <span className="relative grid place-items-center size-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] shadow-[0_8px_24px_-8px_rgba(99,102,241,0.6)]">
      <svg viewBox="0 0 24 24" className="size-5 text-white"><path fill="currentColor" d="M12 2 3 20h6l3-6 3 6h6L12 2Zm0 8 1.6 3.2h-3.2L12 10Z"/></svg>
    </span>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent: "indigo" | "emerald" | "amber" }) {
  const dot = accent === "indigo" ? "bg-indigo-400" : accent === "emerald" ? "bg-emerald-400" : "bg-amber-400";
  return (
    <div className="relative rounded-xl bg-[#121214]/80 border border-[#27272A] p-3 backdrop-blur-md overflow-hidden">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-[#A1A1AA]">
        <span className={`size-1.5 rounded-full ${dot} animate-pulse`} />{label}
      </div>
      <div className="mt-1.5 text-[18px] font-semibold tabular-nums tracking-tight">{value}</div>
    </div>
  );
}

function FloatField({ id, label, value, onChange, type = "text", autoComplete, trailing, error }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  type?: string; autoComplete?: string; trailing?: React.ReactNode; error?: string;
}) {
  const filled = value.length > 0;
  return (
    <div>
      <div className={`relative rounded-xl border ${error ? "border-rose-500/50" : "border-[#27272A] focus-within:border-indigo-500/70"} bg-[#121214] transition-colors`}>
        <input
          id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete}
          className="peer w-full bg-transparent px-3.5 pt-5 pb-2 text-[14px] text-white outline-none placeholder-transparent"
          placeholder={label}
        />
        <label htmlFor={id} className={`pointer-events-none absolute left-3.5 transition-all ${filled ? "top-1.5 text-[10px] uppercase tracking-[0.18em] text-[#A1A1AA]" : "top-3.5 text-[14px] text-[#A1A1AA]"} peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-indigo-300`}>{label}</label>
        {trailing && <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error && <div className="mt-1.5 text-[12px] text-rose-400">{error}</div>}
    </div>
  );
}

function scorePw(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}
function PwMeter({ score }: { score: number }) {
  const labels = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];
  const colors = ["bg-rose-500", "bg-orange-500", "bg-amber-400", "bg-emerald-400", "bg-emerald-400"];
  return (
    <div className="mt-2">
      <div className="grid grid-cols-4 gap-1.5">
        {[0,1,2,3].map((i) => (
          <span key={i} className={`h-1 rounded-full transition-colors ${i < score ? colors[score-1] : "bg-[#27272A]"}`} />
        ))}
      </div>
      <div className="mt-1 text-[11px] text-[#A1A1AA]">Password strength: <span className="text-white">{labels[score]}</span></div>
    </div>
  );
}

function SocialBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={`Continue with ${label}`}
      className="group h-11 rounded-xl bg-[#121214] border border-[#27272A] hover:border-indigo-500/50 hover:bg-[#15151a] transition-all active:scale-[0.98] flex items-center justify-center">
      <span className="opacity-90 group-hover:opacity-100 transition-opacity">{children}</span>
    </button>
  );
}
function GoogleIcon() { return (<svg viewBox="0 0 24 24" className="size-4"><path fill="#FFC107" d="M21.8 10.2H12v3.6h5.6c-.5 2.3-2.5 3.6-5.6 3.6-3.4 0-6.1-2.7-6.1-6.1S8.6 5.2 12 5.2c1.5 0 2.9.6 4 1.5l2.6-2.6C16.9 2.6 14.6 1.7 12 1.7 6.6 1.7 2.3 6 2.3 11.4S6.6 21 12 21c5.6 0 9.4-3.9 9.4-9.5 0-.5 0-.9-.1-1.3Z"/><path fill="#FF3D00" d="M3.2 7 6.2 9.1C7 7.2 9.3 5.7 12 5.7c1.5 0 2.9.6 4 1.5l2.6-2.6C16.9 2.6 14.6 1.7 12 1.7 8.1 1.7 4.8 3.9 3.2 7Z"/><path fill="#4CAF50" d="M12 21c2.6 0 4.9-.9 6.6-2.4l-3-2.5c-.9.7-2.1 1.1-3.6 1.1-3 0-5.5-2-6.4-4.7L2.9 15c1.6 3.7 5.1 6 9.1 6Z"/><path fill="#1976D2" d="M21.8 10.2H12v3.6h5.6c-.3 1.1-.9 2.1-1.8 2.8l3 2.5C20.4 17.6 22 14.7 22 11.4c0-.4 0-.8-.2-1.2Z"/></svg>); }
function AppleIcon() { return (<svg viewBox="0 0 24 24" className="size-4"><path fill="#FAFAFA" d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.7 2.5 2.9 2.4 1.2-.1 1.6-.8 3-.8s1.8.8 3 .8c1.2 0 2.1-1.2 2.8-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.4-.9-2.4-3.6ZM14.5 5.4c.6-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.4-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.5 2.8-1.3Z"/></svg>); }
function GitHubIcon() { return (<svg viewBox="0 0 24 24" className="size-4"><path fill="#FAFAFA" d="M12 .5C5.7.5.6 5.6.6 12c0 5 3.3 9.3 7.8 10.8.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.5-.3-5.2-1.3-5.2-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.2 5.7.4.3.8 1 .8 2.1v3.1c0 .3.2.7.8.6 4.6-1.5 7.8-5.8 7.8-10.8C23.4 5.6 18.3.5 12 .5Z"/></svg>); }

// ────────────────────────────── Chat ──────────────────────────────
function Chat({
  embedded, open, expanded, msgs, draft, typing, scrollerRef,
  onDraft, onSend, onSuggest, onToggleOpen, onToggleExpand, onClear,
}: {
  embedded: boolean; open: boolean; expanded: boolean;
  msgs: ChatMsg[]; draft: string; typing: boolean;
  scrollerRef: React.RefObject<HTMLDivElement | null>;
  onDraft: (s: string) => void; onSend: () => void; onSuggest: (s: string) => void;
  onToggleOpen: () => void; onToggleExpand: () => void; onClear: () => void;
}) {
  return (
    <div className={`relative z-10 ${embedded ? "max-w-xl" : ""} ${expanded ? "fixed inset-6 z-[80] max-w-none" : ""}`}>
      <div className="ag-chat rounded-2xl border border-[#27272A] bg-[#0c0c0e]/85 backdrop-blur-xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e22] bg-[#0e0e11]/80">
          <span className="relative grid place-items-center size-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700">
            <Sparkles className="size-3.5 text-white" />
          </span>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold">Aether AI Concierge</div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-400"><span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online</div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={onClear} className="size-7 grid place-items-center rounded-md text-[#A1A1AA] hover:text-white hover:bg-white/5" aria-label="Clear history"><Trash2 className="size-3.5" /></button>
            <button onClick={onToggleExpand} className="size-7 grid place-items-center rounded-md text-[#A1A1AA] hover:text-white hover:bg-white/5" aria-label={expanded ? "Restore" : "Expand"}><Maximize2 className="size-3.5" /></button>
            <button onClick={onToggleOpen} className="size-7 grid place-items-center rounded-md text-[#A1A1AA] hover:text-white hover:bg-white/5" aria-label={open ? "Minimize" : "Open"}><Minus className="size-3.5" /></button>
          </div>
        </div>

        {open && (
          <>
            <div ref={scrollerRef} className={`ag-scroll px-4 py-4 space-y-3 overflow-y-auto ${expanded ? "h-[calc(100vh-220px)]" : "h-[260px]"}`}>
              {msgs.map((m) => (
                <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "bot" && (
                    <span className="shrink-0 mt-0.5 grid place-items-center size-7 rounded-lg bg-gradient-to-br from-indigo-500/30 to-indigo-700/30 border border-indigo-500/30">
                      <Sparkles className="size-3.5 text-indigo-300" />
                    </span>
                  )}
                  <div className={`max-w-[78%] text-[13px] leading-[1.55] px-3.5 py-2.5 rounded-2xl ${m.role === "user" ? "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-br-md" : "bg-white/5 border border-white/10 text-[#FAFAFA] rounded-bl-md"}`}
                    dangerouslySetInnerHTML={{ __html: md(m.text) }}
                  />
                </div>
              ))}
              {typing && (
                <div className="flex gap-2 justify-start">
                  <span className="shrink-0 mt-0.5 grid place-items-center size-7 rounded-lg bg-gradient-to-br from-indigo-500/30 to-indigo-700/30 border border-indigo-500/30"><Sparkles className="size-3.5 text-indigo-300" /></span>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/5 border border-white/10 flex items-center gap-1.5">
                    <span className="ag-dot" /><span className="ag-dot" style={{ animationDelay: "0.15s" }} /><span className="ag-dot" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              )}
            </div>

            {msgs.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {["Pricing", "Key features", "Security", "How to get started"].map((s) => (
                  <button key={s} onClick={() => onSuggest(s)} className="text-[11px] px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-indigo-500/60 hover:bg-white/10 transition-colors">{s}</button>
                ))}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); onSend(); }} className="p-3 border-t border-[#1e1e22] flex gap-2 bg-[#0e0e11]/80">
              <input
                value={draft} onChange={(e) => onDraft(e.target.value)} placeholder="Ask Aether anything…"
                className="flex-1 bg-[#121214] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-indigo-500/70"
                aria-label="Message"
              />
              <button type="submit" disabled={!draft.trim()} className="ag-primary size-10 rounded-xl grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Send">
                <Send className="size-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────── Styles ──────────────────────────────
const styles = `
.aether-gateway, .aether-gateway * { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
.aether-gateway button, .aether-gateway a, .aether-gateway input { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.aether-gateway button:active { transform: scale(0.98); }
.ag-grad { background: linear-gradient(120deg, #818CF8 0%, #6366F1 50%, #4F46E5 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.ag-grid { position: absolute; inset: -1px; background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 48px 48px; mask-image: radial-gradient(ellipse at 30% 40%, #000 30%, transparent 75%); animation: ag-drift 40s linear infinite; }
.ag-grid-light { background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 64px 64px; }
@keyframes ag-drift { from { background-position: 0 0, 0 0; } to { background-position: 48px 48px, 48px 48px; } }
.ag-glow { position: absolute; border-radius: 9999px; filter: blur(80px); opacity: 0.55; pointer-events: none; }
.ag-glow-1 { width: 480px; height: 480px; background: radial-gradient(circle, #6366F1 0%, transparent 65%); top: -80px; left: -80px; animation: ag-pulse 9s ease-in-out infinite; }
.ag-glow-2 { width: 520px; height: 520px; background: radial-gradient(circle, #4F46E5 0%, transparent 65%); bottom: -100px; right: -120px; animation: ag-pulse 11s ease-in-out infinite reverse; }
@keyframes ag-pulse { 0%,100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.08); opacity: 0.7; } }
.ag-tab { transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1); }
.ag-primary { background: linear-gradient(180deg, #6366F1 0%, #4F46E5 100%); color: white; box-shadow: 0 10px 30px -10px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.18); position: relative; }
.ag-primary::before { content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px; background: linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.05) 40%, rgba(99,102,241,0.6)); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; opacity: 0.7; }
.ag-primary:hover:not(:disabled) { box-shadow: 0 16px 40px -10px rgba(99,102,241,0.7), inset 0 1px 0 rgba(255,255,255,0.22); transform: translateY(-1px); }
.ag-scroll::-webkit-scrollbar { width: 6px; }
.ag-scroll::-webkit-scrollbar-track { background: transparent; }
.ag-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 999px; }
.ag-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
.ag-dot { width: 6px; height: 6px; border-radius: 999px; background: #A1A1AA; display: inline-block; animation: ag-dot 1.2s ease-in-out infinite; }
@keyframes ag-dot { 0%,80%,100% { transform: scale(0.7); opacity: 0.4; } 40% { transform: scale(1.1); opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .ag-glow, .ag-grid { animation: none !important; }
  .aether-gateway *, .ag-tab { transition: none !important; }
}
`;
