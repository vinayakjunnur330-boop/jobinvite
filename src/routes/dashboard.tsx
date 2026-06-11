import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, FileText, Route as RouteIcon, Briefcase, UploadCloud, AlertTriangle,
  CheckCircle2, Loader2, X, MessageSquare, Send, Play, Sparkles, TrendingUp, TrendingDown,
  Tag, Newspaper, Gift, ChevronRight, Filter, Search,
} from "lucide-react";
import { isAuthed } from "./login";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Flight Deck — CareerPilot AI" }] }),
  component: DashboardPage,
});

type TabId = "overview" | "resume" | "roadmaps" | "jobs";
type ChatContext = { title: string; subtitle?: string } | null;

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutGrid className="size-4" /> },
  { id: "resume", label: "Resume Analyzer", icon: <FileText className="size-4" /> },
  { id: "roadmaps", label: "Roadmaps", icon: <RouteIcon className="size-4" /> },
  { id: "jobs", label: "Job Board", icon: <Briefcase className="size-4" /> },
];

function DashboardPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabId>("overview");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContext>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [videoModal, setVideoModal] = useState<null | { title: string; creator: string; duration: string; tag: string }>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!isAuthed()) { navigate({ to: "/login" }); return; }
      setReady(true);
    }
  }, [navigate]);

  const openChat = (ctx: ChatContext) => { setChatContext(ctx); setChatOpen(true); };

  if (!ready) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#070A13]">
        <Loader2 className="size-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] bg-[#070A13] text-white overflow-x-hidden">
      {/* Ambient cosmic backdrop with parallax */}
      <motion.div
        aria-hidden
        className="fixed inset-0 cosmic-bg pointer-events-none"
        style={{ y: scrollOffset * 0.35 }}
        animate={{ y: scrollOffset * 0.35 }}
        transition={{ type: "spring", stiffness: 60, damping: 20 }}
      />
      <div aria-hidden className="fixed inset-0 grid-bg radial-fade opacity-30 pointer-events-none" />

      <DashboardShell tab={currentTab} setTab={setCurrentTab} onOpenChat={() => openChat(null)} />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {currentTab === "overview" && <OverviewTab onContext={openChat} onVideo={setVideoModal} />}
            {currentTab === "resume" && <ResumeTab onContext={openChat} />}
            {currentTab === "roadmaps" && <RoadmapsTab onContext={openChat} onVideo={setVideoModal} />}
            {currentTab === "jobs" && <JobsTab onContext={openChat} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <ChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        context={chatContext}
        onScroll={(o) => setScrollOffset(o)}
        onLaunchVideo={(v) => setVideoModal(v)}
      />

      <AnimatePresence>
        {videoModal && <VideoModal data={videoModal} onClose={() => setVideoModal(null)} />}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Shell ---------- */
function DashboardShell({ tab, setTab, onOpenChat }: { tab: TabId; setTab: (t: TabId) => void; onOpenChat: () => void }) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#070A13]/70 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="font-bold tracking-tight">CareerPilot AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-slate-800 p-1 bg-slate-950/60">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all active:scale-95 ${
                tab === t.id ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]" : "text-slate-400 hover:text-white"
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </nav>
        <button
          onClick={onOpenChat}
          className="h-9 px-4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-xs font-semibold flex items-center gap-2 active:scale-95 hover:shadow-[0_0_24px_rgba(99,102,241,0.45)] transition"
        >
          <MessageSquare className="size-4" /> AI Copilot
        </button>
      </div>
      {/* Mobile tabs */}
      <div className="md:hidden border-t border-slate-800 px-3 py-2 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap ${tab === t.id ? "bg-indigo-500 text-white" : "text-slate-400"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
    </header>
  );
}

/* ---------- Context-aware Card wrapper with ripple ---------- */
function ContextCard({ children, ctx, onContext, className = "" }: { children: React.ReactNode; ctx: ChatContext; onContext: (c: ChatContext) => void; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handle = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const dot = document.createElement("span");
    dot.className = "ripple-dot";
    dot.style.left = `${e.clientX - r.left - 20}px`;
    dot.style.top = `${e.clientY - r.top - 20}px`;
    dot.style.width = "40px"; dot.style.height = "40px";
    el.appendChild(dot);
    setTimeout(() => dot.remove(), 800);
    onContext(ctx);
  };
  return (
    <div ref={ref} onClick={handle}
      className={`relative overflow-hidden cursor-pointer hover-lift rounded-2xl border border-slate-800 bg-slate-950/40 p-5 ${className}`}>
      {children}
    </div>
  );
}

/* ---------- Overview ---------- */
function OverviewTab({ onContext, onVideo }: { onContext: (c: ChatContext) => void; onVideo: (v: { title: string; creator: string; duration: string; tag: string }) => void }) {
  const container = { animate: { transition: { staggerChildren: 0.06 } } };
  const item = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  const stats = [
    { label: "CAREER_PATHS", value: "2,400+", trend: "+12%" },
    { label: "ATS_SCORE", value: "87 / 100", trend: "+4" },
    { label: "ACTIVE_MENTORS", value: "316", trend: "+9" },
    { label: "MATCHED_ROLES", value: "42", trend: "+6" },
  ];
  const news = [
    { t: "OpenAI ships agent SDK v2 — hiring surges for AI engineers", src: "TechCrunch · 2h" },
    { t: "Stripe rebuilds checkout in Rust — opens 80 platform roles", src: "The Pragmatic Engineer · 5h" },
    { t: "Cybersecurity wages jump 18% YoY across EU & APAC", src: "Bloomberg · 1d" },
  ];
  const evolution = [
    { name: "AI Agents (LangGraph)", dir: "up" }, { name: "WebAssembly Edge", dir: "up" },
    { name: "Rust on the backend", dir: "up" }, { name: "Legacy jQuery shops", dir: "down" },
    { name: "On-prem Hadoop", dir: "down" }, { name: "Bootcamp-only React", dir: "down" },
  ];
  const offers = [
    { t: "GitHub Student Pack", d: "Free Copilot Pro + 40 dev tools", c: "github.edu" },
    { t: "Figma Education", d: "Full Pro license · free for students", c: "figma.com" },
    { t: "AWS Educate Credits", d: "$100 cloud credits + labs", c: "aws.training" },
    { t: "Notion Edu Plan", d: "Notion AI free with .edu email", c: "notion.so" },
  ];

  return (
    <motion.div variants={container} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={item}>
        <div className="font-mono text-[11px] tracking-widest text-indigo-300">FLIGHT_DECK · OVERVIEW</div>
        <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight">Good morning, Pilot.</h1>
        <p className="mt-2 text-slate-400">Here's your real-time career airspace — tap any card to brief the AI Copilot.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <motion.div key={s.label} variants={item}>
            <ContextCard ctx={{ title: s.label.replace("_", " "), subtitle: s.value }} onContext={onContext}>
              <div className="text-[10px] font-mono tracking-widest text-indigo-300">{s.label}</div>
              <div className="text-2xl font-extrabold mt-1.5">{s.value}</div>
              <div className="text-xs text-emerald-400 font-mono mt-1">{s.trend}</div>
            </ContextCard>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Offers */}
        <motion.section variants={item} className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-mono tracking-widest text-slate-400 flex items-center gap-2"><Gift className="size-4 text-indigo-300" /> STUDENT_OFFERS</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {offers.map((o) => (
              <ContextCard key={o.t} ctx={{ title: o.t, subtitle: o.d }} onContext={onContext}>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono text-slate-500">{o.c}</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">FREE</span>
                </div>
                <div className="mt-3 font-semibold">{o.t}</div>
                <div className="text-xs text-slate-400 mt-1">{o.d}</div>
                <div className="mt-3 text-xs font-mono text-indigo-300 flex items-center gap-1">Claim offer <ChevronRight className="size-3" /></div>
              </ContextCard>
            ))}
          </div>
        </motion.section>

        {/* News */}
        <motion.section variants={item} className="space-y-3">
          <h2 className="text-sm font-mono tracking-widest text-slate-400 flex items-center gap-2"><Newspaper className="size-4 text-indigo-300" /> TECH_PULSE</h2>
          <div className="space-y-2">
            {news.map((n) => (
              <ContextCard key={n.t} ctx={{ title: n.t, subtitle: n.src }} onContext={onContext} className="p-4">
                <div className="text-sm font-medium leading-snug">{n.t}</div>
                <div className="text-[11px] font-mono text-slate-500 mt-2">{n.src}</div>
              </ContextCard>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Evolution Tracker */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="text-sm font-mono tracking-widest text-slate-400 flex items-center gap-2"><TrendingUp className="size-4 text-emerald-400" /> EVOLUTION_TRACKER</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {evolution.map((e) => (
            <ContextCard key={e.name} ctx={{ title: `${e.name} · ${e.dir === "up" ? "Rising" : "Declining"}` }} onContext={onContext} className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm">{e.name}</div>
                {e.dir === "up" ? (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" /> RISING
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400">
                    <TrendingDown className="size-3" /> DECLINING
                  </span>
                )}
              </div>
              <div className="mt-3 h-1 rounded-full bg-slate-800 overflow-hidden">
                <div className={`h-full ${e.dir === "up" ? "bg-emerald-400" : "bg-rose-400"}`} style={{ width: e.dir === "up" ? "78%" : "26%" }} />
              </div>
            </ContextCard>
          ))}
        </div>
      </motion.section>

      {/* Mentor video CTA */}
      <motion.section variants={item}>
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-transparent p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] tracking-widest text-indigo-300">MENTOR_LIBRARY</div>
            <div className="mt-1 text-xl font-bold">Watch a 4-minute career brief from a senior engineer</div>
            <div className="text-sm text-slate-400 mt-1">Curated by domain — Frontend, Cybersecurity, AI Engineering & more.</div>
          </div>
          <button
            onClick={() => onVideo({ title: "How I broke into AI engineering in 2026", creator: "Ravi Mehta · ex-Stripe", duration: "4:12", tag: "AI Engineering" })}
            className="h-10 px-5 rounded-full bg-white text-slate-900 text-sm font-semibold flex items-center gap-2 active:scale-95 hover:shadow-[0_0_24px_rgba(255,255,255,0.25)] transition"
          >
            <Play className="size-4 fill-current" /> Play brief
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}

/* ---------- Resume Analyzer ---------- */
type Parsed = { name: string; skills: string[]; missing: string[]; ats: number };
function ResumeTab({ onContext }: { onContext: (c: ChatContext) => void }) {
  const [drag, setDrag] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<Parsed | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File | null) => {
    setValidationError(null); setParsedData(null);
    if (!f) return;
    setIsUploading(true);
    await new Promise((r) => setTimeout(r, 1500));
    const valid = f.size > 200 && /(pdf|doc|docx|txt)/i.test(f.name);
    setIsUploading(false);
    if (!valid) {
      setValidationError("Invalid Resume: No readable career or educational context detected. Please upload a valid document.");
      return;
    }
    setParsedData({
      name: f.name,
      skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "AWS"],
      missing: ["Kubernetes", "LangChain", "Terraform", "System Design"],
      ats: 78,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-[11px] tracking-widest text-indigo-300">RESUME_ANALYZER</div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Get an honest ATS score in 1.5 seconds.</h1>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0] ?? null); }}
        onClick={() => fileRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer p-10 text-center
          ${drag ? "border-indigo-400 bg-indigo-500/10" : "border-slate-700 bg-slate-950/40 hover:border-indigo-500/60"}`}
      >
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" hidden onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
        {isUploading ? (
          <div className="space-y-3">
            <Loader2 className="size-7 animate-spin text-indigo-400 mx-auto" />
            <div className="text-sm font-mono text-indigo-300">PARSING_RESUME...</div>
            <div className="max-w-sm mx-auto h-1.5 rounded-full overflow-hidden shimmer" />
          </div>
        ) : (
          <>
            <UploadCloud className="size-9 mx-auto text-indigo-300" />
            <div className="mt-3 font-semibold">Drop your resume or click to browse</div>
            <div className="text-xs text-slate-500 mt-1">PDF, DOCX or TXT · Max 5MB · Parsed locally with AI</div>
          </>
        )}
      </div>

      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="animate-shake rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 flex items-start gap-3"
          >
            <AlertTriangle className="size-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-rose-200">Upload failed</div>
              <div className="text-sm text-rose-300/90 mt-0.5">{validationError}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {parsedData && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 flex flex-col items-center">
              <AtsRing value={parsedData.ats} />
              <div className="mt-3 text-xs font-mono text-slate-400">ATS_SCORE</div>
              <div className="mt-1 text-sm text-emerald-400 flex items-center gap-1"><CheckCircle2 className="size-4" /> Strong match</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 lg:col-span-2">
              <div className="text-xs font-mono tracking-widest text-indigo-300">DETECTED_SKILLS</div>
              <div className="flex flex-wrap gap-2 mt-3">
                {parsedData.skills.map((s) => (
                  <button key={s} onClick={() => onContext({ title: `Skill: ${s}` })}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 hover:bg-indigo-500/25 active:scale-95 transition">
                    <Tag className="size-3 inline mr-1.5" />{s}
                  </button>
                ))}
              </div>
              <div className="mt-5 text-xs font-mono tracking-widest text-rose-300">MISSING_KEYWORDS</div>
              <div className="flex flex-wrap gap-2 mt-3">
                {parsedData.missing.map((s) => (
                  <button key={s} onClick={() => onContext({ title: `How do I add ${s} to my resume?` })}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-rose-500/10 border border-rose-500/30 text-rose-200 hover:bg-rose-500/20 active:scale-95 transition">
                    + {s}
                  </button>
                ))}
              </div>
              <button onClick={() => onContext({ title: `Rewrite ${parsedData.name} for top 1% ATS`, subtitle: "Apply recommendations" })}
                className="mt-6 h-10 px-5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold active:scale-95 hover:shadow-[0_0_24px_rgba(99,102,241,0.45)] transition">
                Apply AI recommendations →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AtsRing({ value }: { value: number }) {
  const r = 44, c = 2 * Math.PI * r, dash = c * (value / 100);
  return (
    <svg width={120} height={120} className="-rotate-90">
      <defs>
        <linearGradient id="atsg" x1="0" x2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      <circle cx={60} cy={60} r={r} stroke="#1e293b" strokeWidth={10} fill="none" />
      <circle cx={60} cy={60} r={r} stroke="url(#atsg)" strokeWidth={10} strokeLinecap="round" fill="none"
        strokeDasharray={`${dash} ${c}`}
        style={{ filter: "drop-shadow(0 0 8px rgba(129,140,248,0.6))" }} />
      <text x={60} y={66} textAnchor="middle" transform="rotate(90 60 60)" className="fill-white" fontSize="24" fontWeight="700">{value}</text>
    </svg>
  );
}

/* ---------- Roadmaps ---------- */
function RoadmapsTab({ onContext, onVideo }: { onContext: (c: ChatContext) => void; onVideo: (v: { title: string; creator: string; duration: string; tag: string }) => void }) {
  const tracks = [
    { name: "AI Engineer", weeks: 14, color: "from-indigo-500 to-violet-500", lessons: ["LLM fundamentals", "Vector DBs", "Agent orchestration", "Eval & guardrails"] },
    { name: "Frontend Architect", weeks: 12, color: "from-cyan-500 to-blue-500", lessons: ["Design systems", "Perf budgets", "RSC patterns", "Edge rendering"] },
    { name: "Cybersecurity Analyst", weeks: 16, color: "from-rose-500 to-orange-500", lessons: ["Threat modeling", "SIEM workflows", "Red team basics", "Compliance"] },
  ];
  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-[11px] tracking-widest text-indigo-300">ROADMAPS</div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Mentor-graded paths, week by week.</h1>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        {tracks.map((t) => (
          <ContextCard key={t.name} ctx={{ title: `Roadmap: ${t.name}` }} onContext={onContext}>
            <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${t.color}`} />
            <h3 className="mt-4 text-xl font-bold">{t.name}</h3>
            <div className="text-xs font-mono text-slate-400 mt-1">{t.weeks} weeks · self-paced</div>
            <ul className="mt-4 space-y-1.5">
              {t.lessons.map((l) => <li key={l} className="text-sm text-slate-300 flex items-center gap-2"><CheckCircle2 className="size-3 text-emerald-400" /> {l}</li>)}
            </ul>
            <div className="mt-5 flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); onVideo({ title: `${t.name} — Roadmap walkthrough`, creator: "CareerPilot Faculty", duration: "6:48", tag: t.name }); }}
                className="h-9 px-4 rounded-full bg-white/10 border border-slate-700 text-xs font-semibold active:scale-95 hover:bg-white/20 flex items-center gap-1.5">
                <Play className="size-3 fill-current" /> Preview
              </button>
              <button className="h-9 px-4 rounded-full bg-indigo-500 text-xs font-semibold active:scale-95 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                Enroll
              </button>
            </div>
          </ContextCard>
        ))}
      </div>
    </div>
  );
}

/* ---------- Jobs ---------- */
function JobsTab({ onContext }: { onContext: (c: ChatContext) => void }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "remote" | "senior">("all");
  const jobs = useMemo(() => [
    { co: "Linear", role: "Senior Product Engineer", loc: "Remote · EU", pay: "$180–220k", tags: ["TypeScript", "React"], score: 92, kind: "remote" },
    { co: "Anthropic", role: "Applied AI Engineer", loc: "SF / Remote", pay: "$240–310k", tags: ["Python", "LLM"], score: 88, kind: "senior" },
    { co: "Stripe", role: "Payments Platform Engineer", loc: "Dublin", pay: "$160–195k", tags: ["Ruby", "Go"], score: 81, kind: "senior" },
    { co: "Vercel", role: "Edge Runtime Engineer", loc: "Remote · Worldwide", pay: "$170–210k", tags: ["Rust", "WASM"], score: 84, kind: "remote" },
    { co: "Figma", role: "Design Systems Lead", loc: "NYC", pay: "$200–250k", tags: ["Design", "React"], score: 79, kind: "senior" },
  ], []);
  const visible = jobs.filter((j) =>
    (filter === "all" || j.kind === filter) &&
    (q === "" || (j.role + j.co + j.tags.join(" ")).toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-[11px] tracking-widest text-indigo-300">JOB_BOARD</div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Roles matched to your score.</h1>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search roles, stacks, companies..."
            className="w-full h-10 pl-10 pr-3 rounded-full bg-slate-950/60 border border-slate-800 text-sm focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex gap-1 rounded-full border border-slate-800 p-1 bg-slate-950/60">
          {(["all", "remote", "senior"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 active:scale-95 ${filter === f ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}>
              <Filter className="size-3" />{f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {visible.map((j) => (
          <ContextCard key={j.role + j.co} ctx={{ title: `${j.role} @ ${j.co}`, subtitle: j.pay }} onContext={onContext} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono text-slate-500">{j.co.toUpperCase()} · {j.loc}</div>
                <div className="font-bold mt-0.5">{j.role}</div>
                <div className="flex gap-1.5 mt-2">
                  {j.tags.map((t) => <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-slate-700">{t}</span>)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-slate-400">{j.pay}</div>
                <div className="mt-1 text-sm font-bold text-gradient-brand">{j.score}% match</div>
              </div>
            </div>
          </ContextCard>
        ))}
      </div>
    </div>
  );
}

/* ---------- Chat Panel ---------- */
type ChatMsg = { role: "user" | "ai"; content: string; tabs?: string[] };
const QUICK_SKILLS = ["Frontend Development", "Cybersecurity", "AI Engineering", "Product Design", "Data Engineering"];

function ChatPanel({ open, onClose, context, onScroll, onLaunchVideo }: {
  open: boolean; onClose: () => void; context: ChatContext;
  onScroll: (offset: number) => void;
  onLaunchVideo: (v: { title: string; creator: string; duration: string; tag: string }) => void;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "ai", content: "Hey Pilot — I'm your AI Copilot. Tap any card on the deck and I'll auto-brief on it. Or pick a skill below." , tabs: QUICK_SKILLS },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!context) return;
    const ctxLine = `📌 Context loaded: ${context.title}${context.subtitle ? ` — ${context.subtitle}` : ""}`;
    setMessages((m) => [...m, { role: "ai", content: ctxLine, tabs: QUICK_SKILLS }]);
  }, [context]);

  const send = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: t }]);
    setTimeout(() => {
      setMessages((m) => [...m, {
        role: "ai",
        content: `Here's a structured brief on **${t}**: I'd recommend starting with fundamentals, then layering 2 portfolio projects and a mentor session. Tap a skill below to launch a 4-min video brief.`,
        tabs: QUICK_SKILLS,
      }]);
    }, 600);
  };

  const launchVideoFor = (skill: string) => {
    const map: Record<string, { creator: string; duration: string }> = {
      "Frontend Development": { creator: "Una Kravets · Google Chrome", duration: "5:21" },
      "Cybersecurity": { creator: "Daniel Miessler · OWASP", duration: "7:08" },
      "AI Engineering": { creator: "Ravi Mehta · ex-Stripe", duration: "4:12" },
      "Product Design": { creator: "Soleio Cuervo · Combine", duration: "6:34" },
      "Data Engineering": { creator: "Joe Reis · author", duration: "5:55" },
    };
    onLaunchVideo({ title: `${skill} — career brief`, creator: map[skill]?.creator ?? "CareerPilot Faculty", duration: map[skill]?.duration ?? "5:00", tag: skill });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/40 z-40" />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] z-50 glass-strong flex flex-col"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <Sparkles className="size-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">AI Copilot</div>
                  <div className="text-[10px] font-mono text-emerald-400">● ONLINE</div>
                </div>
              </div>
              <button onClick={onClose} className="size-8 rounded-lg hover:bg-white/10 flex items-center justify-center"><X className="size-4" /></button>
            </div>

            <div
              ref={listRef}
              onScroll={(e) => onScroll((e.target as HTMLDivElement).scrollTop)}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[88%] text-sm leading-relaxed px-4 py-2.5 rounded-2xl ${
                    m.role === "user" ? "bg-indigo-500 text-white rounded-br-md" : "bg-slate-900/70 border border-slate-800 rounded-bl-md"
                  }`}>
                    <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
                    {m.role === "ai" && m.tabs && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {m.tabs.map((s) => (
                          <button key={s} onClick={() => launchVideoFor(s)}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 hover:bg-indigo-500/25 active:scale-95 transition flex items-center gap-1">
                            <Play className="size-3" /> {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-800 flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask the copilot..."
                className="flex-1 h-10 px-3 rounded-xl bg-slate-950/60 border border-slate-800 text-sm focus:outline-none focus:border-indigo-500" />
              <button onClick={() => send()} className="size-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center active:scale-95">
                <Send className="size-4" />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- Video Modal ---------- */
function VideoModal({ data, onClose }: { data: { title: string; creator: string; duration: string; tag: string }; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl glass-strong rounded-3xl overflow-hidden">
        <div className="relative aspect-video bg-gradient-to-br from-indigo-900 via-violet-900 to-slate-900 flex items-center justify-center">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <button className="relative size-16 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-105 transition shadow-[0_0_40px_rgba(255,255,255,0.4)]">
            <Play className="size-7 fill-current" />
          </button>
          <div className="absolute top-3 left-3 text-[10px] font-mono px-2 py-1 rounded-full bg-black/50 border border-white/10">{data.tag}</div>
          <div className="absolute bottom-3 right-3 text-[10px] font-mono px-2 py-1 rounded-full bg-black/60">{data.duration}</div>
        </div>
        <div className="p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-bold">{data.title}</div>
            <div className="text-xs text-slate-400 mt-1">{data.creator}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="h-9 px-4 rounded-full border border-slate-700 text-xs font-semibold hover:bg-white/5 active:scale-95">Close</button>
            <button className="h-9 px-4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-xs font-semibold active:scale-95 hover:shadow-[0_0_24px_rgba(99,102,241,0.5)]">
              Connect with a Mentor →
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
