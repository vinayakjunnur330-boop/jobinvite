import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X, Eye, EyeOff, Loader2, RotateCcw, ThumbsUp, ThumbsDown, Sun, Moon } from "lucide-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaGithub, FaFacebook, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useTheme } from "@/lib/theme";


type Msg = { role: "user" | "assistant"; content: string };
type Provider = "google" | "apple" | "github" | "facebook" | "instagram" | "twitter";

const GUEST_LIMIT = 3;
const KEY_MSGS = "cp_guest_msgs";
const KEY_COUNT = "guest_chat_count";

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

function TopRightControls() {
  const navigate = useNavigate();
  const [theme, , toggle] = useTheme();
  return (
    <div className="absolute top-6 right-8 z-[100] flex items-center gap-3">
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white transition-all duration-300 cursor-pointer"
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
      <button
        onClick={() => navigate({ to: "/login", search: { form: "1" } })}
        className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-medium transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)] text-sm cursor-pointer"
      >
        Sign In / Sign Up
      </button>
    </div>
  );
}

export function GuestConcierge() {
  const { isAuthenticated, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search as Record<string, unknown> });
  const loginShowingForm = pathname === "/login" && search?.form === "1";
  const onAuthRoute = pathname === "/admin-login" || pathname.startsWith("/auth") || loginShowingForm;
  const [hydrated, setHydrated] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [count, setCount] = useState(0);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const openingMsg = `${greeting()}! Hey! I'm Zoiee, your friendly learning buddy. Ready to discover your perfect career today? 🤩`;

  useEffect(() => {
    setMsgs(readMsgs());
    setCount(readCount());
    setHydrated(true);
  }, []);

  const authResolving = !hydrated || loading;
  const active = hydrated && !loading && !isAuthenticated && !onAuthRoute;
  const showLoadingGate = authResolving && !onAuthRoute;

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => { document.body.style.overflow = prev; };
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

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
      const { data: sessionData } = await supabase.auth
        .getSession()
        .catch(() => ({ data: { session: null } as { session: null } }));
      const token = sessionData.session?.access_token;
      if (!token) {
        // Server now requires auth for the paid AI gateway. Prompt sign-in.
        setMsgs(history);
        setStreaming(false);
        toast.info("Sign in to chat with Zoiee — it keeps our AI free of abuse.");
        setShowAuthModal(true);
        return;
      }
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
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
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setStreaming(false);
    }
  };

  const resetChat = () => {
    setMsgs([]);
    setCount(0);
    localStorage.removeItem(KEY_MSGS);
    localStorage.removeItem(KEY_COUNT);
    toast.success("Conversation cleared.");
  };

  const remaining = Math.max(0, GUEST_LIMIT - count);

  return (
    <>
      {showLoadingGate && (
        <div className="fixed inset-0 z-[9999] min-h-screen bg-[#050505] flex items-center justify-center">
          <Loader2 className="size-6 animate-spin text-white/60" />
        </div>
      )}
      <AnimatePresence>
        {active && (
        <motion.div
          key="guest-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[90] bg-[#0a0f1c]/70 backdrop-blur-3xl w-full h-[100dvh] flex flex-col md:flex-row"
        >
          {/* Ambient glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 20% 30%, rgba(34,211,238,0.15), transparent 55%), radial-gradient(ellipse at 80% 75%, rgba(139,92,246,0.18), transparent 55%)",
            }}
          />

          {/* Top-right controls */}
          <TopRightControls />

          {/* LEFT — mascot column (stacked on mobile, side on md+) */}
          <div className="w-full h-1/3 md:w-1/2 md:h-full shrink-0 flex flex-col items-center justify-center pt-8 md:pt-0 relative">
            <motion.img
              src="/robot-avatar.png"
              alt="CareerPilot AI Mascot"
              className="w-40 h-40 md:w-72 md:h-72 object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.4)] z-10"
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="w-24 md:w-32 h-3 md:h-4 bg-black/40 blur-md rounded-[100%] mt-4 md:mt-6" />
            <div className="mt-4 md:mt-8 text-center px-6">
              <div className="text-[10px] md:text-[11px] uppercase tracking-[0.28em] text-cyan-300/80">Zoiee · AI counselor</div>
              <div className="mt-2 text-white/70 text-xs md:text-sm">
                Free Questions Remaining:{" "}
                <span className="text-white font-semibold">{remaining}/{GUEST_LIMIT}</span>
              </div>
            </div>
          </div>

          {/* RIGHT — chat column */}
          <div className="w-full flex-1 md:w-1/2 md:h-full flex flex-col relative px-4 md:px-8 pb-4 pt-4 md:pt-16 min-h-0">
              {/* Chat history */}
              <div
                className="flex-1 min-h-0 w-full overflow-y-auto flex flex-col gap-4"
                style={{ scrollbarWidth: "none" }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="self-start bg-[#0b132b] border border-white/10 text-white p-4 rounded-2xl rounded-tl-sm shadow-lg max-w-[90%] md:max-w-[85%] text-sm leading-relaxed"
                >
                  {openingMsg}
                  <div className="mt-2 flex items-center gap-3 text-white/40">
                    <button className="hover:text-cyan-300 transition-colors" aria-label="Like"><ThumbsUp className="size-3.5" /></button>
                    <button className="hover:text-red-300 transition-colors" aria-label="Dislike"><ThumbsDown className="size-3.5" /></button>
                  </div>
                </motion.div>

                {msgs.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={
                      m.role === "user"
                        ? "self-end bg-white text-gray-900 p-3 rounded-2xl rounded-tr-sm shadow-md max-w-[90%] md:max-w-[75%] text-sm leading-relaxed"
                        : "self-start bg-[#0b132b] border border-white/10 text-white p-4 rounded-2xl rounded-tl-sm shadow-lg max-w-[90%] md:max-w-[85%] text-sm leading-relaxed"
                    }
                  >
                    {m.role === "assistant" ? (
                      <>
                        <div dangerouslySetInnerHTML={{ __html: renderMd(m.content || "Thinking…") }} />
                        {m.content && (
                          <div className="mt-2 flex items-center gap-3 text-white/40">
                            <button className="hover:text-cyan-300 transition-colors" aria-label="Like"><ThumbsUp className="size-3.5" /></button>
                            <button className="hover:text-red-300 transition-colors" aria-label="Dislike"><ThumbsDown className="size-3.5" /></button>
                          </div>
                        )}
                      </>
                    ) : (
                      m.content
                    )}
                  </motion.div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input bar wrapper */}
              <div className="w-full mt-4 shrink-0">
                <form
                  onSubmit={(e) => { e.preventDefault(); send(); }}
                  className="w-full flex items-center gap-2 bg-white rounded-lg p-1 shadow-2xl"
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Zoiee..."
                    disabled={streaming}
                    className="flex-1 min-w-0 bg-transparent border-none text-gray-900 px-3 md:px-4 py-3 focus:outline-none focus:ring-0 text-sm placeholder-gray-500"
                  />
                  <button
                    type="submit"
                    disabled={streaming || !input.trim()}
                    className="bg-[#0a0f1c] text-white p-3 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-60 shrink-0"
                    aria-label="Send"
                  >
                    {streaming ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={resetChat}
                    className="bg-[#0a0f1c] text-white p-3 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                    aria-label="Restart"
                  >
                    <RotateCcw className="size-4" />
                  </button>
                </form>
              </div>
            </div>

          <AuthGateModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </motion.div>
        )}
      </AnimatePresence>
    </>
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
