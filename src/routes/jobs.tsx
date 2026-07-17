import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, MapPin, Briefcase, Filter, X, Bookmark, DollarSign, Clock } from "lucide-react";
import { jobs, INDUSTRIES, ARRANGEMENTS, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, formatSalary, relativeTime, type Job } from "@/lib/jobs";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Jobs — Transparent salaries, calm search — CareerPilot AI" },
      { name: "description", content: "Browse open roles with salary ranges upfront. Filter by industry, remote/hybrid/on-site, employment type, and experience level." },
      { property: "og:title", content: "Jobs with transparent salaries — CareerPilot AI" },
      { property: "og:description", content: "Job search that respects your time. Salary ranges shown on every listing." },
    ],
  }),
  component: JobsPage,
});

type Arr = (typeof ARRANGEMENTS)[number];
type Emp = (typeof EMPLOYMENT_TYPES)[number];
type Exp = (typeof EXPERIENCE_LEVELS)[number];
type Ind = (typeof INDUSTRIES)[number];

function JobsPage() {
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState<Ind[]>([]);
  const [arr, setArr] = useState<Arr[]>([]);
  const [emp, setEmp] = useState<Emp[]>([]);
  const [exp, setExp] = useState<Exp[]>([]);
  const [minSalary, setMinSalary] = useState(0);
  const [selected, setSelected] = useState<Job | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return jobs.filter((j) => {
      if (term && !`${j.title} ${j.company} ${j.location} ${j.skills.join(" ")}`.toLowerCase().includes(term)) return false;
      if (industry.length && !industry.includes(j.industry)) return false;
      if (arr.length && !arr.includes(j.arrangement)) return false;
      if (emp.length && !emp.includes(j.employment)) return false;
      if (exp.length && !exp.includes(j.experience)) return false;
      if (j.salaryMax < minSalary) return false;
      return true;
    });
  }, [q, industry, arr, emp, exp, minSalary]);

  const clearAll = () => { setQ(""); setIndustry([]); setArr([]); setEmp([]); setExp([]); setMinSalary(0); };
  const activeCount = industry.length + arr.length + emp.length + exp.length + (minSalary > 0 ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-10">
        <div className="font-mono text-xs text-primary tracking-widest mb-3">JOB_BOARD</div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Find your next role — with the pay upfront.</h1>
        <p className="text-muted-foreground max-w-2xl">Every listing shows a salary range. Filter by how you want to work — remote, hybrid, or on-site — plus employment type and experience level.</p>
      </header>

      {/* Search bar */}
      <div className="glass rounded-2xl p-2 flex items-center gap-2 mb-6">
        <Search className="size-5 ml-3 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, company, skill, or location..."
          className="flex-1 bg-transparent px-2 py-3 outline-none text-sm md:text-base placeholder:text-muted-foreground"
          aria-label="Search jobs"
        />
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground px-3 flex items-center gap-1">
            <X className="size-3" /> Clear ({activeCount})
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Filters */}
        <aside className="space-y-5">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold"><Filter className="size-4" /> Filters</div>

            <FilterGroup label="Industry" options={[...INDUSTRIES]} selected={industry} onToggle={(v) => setIndustry(toggle(industry, v as Ind))} />
            <FilterGroup label="Work arrangement" options={[...ARRANGEMENTS]} selected={arr} onToggle={(v) => setArr(toggle(arr, v as Arr))} />
            <FilterGroup label="Employment type" options={[...EMPLOYMENT_TYPES]} selected={emp} onToggle={(v) => setEmp(toggle(emp, v as Emp))} />
            <FilterGroup label="Experience level" options={[...EXPERIENCE_LEVELS]} selected={exp} onToggle={(v) => setExp(toggle(exp, v as Exp))} />

            <div className="mt-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Min salary</div>
              <input type="range" min={0} max={250000} step={10000} value={minSalary} onChange={(e) => setMinSalary(Number(e.target.value))} className="w-full accent-primary" />
              <div className="text-xs font-mono text-muted-foreground mt-1">{minSalary === 0 ? "Any" : `$${(minSalary / 1000).toFixed(0)}k+`}</div>
            </div>
          </div>

          <Link to="/resources" className="block glass rounded-2xl p-5 hover:border-primary/50 transition-colors">
            <div className="text-[10px] font-mono uppercase tracking-widest text-primary mb-2">Free</div>
            <div className="font-semibold text-sm mb-1">Career Support Hub</div>
            <div className="text-xs text-muted-foreground">Resume templates, interview prep, salary negotiation.</div>
          </Link>
        </aside>

        {/* List + detail */}
        <div className="grid md:grid-cols-2 gap-4 items-start">
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground font-mono">{filtered.length} of {jobs.length} roles</div>
            {filtered.map((j) => (
              <button
                key={j.id}
                onClick={() => setSelected(j)}
                className={`w-full text-left glass rounded-2xl p-5 hover:border-primary/50 transition-colors ${selected?.id === j.id ? "border-primary/70 bg-primary/5" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="size-11 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">{j.logo}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{j.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{j.company}</div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {j.location}</span>
                      <span className="inline-flex items-center gap-1"><Briefcase className="size-3" /> {j.employment}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {relativeTime(j.posted)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <Badge tone="primary">{j.arrangement}</Badge>
                      <Badge tone="accent">{j.experience}</Badge>
                      <Badge tone="success"><DollarSign className="size-3" />{formatSalary(j.salaryMin, j.salaryMax)}</Badge>
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
                No roles match those filters. Try clearing a few.
              </div>
            )}
          </div>

          <div className="md:sticky md:top-20 self-start">
            {selected ? (
              <JobDetail job={selected} />
            ) : (
              <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
                Pick a role to see details, salary breakdown, and one-click apply.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts CTA */}
      <section className="mt-12 glass rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        <div>
          <div className="font-mono text-[10px] text-primary tracking-widest mb-1">JOB_ALERTS</div>
          <h2 className="text-xl font-bold">Get only the roles you actually want.</h2>
          <p className="text-sm text-muted-foreground mt-1">Pick your categories, choose daily or weekly — we'll never spam.</p>
        </div>
        <Link to="/dashboard" className="px-5 py-3 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-primary transition-colors">
          Set up alerts
        </Link>
      </section>
    </div>
  );
}

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function FilterGroup({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="mb-4">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              onClick={() => onToggle(o)}
              className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${on ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "primary" | "accent" | "success" }) {
  const cls = tone === "success" ? "bg-success/15 text-success" : tone === "accent" ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary";
  return <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded ${cls}`}>{children}</span>;
}

function JobDetail({ job }: { job: Job }) {
  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">{job.logo}</div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold leading-tight">{job.title}</h2>
          <div className="text-sm text-muted-foreground">{job.company} · {job.location}</div>
        </div>
        <button className="text-muted-foreground hover:text-foreground" aria-label="Save"><Bookmark className="size-5" /></button>
      </div>

      <div className="glass rounded-xl p-4 mb-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Salary range</div>
        <div className="text-2xl font-extrabold text-success">{formatSalary(job.salaryMin, job.salaryMax)}</div>
        <div className="text-xs text-muted-foreground mt-1">Posted upfront — no salary guessing games.</div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <Detail label="Arrangement" value={job.arrangement} />
        <Detail label="Type" value={job.employment} />
        <Detail label="Experience" value={job.experience} />
        <Detail label="Industry" value={job.industry} />
      </div>

      <p className="text-sm text-muted-foreground mb-4">{job.summary}</p>

      <div className="mb-5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Key skills</div>
        <div className="flex flex-wrap gap-1.5">
          {job.skills.map((s) => (
            <span key={s} className="px-2.5 py-1 rounded-full text-[11px] glass">{s}</span>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          to="/apply/$jobId"
          params={{ jobId: job.id }}
          className="flex-1 text-center px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-bold hover:scale-[1.01] transition-transform"
        >
          One-click apply
        </Link>
        <button className="px-4 py-3 rounded-xl glass text-sm font-semibold hover:border-primary/50 transition-colors" aria-label="Save role">
          <Bookmark className="size-4" />
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-lg p-3">
      <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-semibold mt-0.5">{value}</div>
    </div>
  );
}
