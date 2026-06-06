import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Sparkles, Cpu, Shield, Brain, Code2, Activity, CheckCircle2,
  Circle, FileText, Wand2, Newspaper, Terminal, Radar, Workflow, ArrowRight,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RRadar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/nexus")({
  component: NexusPage,
  head: () => ({
    meta: [
      { title: "Nexus Engineer AI — Hybrid Career System" },
      { name: "description", content: "Bridge mechanical engineering into Python, C, AI and Cybersecurity with an AI-powered diagnostics, skill matrix and ritual engine." },
    ],
  }),
});

/* =========================================================
   GLOBAL CURSOR RIPPLE WRAPPER
   ========================================================= */
function CursorField({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: globalThis.MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={ref} className="relative isolate">
      {children}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] mix-blend-screen"
        style={{
          background:
            "radial-gradient(260px circle at var(--mx,50%) var(--my,50%), rgba(34,211,238,0.10), transparent 60%)",
        }}
      />
    </div>
  );
}

/* Reusable ripple-on-hover card */
function Ripple({ children, className = "", as: As = "div" }: { children: ReactNode; className?: string; as?: "div" | "button" }) {
  const [pos, setPos] = useState({ x: -200, y: -200, on: false });
  const handle = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top, on: true });
  };
  return (
    <As
      onMouseMove={handle}
      onMouseEnter={handle}
      onMouseLeave={() => setPos((p) => ({ ...p, on: false }))}
      className={`relative overflow-hidden group ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(220px circle at ${pos.x}px ${pos.y}px, rgba(34,211,238,0.18), rgba(168,85,247,0.10) 35%, transparent 60%)`,
        }}
      />
      <span className="relative">{children}</span>
    </As>
  );
}

/* =========================================================
   PAGE
   ========================================================= */
type ModuleKey = "diagnostics" | "matrix" | "ritual" | "translator";

function NexusPage() {
  const [tab, setTab] = useState<ModuleKey>("diagnostics");
  const [coverage, setCoverage] = useState(34);
  const [streak, setStreak] = useState(3);

  const nav: { key: ModuleKey; label: string; icon: typeof Cpu }[] = [
    { key: "diagnostics", label: "Diagnostics", icon: Brain },
    { key: "matrix", label: "Skill Matrix", icon: Radar },
    { key: "ritual", label: "Ritual Feed", icon: Activity },
    { key: "translator", label: "AI Translator", icon: Wand2 },
  ];

  return (
    <CursorField>
      <div className="relative min-h-screen text-slate-100 bg-[#0F172A] overflow-hidden">
        {/* Portal background */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.18]"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/70 via-[#0F172A]/85 to-[#0F172A]" />
          <div className="absolute inset-0 [background-image:linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 size-[640px] rounded-full bg-cyan-500/10 blur-[140px]" />
          <div className="absolute bottom-0 right-0 size-[420px] rounded-full bg-violet-600/10 blur-[140px]" />
        </div>

        {/* Header */}
        <header className="max-w-7xl mx-auto px-6 pt-12 pb-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-400/5 text-[11px] font-mono text-cyan-300 tracking-widest">
                <Sparkles className="size-3" /> NEXUS ENGINEER AI · v1
              </div>
              <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">
                The Hybrid <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-violet-400 bg-clip-text text-transparent">Career System</span>
              </h1>
              <p className="mt-2 text-slate-400 max-w-2xl text-sm md:text-base">
                Bridge mechanical foundations into Python, C, Advanced AI and Industrial Cybersecurity through diagnostics, an interactive skill matrix and a daily ritual engine.
              </p>
            </div>
            <div className="flex gap-2">
              <Stat label="Coverage" value={`${coverage}%`} accent="text-cyan-300" />
              <Stat label="Streak" value={`${streak}d`} accent="text-emerald-300" />
              <Stat label="Track" value="Hybrid" accent="text-violet-300" />
            </div>
          </motion.div>
        </header>

        {/* Nav */}
        <nav className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 p-1.5 rounded-2xl backdrop-blur-md bg-slate-900/60 border border-slate-800 w-fit">
            {nav.map((n) => {
              const active = tab === n.key;
              return (
                <Ripple as="button" key={n.key} className="rounded-xl">
                  <button
                    onClick={() => setTab(n.key)}
                    className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      active ? "text-slate-50" : "text-slate-400 hover:text-slate-100"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nx-tab"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 via-emerald-500/15 to-violet-500/20 border border-cyan-400/30"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <n.icon className="size-4 relative" />
                    <span className="relative">{n.label}</span>
                  </button>
                </Ripple>
              );
            })}
          </div>
        </nav>

        {/* Body */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {tab === "diagnostics" && <Diagnostics onProgress={(p) => setCoverage((c) => Math.min(100, Math.max(c, p)))} />}
              {tab === "matrix" && <SkillMatrix coverage={coverage} />}
              {tab === "ritual" && <Ritual onComplete={() => setStreak((s) => s + 1)} />}
              {tab === "translator" && <Translator />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </CursorField>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <Ripple className="rounded-xl">
      <div className="px-4 py-2.5 rounded-xl backdrop-blur-md bg-slate-900/60 border border-slate-800">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{label}</div>
        <div className={`text-lg font-bold ${accent}`}>{value}</div>
      </div>
    </Ripple>
  );
}

/* =========================================================
   MODULE 1 — DIAGNOSTICS (fixed-height, no scroll chaining)
   ========================================================= */
type Msg = { role: "user" | "ai"; text: string };
const QUESTIONS = [
  "What's your current engineering background — and what hardware concepts feel most natural to you (thermo, dynamics, controls)?",
  "Have you written any code before? Python, C, MATLAB scripts — anything counts.",
  "Which hybrid track pulls you most: Embedded Systems, Robotics, Smart Manufacturing AI, or Industrial Cybersecurity?",
  "On a scale 1–10, how comfortable are you with Linux + the command line today?",
  "Last question — how many focused hours per week can you commit to upskilling?",
];

function Diagnostics({ onProgress }: { onProgress: (p: number) => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Welcome to Nexus Diagnostics. I'll ask 5 strategic questions to map your bridge from hardware to high-growth tech. Ready?" },
    { role: "ai", text: QUESTIONS[0] },
  ]);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const next = step + 1;
    const updates: Msg[] = [...msgs, { role: "user", text }];
    if (next < QUESTIONS.length) {
      updates.push({ role: "ai", text: QUESTIONS[next] });
    } else {
      updates.push({
        role: "ai",
        text:
          "Diagnostic complete. Your hybrid profile favors **Industrial AI + Embedded Systems**. Skill coverage updated to 62%. Open the Skill Matrix to see your bridge.",
      });
      onProgress(62);
    }
    setMsgs(updates);
    setStep(next);
    setInput("");
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <Ripple className="rounded-2xl">
        <div className="rounded-2xl backdrop-blur-md bg-slate-900/60 border border-slate-800 flex flex-col h-[min(70vh,640px)]">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px] shadow-emerald-400/60" />
            <span className="text-sm font-semibold">Nexus Interviewer</span>
            <span className="ml-auto text-[10px] font-mono text-slate-500">{Math.min(step, QUESTIONS.length)}/{QUESTIONS.length}</span>
          </div>
          <div
            ref={scroller}
            className="flex-1 overflow-y-auto overscroll-contain scroll-smooth px-5 py-4 space-y-3"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] text-sm leading-relaxed px-4 py-2.5 rounded-2xl ${
                    m.role === "user"
                      ? "bg-cyan-500/15 border border-cyan-400/30 text-cyan-50 rounded-br-sm"
                      : "bg-slate-800/60 border border-slate-700/60 rounded-bl-sm"
                  }`}
                  dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.+?)\*\*/g, "<strong class='text-emerald-300'>$1</strong>") }}
                />
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-800 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={step >= QUESTIONS.length ? "Diagnostic complete" : "Type your answer…"}
              disabled={step >= QUESTIONS.length}
              className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-50"
            />
            <Ripple as="button" className="rounded-xl">
              <button onClick={send} disabled={!input.trim()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:hover:scale-100">
                <Send className="size-4" /> Send
              </button>
            </Ripple>
          </div>
        </div>
      </Ripple>

      <div className="space-y-4">
        {[
          { i: Cpu, t: "Embedded", d: "C, RTOS, MCU bring-up" },
          { i: Brain, t: "Industrial AI", d: "Python, vision, predictive ops" },
          { i: Shield, t: "OT Security", d: "SCADA, ICS hardening" },
        ].map((c) => (
          <Ripple key={c.t} className="rounded-2xl">
            <div className="p-4 rounded-2xl backdrop-blur-md bg-slate-900/60 border border-slate-800 hover:border-cyan-400/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                  <c.i className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{c.t}</div>
                  <div className="text-xs text-slate-400">{c.d}</div>
                </div>
              </div>
            </div>
          </Ripple>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   MODULE 2 — SKILL MATRIX
   ========================================================= */
function SkillMatrix({ coverage }: { coverage: number }) {
  const radarData = [
    { axis: "Mechanics", current: 88, target: 60 },
    { axis: "Python", current: 35, target: 90 },
    { axis: "C / Embedded", current: 42, target: 85 },
    { axis: "AI / ML", current: 20, target: 80 },
    { axis: "Cybersecurity", current: 18, target: 70 },
    { axis: "Linux/CLI", current: 30, target: 75 },
  ];
  const bars = [
    { name: "Wk1", focus: 4, code: 2 },
    { name: "Wk2", focus: 6, code: 3 },
    { name: "Wk3", focus: 7, code: 5 },
    { name: "Wk4", focus: 8, code: 7 },
    { name: "Wk5", focus: 9, code: 8 },
  ];
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Ripple className="rounded-2xl lg:col-span-2">
        <div className="p-5 rounded-2xl backdrop-blur-md bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] font-mono tracking-widest text-slate-500">SKILL GAP RADAR</div>
              <div className="text-lg font-semibold">Hybrid Engineer Bridge</div>
            </div>
            <div className="text-sm text-slate-400">Coverage <span className="text-cyan-300 font-bold">{coverage}%</span></div>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#475569", fontSize: 10 }} />
                <RRadar name="Target" dataKey="target" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} />
                <RRadar name="Current" dataKey="current" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.35} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, color: "#e2e8f0" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Ripple>

      <div className="space-y-4">
        {[
          { i: Workflow, t: "Bridge Path", d: "Thermo → Sensors → Edge ML" },
          { i: Code2, t: "Next Module", d: "Python for Mech. Engineers" },
          { i: Shield, t: "Risk Track", d: "Industrial Cybersecurity 101" },
        ].map((c) => (
          <Ripple key={c.t} className="rounded-2xl">
            <div className="p-4 rounded-2xl backdrop-blur-md bg-slate-900/60 border border-slate-800 flex items-center gap-3 hover:border-emerald-400/40 transition-colors">
              <div className="size-10 rounded-lg bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <c.i className="size-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{c.t}</div>
                <div className="text-xs text-slate-400">{c.d}</div>
              </div>
              <ArrowRight className="size-4 text-slate-500" />
            </div>
          </Ripple>
        ))}
      </div>

      <Ripple className="rounded-2xl lg:col-span-3">
        <div className="p-5 rounded-2xl backdrop-blur-md bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] font-mono tracking-widest text-slate-500 mb-1">VELOCITY</div>
          <div className="text-lg font-semibold mb-3">Weekly Focus vs Code Output</div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars}>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" />
                <YAxis stroke="#475569" />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, color: "#e2e8f0" }} />
                <Bar dataKey="focus" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                <Bar dataKey="code" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Ripple>
    </div>
  );
}

/* =========================================================
   MODULE 3 — RITUAL FEED
   ========================================================= */
function Ritual({ onComplete }: { onComplete: () => void }) {
  const [tasks, setTasks] = useState([
    { id: 1, label: "Solve daily Python logic prompt", done: false },
    { id: 2, label: "Read industrial AI news brief", done: false },
    { id: 3, label: "30-min C pointer drill", done: false },
    { id: 4, label: "Log progress in matrix", done: false },
  ]);
  const [code, setCode] = useState(`# Daily Logic — Sensor Anomaly\ndef anomaly(readings, threshold=2.5):\n    avg = sum(readings)/len(readings)\n    return [r for r in readings if abs(r-avg) > threshold]\n\nprint(anomaly([10.1, 10.3, 14.8, 9.9, 10.0]))`);
  const [output, setOutput] = useState<string | null>(null);

  const toggle = (id: number) => {
    setTasks((ts) => ts.map((t) => {
      if (t.id !== id) return t;
      if (!t.done) onComplete();
      return { ...t, done: !t.done };
    }));
  };

  const run = () => {
    setOutput(null);
    setTimeout(() => setOutput("> [14.8]  // anomaly detected at index 2 (Δ=4.7σ)"), 600);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Ripple className="rounded-2xl lg:col-span-2">
        <div className="p-5 rounded-2xl backdrop-blur-md bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="size-4 text-cyan-300" />
            <div className="text-sm font-semibold">Daily Logic Sandbox</div>
            <span className="ml-auto text-[10px] font-mono text-slate-500">PYTHON · 06.06.2026</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="w-full h-56 bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-[13px] font-mono text-emerald-200 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 resize-none"
          />
          <div className="flex items-center gap-2 mt-3">
            <Ripple as="button" className="rounded-xl">
              <button onClick={run} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 text-sm font-bold hover:scale-[1.02] transition-transform">
                <Terminal className="size-4" /> Run
              </button>
            </Ripple>
            {output && (
              <code className="text-xs font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 rounded-lg px-3 py-1.5">{output}</code>
            )}
          </div>
        </div>
      </Ripple>

      <Ripple className="rounded-2xl">
        <div className="p-5 rounded-2xl backdrop-blur-md bg-slate-900/60 border border-slate-800 h-full">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="size-4 text-emerald-300" />
            <div className="text-sm font-semibold">Today's Ritual</div>
          </div>
          <div className="space-y-2">
            {tasks.map((t) => (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  t.done
                    ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-100"
                    : "bg-slate-950/60 border-slate-800 hover:border-cyan-400/40 text-slate-200"
                }`}
              >
                {t.done ? <CheckCircle2 className="size-4 text-emerald-300" /> : <Circle className="size-4 text-slate-500" />}
                <span className={`text-sm ${t.done ? "line-through opacity-70" : ""}`}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Ripple>

      <Ripple className="rounded-2xl lg:col-span-3">
        <div className="p-5 rounded-2xl backdrop-blur-md bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="size-4 text-violet-300" />
            <div className="text-sm font-semibold">Industrial Tech Brief</div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { tag: "AI · MFG", title: "Siemens deploys edge-AI vision on EV battery lines", body: "Sub-5ms defect inference using quantized YOLO on industrial PLCs." },
              { tag: "EMBEDDED", title: "Zephyr RTOS 4.0 ships with secure boot defaults", body: "Tightens supply chain trust for OEM firmware pipelines." },
              { tag: "OT-SEC", title: "Critical ICS protocol patch lands across vendors", body: "Modbus-TCP variant prevents auth-bypass in legacy controllers." },
            ].map((n) => (
              <Ripple key={n.title} className="rounded-xl">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-violet-400/40 transition-colors">
                  <div className="text-[10px] font-mono tracking-widest text-violet-300 mb-1">{n.tag}</div>
                  <div className="text-sm font-semibold mb-1">{n.title}</div>
                  <div className="text-xs text-slate-400">{n.body}</div>
                </div>
              </Ripple>
            ))}
          </div>
        </div>
      </Ripple>
    </div>
  );
}

/* =========================================================
   MODULE 4 — AI TRANSLATOR
   ========================================================= */
function Translator() {
  const [project, setProject] = useState(
    "Designed a thermal management system for an EV battery pack. Modeled airflow with CFD, optimized fin geometry, reduced peak cell temp by 14%."
  );
  const [card, setCard] = useState<null | { title: string; bullets: string[]; stack: string[] }>(null);
  const [loading, setLoading] = useState(false);

  const translate = () => {
    setLoading(true);
    setTimeout(() => {
      setCard({
        title: "Edge-Cooled Battery Thermal Optimizer",
        bullets: [
          "Built a parametric CFD simulation pipeline (Python + OpenFOAM bindings) generating 240+ design variants.",
          "Designed automated post-processor extracting peak/avg temp arrays, reducing analysis cycle from 6h → 22min.",
          "Implemented optimization loop (SciPy + Bayesian) converging on fin geometry with 14% peak-temp reduction.",
          "Packaged results into a reproducible dashboard with versioned datasets and JSON-Schema validation.",
        ],
        stack: ["Python", "NumPy/SciPy", "OpenFOAM", "Bayesian Opt.", "Pandas", "Plotly"],
      });
      setLoading(false);
    }, 900);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Ripple className="rounded-2xl">
        <div className="p-5 rounded-2xl backdrop-blur-md bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="size-4 text-cyan-300" />
            <div className="text-sm font-semibold">Engineering Project</div>
          </div>
          <textarea
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="w-full h-56 bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 resize-none"
            placeholder="Describe your engineering project…"
          />
          <Ripple as="button" className="rounded-xl mt-3 inline-block">
            <button
              onClick={translate}
              disabled={loading || !project.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-bold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              <Wand2 className="size-4" /> {loading ? "Translating…" : "Translate to Tech Card"}
            </button>
          </Ripple>
        </div>
      </Ripple>

      <Ripple className="rounded-2xl">
        <div className="p-5 rounded-2xl backdrop-blur-md bg-slate-900/60 border border-slate-800 h-full">
          <div className="text-[10px] font-mono tracking-widest text-violet-300 mb-2">TECH-OPTIMIZED CARD</div>
          <AnimatePresence mode="wait">
            {!card ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex items-center justify-center text-sm text-slate-500 min-h-[280px]">
                Run the translator to generate your AI-optimized project card.
              </motion.div>
            ) : (
              <motion.div key="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">{card.title}</h3>
                <ul className="space-y-2">
                  {card.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-200">
                      <ArrowRight className="size-4 text-cyan-300 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {card.stack.map((s) => (
                    <span key={s} className="text-[11px] font-mono px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-400/30 text-cyan-200">
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Ripple>
    </div>
  );
}
