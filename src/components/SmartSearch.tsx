import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, ArrowRight, Sparkles, TrendingUp, Clock, X } from "lucide-react";
import { careers, domains } from "@/lib/careers";
import { slugifyDomain } from "@/lib/domains";

const TRENDING = [
  "AI Engineer", "Cybersecurity", "Product Designer", "Data Scientist",
  "Pilot", "Doctor", "Digital Marketer", "Game Developer", "Freelance",
];

const RECENT_KEY = "cp_recent_searches";

type Suggestion =
  | { kind: "career"; label: string; sub: string; slug: string }
  | { kind: "domain"; label: string; sub: string; slug: string }
  | { kind: "skill"; label: string; sub: string; slug: string };

export function SmartSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const suggestions = useMemo<Suggestion[]>(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const out: Suggestion[] = [];
    for (const c of careers) {
      if (
        c.title.toLowerCase().includes(term) ||
        c.industry.toLowerCase().includes(term) ||
        c.summary.toLowerCase().includes(term) ||
        c.skills.some((s) => s.toLowerCase().includes(term))
      ) {
        out.push({
          kind: "career",
          label: c.title,
          sub: `${c.industry} · ${c.salary}`,
          slug: slugifyDomain(c.category),
        });
      }
      if (out.length >= 6) break;
    }
    for (const d of domains) {
      if (d.toLowerCase().includes(term)) {
        out.push({ kind: "domain", label: d, sub: "Domain · full roadmap", slug: slugifyDomain(d) });
        if (out.length >= 9) break;
      }
    }
    const skillBag = Array.from(new Set(careers.flatMap((c) => c.skills)));
    for (const s of skillBag) {
      if (s.toLowerCase().includes(term)) {
        const match = careers.find((c) => c.skills.includes(s))!;
        out.push({ kind: "skill", label: s, sub: `Skill · explore ${match.title}`, slug: slugifyDomain(match.category) });
        if (out.length >= 12) break;
      }
    }
    return out;
  }, [q]);

  const commit = (term: string, slug?: string) => {
    const next = [term, ...recent.filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
    setOpen(false);
    setQ("");
    if (slug) {
      navigate({ to: "/domain/$slug", params: { slug } });
    } else {
      navigate({ to: "/assessment" });
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const s = suggestions[active];
      if (s) commit(s.label, s.slug);
      else if (q.trim()) commit(q.trim());
    } else if (e.key === "Escape") setOpen(false);
  };

  const clearRecent = () => { setRecent([]); try { localStorage.removeItem(RECENT_KEY); } catch {} };

  return (
    <div ref={ref} className="relative">
      <div className="glass-strong rounded-2xl p-2 flex items-center gap-2 hover-lift focus-within:border-primary/60 transition-colors">
        <Search className="size-5 ml-3 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Search any career — try 'pilot', 'AI', 'design', 'doctor'..."
          className="flex-1 bg-transparent px-2 py-3 text-sm md:text-base outline-none placeholder:text-muted-foreground"
          aria-label="Search careers"
        />
        <button
          onClick={() => { const s = suggestions[0]; s ? commit(s.label, s.slug) : commit(q.trim() || "explore"); }}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-bold flex items-center gap-2 whitespace-nowrap hover:scale-[1.02] transition-transform"
        >
          Pilot it <ArrowRight className="size-4" />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full glass-strong rounded-2xl p-3 shadow-[0_30px_80px_-20px_color-mix(in_oklab,var(--primary)_30%,transparent)] animate-in fade-in slide-in-from-top-2 duration-200 max-h-[70vh] overflow-y-auto">
          {suggestions.length > 0 && (
            <div className="mb-3">
              <div className="px-2 mb-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="size-3 text-primary" /> AI suggestions
              </div>
              <ul>
                {suggestions.map((s, i) => (
                  <li key={`${s.kind}-${s.label}`}>
                    <button
                      onMouseEnter={() => setActive(i)}
                      onClick={() => commit(s.label, s.slug)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 transition-colors ${i === active ? "bg-primary/15 text-foreground" : "hover:bg-white/5"}`}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{s.label}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{s.sub}</div>
                      </div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">{s.kind}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!q && recent.length > 0 && (
            <div className="mb-3">
              <div className="px-2 mb-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Clock className="size-3" /> Recent</span>
                <button onClick={clearRecent} className="hover:text-foreground flex items-center gap-1"><X className="size-3" /> clear</button>
              </div>
              <div className="flex flex-wrap gap-1.5 px-2">
                {recent.map((r) => (
                  <button key={r} onClick={() => { setQ(r); setOpen(true); }} className="px-3 py-1.5 rounded-full glass text-xs hover:border-primary/50 transition-colors">
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!q && (
            <div>
              <div className="px-2 mb-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="size-3 text-accent" /> Trending now
              </div>
              <div className="flex flex-wrap gap-1.5 px-2">
                {TRENDING.map((t) => (
                  <button key={t} onClick={() => { setQ(t); setOpen(true); }} className="px-3 py-1.5 rounded-full glass text-xs hover:border-accent/50 hover:text-accent transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {q && suggestions.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No direct match. Press <kbd className="px-1.5 py-0.5 rounded glass text-[10px]">Enter</kbd> to ask the AI counselor about "{q}".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
