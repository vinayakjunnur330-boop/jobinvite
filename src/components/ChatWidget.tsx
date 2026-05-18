import { useState } from "react";
import { MessageSquare, Send, X, Sparkles } from "lucide-react";

type Msg = { role: "user" | "assistant"; text: string };

const seed: Msg[] = [
  { role: "assistant", text: "Hi, I'm Pilot — your AI career advisor. Ask me about roles, skills, salaries, or roadmaps." },
];

const replies = [
  "Based on current market signals, AI Engineering roles grew 38% YoY. Want a 90-day roadmap?",
  "I'd recommend focusing on Python, PyTorch, and system design. Avg salary: $145k–$210k.",
  "Strong match: Data Scientist (92%). Top gaps: SQL optimization, ML deployment.",
  "Cybersecurity demand is surging in EMEA. Entry-level roles start around $84k.",
  "Try the assessment — it personalizes the roadmap based on your background.",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");

  const send = () => {
    const t = input.trim();
    if (!t) return;
    const reply = replies[Math.floor(Math.random() * replies.length)];
    setMsgs((m) => [...m, { role: "user", text: t }, { role: "assistant", text: reply }]);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {open ? (
        <div className="w-[340px] max-w-[calc(100vw-3rem)] glass rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-entrance">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <Sparkles className="size-4" />
              </div>
              <div>
                <div className="text-sm font-bold">Pilot Assistant</div>
                <div className="text-[10px] font-mono text-success">● ONLINE</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
          <div className="flex-1 px-4 py-3 h-72 overflow-y-auto space-y-3 bg-background/40">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] text-xs leading-relaxed px-3 py-2 rounded-2xl ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card text-foreground rounded-bl-sm border border-border"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-border bg-card/80 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about your future..."
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button onClick={send} className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform" aria-label="Send">
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
