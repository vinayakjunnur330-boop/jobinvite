import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X, Eye, EyeOff, Loader2, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaGithub, FaFacebook, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import chatbotLogo from "@/assets/chatbot-logo.png";

type Msg = { role: "user" | "assistant"; content: string };
type Provider = "google" | "apple" | "github" | "facebook" | "instagram" | "twitter";

const GUEST_LIMIT = 3;
const KEY_MSGS = "cp_guest_msgs";
const KEY_COUNT = "cp_guest_count";
const KEY_DISMISSED = "cp_guest_dismissed"; // session-only

function readMsgs(): Msg[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY_MSGS) || "[]"); } catch { return []; }
}
function readCount(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(KEY_COUNT) || "0");
}

function renderMd(text: string) {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escape(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-white/10 text-[11px] font-mono">$1</code>')
    .replace(/\n/g, "<br/>");
}

export function GuestConcierge() {
  const { isAuthenticated, loading } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [count, setCount] = useState(0);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMsgs(readMsgs());
    setCount(readCount());
    setDismissed(sessionStorage.getItem(KEY_DISMISSED) === "1");
    setHydrated(true);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, streaming]);

  const active = hydrated && !loading && !isAuthenticated && !dismissed;

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [active]);

  const persist = (next: Msg[], nextCount: number) => {
    localStorage.setItem(KEY_MSGS, JSON.stringify(next));
    localStorage.setItem(KEY_COUNT, String(nextCount));
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    if (count >= GUEST_LIMIT) { setGateOpen(true); return; }
    setInput("");
    const nextCount = count + 1;
    const next: Msg[] = [...msgs, { role: "user", content }, { role: "assistant", content: "" }];
    setMsgs(next);
    setCount(nextCount);
    setStreaming(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(0, -1) }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = ""; let assistant = ""; let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(json);
            const delta = p.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistant += delta;
              setMsgs((cur) => {
                const c = cur.slice();
                c[c.length - 1] = { role: "assistant", content: assistant };
                return c;
              });
            }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
      const final: Msg[] = [...next.slice(0, -1), { role: "assistant", content: assistant }];
      persist(final, nextCount);
      if (nextCount >= GUEST_LIMIT) {
        setTimeout(() => setGateOpen(true), 900);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setStreaming(false);
    }
  };

  const dismiss = () => {
    sessionStorage.setItem(KEY_DISMISSED, "1");
    setDismissed(true);
  };

  if (!active) return null;

  const remaining = Math.max(0, GUEST_LIMIT - count);

  return (
    <div className="fixed inset-0 z-[10000]">
      {/* blurred teaser backdrop */}
      <div className="absolute inset-0 backdrop-blur-2xl bg-black/80" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at 20% 30%, rgba(34,211,238,0.18), transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(139,92,246,0.20), transparent 55%)",
        }}
      />

      {/* dismiss */}
      <button
        onClick={dismiss}
        className="absolute top-5 right-5 text-xs text-white/50 hover:text-white transition-colors inline-flex items-center gap-1.5"
      >
        Explore first <X className="size-3.5" />
      </button>

      <div className="relative h-full w-full flex flex-col items-center justify-center px-6">
        {/* Mascot + speech */}
        <div className="w-full max-w-[560px] flex flex-col items-center">
          <AnimatePresence>
            {msgs.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-4 max-w-[440px] rounded-2xl px-5 py-3.5 bg-white/[0.06] backdrop-blur-xl border border-white/10 text-center text-sm text-white/85 shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
              >
                Hey, welcome to <strong className="text-white">CareerPilot AI</strong>! Ask me{" "}
                <span className="text-cyan-300 font-semibold">3 free career questions</span> to discover your path.
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            className="relative size-28 rounded-full flex items-center justify-center mb-2"
            style={{
              background: "radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)",
            }}
          >
            <div className="size-24 rounded-full overflow-hidden border border-white/20 bg-white/5 backdrop-blur-xl flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.45)]">
              <img src={chatbotLogo} alt="Pilot AI" width={256} height={256} className="size-20 object-contain drop-shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 size-4 text-emerald-300" />
          </motion.div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-white/50 mb-6">
            Pilot · AI Concierge
          </div>

          {/* Conversation */}
          {msgs.length > 0 && (
            <div className="w-full max-h-[38vh] overflow-y-auto overscroll-contain space-y-2.5 mb-4 pr-1">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] text-sm leading-relaxed px-4 py-2.5 rounded-2xl ${
                    m.role === "user"
                      ? "bg-white text-black rounded-br-sm"
                      : "bg-white/[0.06] backdrop-blur-xl border border-white/10 text-white/90 rounded-bl-sm"
                  }`}>
                    <div dangerouslySetInnerHTML={{ __html: renderMd(m.content || (streaming && i === msgs.length - 1 ? "▍" : "")) }} />
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="w-full flex items-center gap-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.35)] px-4 py-2.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={count >= GUEST_LIMIT ? "Sign in to keep chatting…" : "Ask about your future career…"}
              disabled={streaming || count >= GUEST_LIMIT}
              className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="size-9 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 transition-colors"
              aria-label="Send"
            >
              {streaming ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </form>

          <div className="mt-3 text-[11px] font-mono text-white/50 flex items-center gap-2">
            <Lock className="size-3" />
            {remaining > 0
              ? <>You have <span className="text-cyan-300 font-semibold">{remaining}</span> free question{remaining === 1 ? "" : "s"} left</>
              : <>Free trial used — sign in to continue</>}
          </div>
        </div>
      </div>

      <AuthGateModal open={gateOpen} onClose={() => setGateOpen(false)} />
    </div>
  );
}

function AuthGateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<Provider | null>(null);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = emailOk && password.length >= 8 && (mode === "signin" || fullName.trim().length >= 2);

  const submit = async (e: React.FormEvent) => {
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
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
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
      toast.info(`${provider[0].toUpperCase() + provider.slice(1)} sign-in is coming soon. Continue with Google or Apple for now.`);
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

  const socials: { id: Provider; Icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "google", Icon: (p) => <FcGoogle {...p} /> },
    { id: "apple", Icon: (p) => <FaApple {...p} /> },
    { id: "github", Icon: (p) => <FaGithub {...p} /> },
    { id: "facebook", Icon: (p) => <FaFacebook {...p} className={`${p.className ?? ""} text-[#1877F2]`} /> },
    { id: "instagram", Icon: (p) => <FaInstagram {...p} className={`${p.className ?? ""} text-[#E1306C]`} /> },
    { id: "twitter", Icon: (p) => <FaXTwitter {...p} /> },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10001] flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-2xl" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative w-full max-w-[460px] rounded-3xl bg-white/[0.04] backdrop-blur-3xl border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] p-8 md:p-10 text-white overflow-y-auto max-h-[92vh]"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white" aria-label="Close">
              <X className="size-4" />
            </button>

            <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-300 mb-3">Unlock full access</div>
            <h3 className="text-[22px] md:text-2xl font-semibold tracking-tight leading-tight">
              Unlock Your Full Career Roadmap & Intelligence Dashboard
            </h3>
            <p className="mt-2 text-[13px] text-white/55 leading-relaxed">
              You've used your 3 free guest questions. Sign in to save your conversation, analyze your
              resume, and access 44+ career domains.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {socials.map(({ id, Icon }) => (
                <button
                  key={id}
                  onClick={() => oauth(id)}
                  disabled={!!oauthBusy}
                  className="aspect-square flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/[0.12] border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.04] disabled:opacity-60"
                  aria-label={`Continue with ${id}`}
                >
                  {oauthBusy === id ? <Loader2 className="size-5 animate-spin text-white" /> : <Icon className="size-5 text-white" />}
                </button>
              ))}
            </div>

            <div className="my-6 flex items-center gap-3 text-[11px] text-white/40">
              <div className="flex-1 h-px bg-white/10" />
              OR CONTINUE WITH EMAIL
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="flex gap-1 mb-4 text-[13px]">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${mode === m ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"}`}
                >
                  {m === "signin" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="space-y-3">
              {mode === "signup" && (
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="h-11 w-full bg-transparent border border-white/10 rounded-lg px-4 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm outline-none"
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="h-11 w-full bg-transparent border border-white/10 rounded-lg px-4 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm outline-none"
              />
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 8 chars)"
                  className="h-11 w-full bg-transparent border border-white/10 rounded-lg px-4 pr-10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm outline-none"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80">
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={!canSubmit || busy}
                className="w-full h-11 rounded-lg bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : (mode === "signin" ? "Sign in" : "Create account")}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
