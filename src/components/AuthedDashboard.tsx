import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, BarChart3, Users, Settings, LogOut, Search, ArrowUpDown, Activity, TrendingUp, Server, Zap } from "lucide-react";

type Row = { id: number; name: string; email: string; role: string; status: "Active" | "Idle" | "Offline"; usage: number };

const ROWS: Row[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@aether.io", role: "Admin", status: "Active", usage: 92 },
  { id: 2, name: "Linus Torvalds", email: "linus@aether.io", role: "Engineer", status: "Active", usage: 78 },
  { id: 3, name: "Grace Hopper", email: "grace@aether.io", role: "Architect", status: "Idle", usage: 54 },
  { id: 4, name: "Alan Turing", email: "alan@aether.io", role: "Analyst", status: "Active", usage: 88 },
  { id: 5, name: "Margaret Hamilton", email: "margaret@aether.io", role: "Lead", status: "Offline", usage: 12 },
  { id: 6, name: "Dennis Ritchie", email: "dennis@aether.io", role: "Engineer", status: "Active", usage: 67 },
  { id: 7, name: "Edsger Dijkstra", email: "edsger@aether.io", role: "Architect", status: "Idle", usage: 41 },
  { id: 8, name: "Barbara Liskov", email: "barbara@aether.io", role: "Admin", status: "Active", usage: 95 },
];

const NAV = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "management", label: "Management", icon: Users },
  { key: "settings", label: "Settings", icon: Settings },
] as const;

type Tab = typeof NAV[number]["key"];

export function AuthedDashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [accent, setAccent] = useState("#6366f1");
  const [perf, setPerf] = useState(72);
  const [cache, setCache] = useState(45);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: keyof Row; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });

  const rows = useMemo(() => {
    const q = query.toLowerCase();
    const filtered = ROWS.filter((r) => !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.role.toLowerCase().includes(q));
    return [...filtered].sort((a, b) => {
      const av = a[sort.key]; const bv = b[sort.key];
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [query, sort]);

  const toggleSort = (k: keyof Row) => setSort((s) => ({ key: k, dir: s.key === k && s.dir === "asc" ? "desc" : "asc" }));

  return (
    <div
      className="min-h-screen text-zinc-100 aether-app animate-[aether-in_.5s_ease-out]"
      style={{
        background: "radial-gradient(ellipse at 80% -10%, #1e1b4b 0%, #09090b 50%)",
        ["--aether-accent" as string]: accent,
      }}
    >
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-60 border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col">
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg" style={{ background: `linear-gradient(135deg, var(--aether-accent), #4f46e5)`, boxShadow: `0 0 24px -4px var(--aether-accent)` }} />
              <div>
                <div className="text-sm font-semibold tracking-tight">Aether</div>
                <div className="text-[10px] font-mono text-zinc-500">WORKSPACE</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = tab === n.key;
              return (
                <button
                  key={n.key}
                  onClick={() => setTab(n.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm aether-trans ${active ? "text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
                  style={active ? { background: "color-mix(in oklab, var(--aether-accent) 18%, transparent)", boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--aether-accent) 40%, transparent)" } : undefined}
                >
                  <Icon className="size-4" />
                  {n.label}
                </button>
              );
            })}
          </nav>
          <div className="p-3 border-t border-white/10">
            <div className="px-3 py-2 mb-2 text-xs">
              <div className="text-zinc-500 font-mono text-[10px]">SIGNED IN AS</div>
              <div className="truncate text-zinc-200">{email}</div>
            </div>
            <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-300 hover:bg-red-500/10 aether-trans">
              <LogOut className="size-4" /> Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight capitalize">{tab}</h1>
              <p className="text-sm text-zinc-400">Welcome back — your workspace is live.</p>
            </div>
            <div className="text-xs font-mono text-emerald-400">● ALL SYSTEMS NOMINAL</div>
          </div>

          {tab === "overview" && <Overview />}
          {tab === "analytics" && <Overview analyticsOnly />}
          {tab === "management" && (
            <ManagementTable rows={rows} query={query} setQuery={setQuery} sort={sort} toggleSort={toggleSort} />
          )}
          {tab === "settings" && (
            <SettingsPanel accent={accent} setAccent={setAccent} perf={perf} setPerf={setPerf} cache={cache} setCache={setCache} />
          )}
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, delta }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; delta: string }) {
  return (
    <div className="aether-panel p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="size-9 rounded-lg flex items-center justify-center" style={{ background: "color-mix(in oklab, var(--aether-accent) 18%, transparent)", color: "var(--aether-accent)" }}>
          <Icon className="size-4" />
        </div>
        <span className="text-[10px] font-mono text-emerald-400">{delta}</span>
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs text-zinc-400 mt-1">{label}</div>
    </div>
  );
}

function MiniGraph() {
  const pts = useMemo(() => Array.from({ length: 24 }, () => 20 + Math.random() * 60), []);
  const path = pts.map((y, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * 100} ${100 - y}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" className="w-full h-24" preserveAspectRatio="none">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--aether-accent)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--aether-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L 100 100 L 0 100 Z`} fill="url(#g)" />
      <path d={path} fill="none" stroke="var(--aether-accent)" strokeWidth="1.2" />
    </svg>
  );
}

function Overview({ analyticsOnly = false }: { analyticsOnly?: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 2200); return () => clearInterval(id); }, []);
  const reqs = 12480 + ((tick * 37) % 500);
  const uptime = (99.97 + Math.sin(tick) * 0.01).toFixed(3);

  return (
    <div className="space-y-6">
      {!analyticsOnly && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Activity} label="Requests / min" value={reqs.toLocaleString()} delta="▲ 4.2%" />
          <StatCard icon={Server} label="Uptime" value={`${uptime}%`} delta="● Stable" />
          <StatCard icon={TrendingUp} label="MRR" value="$284.5k" delta="▲ 12.1%" />
          <StatCard icon={Zap} label="Latency p95" value="42ms" delta="▼ 3ms" />
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="aether-panel p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Throughput</h3>
            <span className="text-[10px] font-mono text-zinc-500">LIVE • 24h</span>
          </div>
          <MiniGraph />
        </div>
        <div className="aether-panel p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Conversion</h3>
            <span className="text-[10px] font-mono text-zinc-500">LIVE • 24h</span>
          </div>
          <MiniGraph />
        </div>
      </div>
    </div>
  );
}

function ManagementTable({ rows, query, setQuery, sort, toggleSort }: { rows: Row[]; query: string; setQuery: (s: string) => void; sort: { key: keyof Row; dir: "asc" | "desc" }; toggleSort: (k: keyof Row) => void }) {
  return (
    <div className="aether-panel overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, role…"
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-400/70"
          />
        </div>
        <div className="text-xs font-mono text-zinc-500">{rows.length} records</div>
      </div>
      <div className="overflow-x-auto aether-scroll">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-mono uppercase tracking-wider text-zinc-500 border-b border-white/10">
              {(["name", "email", "role", "status", "usage"] as (keyof Row)[]).map((k) => (
                <th key={k} className="px-4 py-3">
                  <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-white aether-trans">
                    {k} <ArrowUpDown className="size-3 opacity-60" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.03] aether-trans">
                <td className="px-4 py-3 text-white">{r.name}</td>
                <td className="px-4 py-3 text-zinc-400">{r.email}</td>
                <td className="px-4 py-3 text-zinc-300">{r.role}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                    r.status === "Active" ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
                    : r.status === "Idle" ? "text-amber-300 bg-amber-500/10 border-amber-500/30"
                    : "text-zinc-400 bg-white/5 border-white/10"
                  }`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 w-48">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full" style={{ width: `${r.usage}%`, background: "var(--aether-accent)" }} />
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 w-8">{r.usage}%</span>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-500">No matches</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsPanel({ accent, setAccent, perf, setPerf, cache, setCache }: { accent: string; setAccent: (s: string) => void; perf: number; setPerf: (n: number) => void; cache: number; setCache: (n: number) => void }) {
  const accents = [
    { name: "Indigo", hex: "#6366f1" },
    { name: "Violet", hex: "#8b5cf6" },
    { name: "Emerald", hex: "#10b981" },
    { name: "Rose", hex: "#f43f5e" },
    { name: "Amber", hex: "#f59e0b" },
    { name: "Sky", hex: "#0ea5e9" },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="aether-panel p-6">
        <h3 className="text-sm font-semibold mb-1">Theme accent</h3>
        <p className="text-xs text-zinc-400 mb-4">Updates the entire workspace instantly via CSS variables.</p>
        <div className="flex flex-wrap gap-2">
          {accents.map((a) => (
            <button key={a.hex} onClick={() => setAccent(a.hex)} className={`size-9 rounded-lg aether-trans hover:scale-110 ${accent === a.hex ? "ring-2 ring-white/80" : "ring-1 ring-white/10"}`} style={{ background: a.hex }} title={a.name} />
          ))}
        </div>
      </div>
      <div className="aether-panel p-6 space-y-5">
        <div>
          <div className="flex justify-between text-sm mb-2"><span>Performance budget</span><span className="font-mono text-zinc-400">{perf}%</span></div>
          <input type="range" min={0} max={100} value={perf} onChange={(e) => setPerf(+e.target.value)} className="aether-slider w-full" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2"><span>Cache aggressiveness</span><span className="font-mono text-zinc-400">{cache}%</span></div>
          <input type="range" min={0} max={100} value={cache} onChange={(e) => setCache(+e.target.value)} className="aether-slider w-full" />
        </div>
      </div>
    </div>
  );
}
