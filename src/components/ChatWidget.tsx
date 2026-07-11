import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, X, Sparkles, RotateCcw, Mic, Volume2 } from "lucide-react";
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

// Light markdown for **bold**, `code`, and line breaks
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, streaming]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    setInput("");
    const next: Msg[] = [...msgs, { role: "user", content }, { role: "assistant", content: "" }];
    setMsgs(next);
    setStreaming(true);
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    // drop last assistant
    setMsgs((cur) => cur.slice(0, -1));
    setTimeout(() => send(lastUser.content), 50);
  };

  // Voice input (Web Speech API) — optional, gracefully unavailable
  const startVoice = () => {
    const w = window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { toast.message("Voice input not supported in this browser"); return; }
    const r = new SR() as { lang: string; start: () => void; onresult: (e: { results: { 0: { transcript: string } }[] }) => void; onerror: () => void };
    r.lang = "en-US";
    r.onresult = (e: { results: { 0: { transcript: string } }[] }) => {
      const t = e.results[0][0].transcript;
      setInput(t);
    };
    r.onerror = () => toast.error("Voice input failed");
    r.start();
  };

  // Voice output
  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text.replace(/[*`_#>-]/g, ""));
    u.rate = 1.02; u.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {open ? (
        <div className="w-[380px] max-w-[calc(100vw-3rem)] glass rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-entrance">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <Sparkles className="size-4" />
              </div>
              <div>
                <div className="text-sm font-bold">Pilot Assistant</div>
                <div className="text-[10px] font-mono text-success">● {streaming ? "TYPING" : "ONLINE"}</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
              <X className="size-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 px-4 py-3 h-80 overflow-y-auto space-y-3 bg-background/40">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} group`}>
                <div className={`max-w-[88%] text-xs leading-relaxed px-3 py-2 rounded-2xl ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card text-foreground rounded-bl-sm border border-border"
                }`}>
                  <div dangerouslySetInnerHTML={{ __html: renderMd(m.content || (streaming && i === msgs.length - 1 ? "▍" : "")) }} />
                  {m.role === "assistant" && m.content && !streaming && (
                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => speak(m.content)} className="text-[10px] text-muted-foreground hover:text-primary inline-flex items-center gap-1"><Volume2 className="size-3"/> Speak</button>
                      {i === msgs.length - 1 && (
                        <button onClick={retry} className="text-[10px] text-muted-foreground hover:text-primary inline-flex items-center gap-1"><RotateCcw className="size-3"/> Retry</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {msgs.length <= 1 && (
              <div className="pt-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Try asking</div>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTED.map((s) => (
                    <button key={s} onClick={() => send(s)} className="text-left text-[11px] px-3 py-2 rounded-lg bg-white/5 border border-border hover:border-primary/60 hover:bg-white/10 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border bg-card/80 flex gap-2">
            <button onClick={startVoice} className="size-9 rounded-lg border border-border bg-white/5 hover:bg-white/10 flex items-center justify-center" aria-label="Voice input">
              <Mic className="size-4" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about your future..."
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              disabled={streaming}
            />
            <button onClick={() => send()} disabled={streaming || !input.trim()} className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100" aria-label="Send">
              <Send className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="size-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center hover:scale-105 transition-transform animate-float"
          style={{ boxShadow: "0 0 25px -2px var(--primary)" }}
          aria-label="Open chat"
        >
          <MessageSquare className="size-6" />
        </button>
      )}
    </div>
  );
}
