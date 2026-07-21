import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X, Eye, EyeOff, Loader2, Sparkles, Mic } from "lucide-react";
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
const KEY_COUNT = "guest_chat_count";
const KEY_DISMISSED = "cp_guest_dismissed";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const openingMsg = `${greeting()}! Welcome to CareerPilot AI 👋 Ask me 3 free career questions.`;

  useEffect(() => {
    const priorMsgs = readMsgs();
    const priorCount = readCount();
    setMsgs(priorMsgs);
    setCount(priorCount);
    setDismissed(sessionStorage.getItem(KEY_DISMISSED) === "1");
    setHydrated(true);
  }, []);

  const active = hydrated && !loading && !isAuthenticated && !dismissed;

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => { document.body.style.overflow = prev; };
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, streaming]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;

    if (count >= GUEST_LIMIT) {
      toast.info("You've used your 3 free guest questions! Sign in now to unlock your full career dashboard.");
      setShowAuthModal(true);
      return;
    }

    setInput("");
    const nextCount = count + 1;
    const history: Msg[] = [...msgs, { role: "user", content }];
    setMsgs([...history, { role: "assistant", content: "" }]);
    setCount(nextCount);
    localStorage.setItem(KEY_COUNT, String(nextCount));
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
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
      const final: Msg[] = [...history, { role: "assistant", content: assistant }];
      localStorage.setItem(KEY_MSGS, JSON.stringify(final));
      if (nextCount >= GUEST_LIMIT) {
        setTimeout(() => {
          toast.info("That was your last free question. Sign in to keep exploring.");
        }, 800);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setStreaming(false);
    }
  };

  const toggleMic = () => {
    setListening((v) => !v);
    toast.info("Voice input is coming soon.");
    setTimeout(() => setListening(false), 800);
  };

  const dismiss = () => {
    sessionStorage.setItem(KEY_DISMISSED, "1");
    setDismissed(true);
  };

  const remaining = Math.max(0, GUEST_LIMIT - count);
  const locked = count >= GUEST_LIMIT;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="guest-overlay"
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
          transition={{ duration: 0.5, type: "spring" }}
          className="fixed inset-0 z-[9990] bg-black/80 backdrop-blur-3xl flex flex-col items-center justify-center p-4 md:p-6"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 25% 30%, rgba(34,211,238,0.18), transparent 55%), radial-gradient(ellipse at 75% 75%, rgba(139,92,246,0.20), transparent 55%)",
            }}
          />

          <button
            onClick={dismiss}
            className="absolute top-5 right-5 text-xs text-white/60 hover:text-white transition-colors inline-flex items-center gap-1.5 z-10"
          >
            Explore first <X className="size-3.5" />
          </button>

          <div className="relative w-full max-w-2xl flex flex-col items-center">
            {/* Floating avatar */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative mb-4"
            >
              <div
                className="absolute inset-0 rounded-full blur-3xl -z-10"
                style={{ background: "radial-gradient(circle, rgba(16,185,129,0.55), transparent 65%)" }}
              />
              <div className="size-20 md:size-24 rounded-full overflow-hidden border border-white/20 bg-white/5 backdrop-blur-xl flex items-center justify-center shadow-[0_20px_60px_rgba(16,185,129,0.5)]">
                <img
                  src={chatbotLogo}
                  alt="Pilot AI"
                  width={192}
                  height={192}
                  className="size-16 md:size-20 object-contain drop-shadow-[0_0_18px_rgba(16,185,129,0.8)]"
                />
              </div>
              <Sparkles className="absolute -top-1 -right-1 size-4 text-emerald-300" />
            </motion.div>

            {/* Scrollable chat history */}
            <div
              ref={scrollRef}
              className="flex flex-col gap-4 w-full max-w-2xl h-[400px] overflow-y-auto scrollbar-hide px-4 pb-4"
              style={{ scrollbarWidth: "none" }}
            >
              {/* opening greeting */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="self-start max-w-[85%] bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm p-4 text-white text-sm leading-relaxed border border-white/10"
              >
                {openingMsg}
              </motion.div>

              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={
                    m.role === "user"
                      ? "self-end max-w-[85%] bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl rounded-tr-sm p-4 text-white shadow-lg text-sm leading-relaxed"
                      : "self-start max-w-[85%] bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm p-4 text-white text-sm leading-relaxed border border-white/10"
                  }
                >
                  {m.role === "assistant" ? (
                    <div dangerouslySetInnerHTML={{ __html: renderMd(m.content || "Thinking…") }} />
                  ) : (
                    m.content
                  )}
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Glass input pill */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="w-full max-w-2xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full px-4 md:px-6 py-3 flex items-center gap-2 shadow-2xl"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask CareerPilot AI anything..."
                disabled={streaming}
                className="flex-1 bg-transparent text-sm md:text-[15px] text-white placeholder:text-white/50 focus:outline-none px-2"
              />
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={toggleMic}
                className={`p-2 rounded-full transition-all ${
                  listening
                    ? "text-cyan-400 bg-white/10"
                    : "text-white/50 hover:text-cyan-400 hover:bg-white/10"
                }`}
                aria-label="Voice input"
              >
                <Mic className="size-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                type="submit"
                disabled={streaming || !input.trim()}
                className="size-10 rounded-full flex items-center justify-center text-white disabled:opacity-50 border border-white/25 shadow-[0_8px_24px_rgba(34,211,238,0.35)]"
                style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.85), rgba(139,92,246,0.85))" }}
                aria-label="Send"
              >
                {streaming ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </motion.button>
            </form>

            {/* Remaining pill */}
            <motion.div
              key={`pill-${count}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-widest border ${
                locked
                  ? "bg-red-500/10 border-red-400/30 text-red-200"
                  : "bg-white/10 border-white/20 text-white/80"
              }`}
            >
              <span className={`size-1.5 rounded-full ${locked ? "bg-red-400" : "bg-emerald-400 animate-pulse"}`} />
              {locked
                ? "Free trial used — sign in to continue"
                : <>Free Questions Remaining: <span className="text-white font-semibold">{remaining}/{GUEST_LIMIT}</span></>}
            </motion.div>
          </div>

          <AuthGateModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </motion.div>
      )}
    </AnimatePresence>
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
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-2xl" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative w-full max-w-[460px] rounded-3xl bg-white/[0.05] backdrop-blur-3xl border border-white/15 shadow-[0_32px_80px_rgba(0,0,0,0.6)] p-8 md:p-10 text-white overflow-y-auto max-h-[92vh]"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white" aria-label="Close">
              <X className="size-4" />
            </button>

            <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-300 mb-3">Unlock full access</div>
            <h3 className="text-[22px] md:text-2xl font-semibold tracking-tight leading-tight">
              Unlock Your Full Career Roadmap & Intelligence Dashboard
            </h3>
            <p className="mt-2 text-[13px] text-white/60 leading-relaxed">
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
