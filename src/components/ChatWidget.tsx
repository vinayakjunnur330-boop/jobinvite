import { useEffect, useRef, useState } from "react";
import { Send, X, Sparkles, RotateCcw, Mic, Volume2, Bot } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTED = [
  "Build me a 90-day roadmap to become an AI Engineer",
  "Compare UX Designer vs Product Manager careers",
  "How do I break into cybersecurity with no degree?",
  "Suggest 3 portfolio projects for a freelance video editor",
];

const seed: Msg[] = [
  { role: "assistant", content: "Hi — I'm **Pilot**, your AI career advisor. Ask me about any career, roadmap, skill gap, or interview prep." },
];

function renderMd(text: string) {
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escape(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-white/10 text-[11px] font-mono">$1</code>')
    .replace(/\n/g, "<br/>");
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Body scroll lock when open
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev || "unset"; };
    }
  }, [open]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, streaming, open]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    setInput("");
    const next: Msg[] = [...msgs, { role: "user", content }, { role: "assistant", content: "" }];
    setMsgs(next);
    setStreaming(true);
    abortRef.current = new AbortController();

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Please sign in to chat with Pilot.");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: next.slice(0, -1).map((m) => ({ role: m.role, content: m.content })) }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let assistant = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistant += delta;
              setMsgs((cur) => {
                const copy = cur.slice();
                copy[copy.length - 1] = { role: "assistant", content: assistant };
                return copy;
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
      setMsgs((cur) => {
        const copy = cur.slice();
        if (copy[copy.length - 1].role === "assistant" && copy[copy.length - 1].content === "") {
          copy[copy.length - 1] = { role: "assistant", content: `_${msg}_` };
        }
        return copy;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const retry = () => {
    const lastUser = [...msgs].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setMsgs((cur) => cur.slice(0, -1));
    setTimeout(() => send(lastUser.content), 50);
  };

  const startVoice = () => {
    const w = window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { toast.message("Voice input not supported in this browser"); return; }
    const r = new SR() as { lang: string; start: () => void; onresult: (e: { results: { 0: { transcript: string } }[] }) => void; onerror: () => void };
    r.lang = "en-US";
    r.onresult = (e: { results: { 0: { transcript: string } }[] }) => {
      setInput(e.results[0][0].transcript);
    };
    r.onerror = () => toast.error("Voice input failed");
    r.start();
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text.replace(/[*`_#>-]/g, ""));
    u.rate = 1.02; u.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="z-[9999]">
      {/* Floating toggle button — living AI orb */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ scale: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } }}
        className="bot-pulse fixed bottom-6 right-6 z-[9999] size-14 rounded-2xl flex items-center justify-center text-white gpu"
        style={{
          background: "linear-gradient(135deg, rgba(34,211,238,0.35), rgba(139,92,246,0.55), rgba(236,72,153,0.35))",
          border: "1px solid rgba(255,255,255,0.25)",
          backdropFilter: "blur(16px) saturate(160%)",
          boxShadow: "0 8px 32px -4px rgba(139,92,246,0.55), inset 0 0 20px rgba(255,255,255,0.08)",
        }}
        aria-label={open ? "Close chat" : "Open Pilot AI"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-center drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
          >
            {open ? <X className="size-6" /> : <Bot className="size-6" strokeWidth={2.2} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ transformOrigin: "bottom right" }}
            className="fixed z-[9999] inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[380px] sm:max-w-[calc(100vw-3rem)] sm:h-[min(600px,calc(100dvh-8rem))] sm:rounded-2xl bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(255,255,255,0.05),0_20px_60px_0_rgba(0,0,0,0.6)] flex flex-col overflow-hidden float-b"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.03]">

              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Pilot Assistant</div>
                  <div className="text-[10px] font-mono text-emerald-400">● {streaming ? "TYPING" : "ONLINE"}</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>

            <div
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 space-y-3 touch-pan-y"
              style={{ overscrollBehavior: "contain" }}
            >
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} group`}>
                  <div className={`max-w-[88%] text-xs leading-relaxed px-3 py-2 rounded-2xl ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-white/5 text-white/90 rounded-bl-sm border border-white/10"
                  }`}>
                    <div dangerouslySetInnerHTML={{ __html: renderMd(m.content || (streaming && i === msgs.length - 1 ? "▍" : "")) }} />
                    {m.role === "assistant" && m.content && !streaming && (
                      <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => speak(m.content)} className="text-[10px] text-white/50 hover:text-primary inline-flex items-center gap-1"><Volume2 className="size-3"/> Speak</button>
                        {i === msgs.length - 1 && (
                          <button onClick={retry} className="text-[10px] text-white/50 hover:text-primary inline-flex items-center gap-1"><RotateCcw className="size-3"/> Retry</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {msgs.length <= 1 && (
                <div className="pt-2">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">Try asking</div>
                  <div className="flex flex-col gap-1.5">
                    {SUGGESTED.map((s) => (
                      <button key={s} onClick={() => send(s)} className="text-left text-[11px] px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-primary/60 hover:bg-white/10 transition-colors text-white/80">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            <div className="p-3 border-t border-white/10 bg-white/[0.03] flex gap-2">
              <button onClick={startVoice} className="size-9 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 flex items-center justify-center text-white/70 transition-colors" aria-label="Voice input">
                <Mic className="size-4" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask about your future..."
                className="flex-1 bg-white/[0.03] border border-white/10 text-white placeholder:text-white/40 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400/40"

                disabled={streaming}
              />
              <motion.button
                onClick={() => send()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={streaming || !input.trim()}
                className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
                aria-label="Send"
              >
                <Send className="size-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
