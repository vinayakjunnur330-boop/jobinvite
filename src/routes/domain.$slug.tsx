import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, TrendingUp, Sparkles, Target, Calendar, BookOpen, Users, Award, CheckCircle2, Circle, Zap } from "lucide-react";
import { getDomainData } from "@/lib/domains";

export const Route = createFileRoute("/domain/$slug")({
  head: ({ params }) => {
    const d = getDomainData(params.slug);
    const title = d ? `${d.name} careers — CareerPilot AI` : "Domain — CareerPilot AI";
    const desc = d?.overview.slice(0, 155) ?? "Explore a career domain with AI-powered roadmaps and daily tasks.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  loader: ({ params }) => {
    const d = getDomainData(params.slug);
    if (!d) throw notFound();
    return d;
  },
  component: DomainPage,
  notFoundComponent: () => (
    <div className="max-w-3xl mx-auto px-6 py-32 text-center">
      <h1 className="text-4xl font-extrabold">Domain not found</h1>
      <p className="text-muted-foreground mt-3">Browse all 44 domains on the homepage.</p>
      <Link to="/" className="inline-block mt-6 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-bold">Go home</Link>
    </div>
  ),
});

const STORAGE_KEY = (slug: string) => `cp_tasks_${slug}`;

function DomainPage() {
  const d = Route.useLoaderData();
  const [done, setDone] = useState<Record<number, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY(d.slug)) || "{}"); } catch { return {}; }
  });

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY(d.slug), JSON.stringify(next));
      return next;
    });
  };

  const completedCount = Object.values(done).filter(Boolean).length;
  const progress = Math.round((completedCount / d.dailyTasks.length) * 100);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-32 size-[480px] rounded-full bg-primary/25 blur-[120px] animate-aurora" />
          <div className="absolute top-10 -right-32 size-[520px] rounded-full bg-accent/20 blur-[140px] animate-aurora" style={{ animationDelay: "-6s" }} />
          <div className="absolute inset-0 grid-bg opacity-20" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16">
          <Link to="/" className="text-xs font-mono text-muted-foreground hover:text-primary tracking-widest">← ALL_DOMAINS</Link>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full glass-strong text-xs font-mono">
            <span className="size-1.5 rounded-full bg-success animate-pulse" />
            DOMAIN · {d.name.toUpperCase()}
          </div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-5 text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95]">
            {d.name} <span className="text-gradient-shimmer">careers</span>
          </motion.h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-3xl">{d.tagline}</p>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
            <Stat label="AVG_SALARY" value={d.avgSalary} />
            <Stat label="GROWTH" value={d.growth} />
            <Stat label="DEMAND" value={d.demand} />
            <Stat label="OPEN_ROLES" value={`${d.relatedCareers.length || "—"}+`} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/assessment" className="px-5 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-bold flex items-center gap-2">
              Match me to {d.name} roles <ArrowRight className="size-4" />
            </Link>
            <Link to="/roadmap" className="px-5 py-3 rounded-full glass-strong text-sm font-bold">Full 12-month plan</Link>
          </div>
        </div>
      </section>

      {/* OVERVIEW + WHY NOW */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-6">
        <Card icon={<BookOpen className="size-5" />} label="OVERVIEW" title="What this domain is">
          <p className="text-muted-foreground leading-relaxed text-sm">{d.overview}</p>
        </Card>
        <Card icon={<TrendingUp className="size-5" />} label="WHY_NOW" title="Why this is a great moment">
          <p className="text-muted-foreground leading-relaxed text-sm">{d.whyNow}</p>
        </Card>
      </section>

      {/* SKILLS + COMPANIES */}
      <section className="max-w-7xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-6">
        <Card icon={<Sparkles className="size-5" />} label="TOP_SKILLS" title="Skills that compound">
          <div className="flex flex-wrap gap-2">
            {d.topSkills.map((s) => <span key={s} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono">{s}</span>)}
          </div>
        </Card>
        <Card icon={<Award className="size-5" />} label="TOP_EMPLOYERS" title="Where people work">
          <div className="flex flex-wrap gap-2">
            {d.topCompanies.map((c) => <span key={c} className="px-3 py-1.5 rounded-full glass text-xs font-medium">{c}</span>)}
          </div>
        </Card>
      </section>

      {/* DAILY TASKS WITH CHECKBOX */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <SectionHead label="DAILY_TASKS" title="Today's flight plan" sub="Repeatable daily tasks. Tick them off — progress is saved locally." />
        <div className="glass-strong rounded-2xl p-6 mt-8">
          <div className="flex items-center justify-between mb-5">
            <div className="text-sm font-mono text-muted-foreground">PROGRESS · {completedCount}/{d.dailyTasks.length}</div>
            <div className="text-xs font-mono text-primary">{progress}%</div>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-6">
            <motion.div className="h-full bg-gradient-to-r from-primary to-accent" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-2">
            {d.dailyTasks.map((t, i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-colors ${done[i] ? "bg-success/5" : "bg-white/5 hover:bg-white/10"}`}
              >
                {done[i] ? <CheckCircle2 className="size-5 text-success shrink-0" /> : <Circle className="size-5 text-muted-foreground shrink-0" />}
                <div className="flex-1">
                  <div className={`text-sm font-medium ${done[i] ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                  <div className="text-[10px] font-mono text-muted-foreground tracking-widest mt-0.5">{t.type.toUpperCase()} · {t.duration}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* WEEKLY GOALS */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <SectionHead label="WEEKLY_GOALS" title="What a great week looks like" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-8">
          {d.weeklyGoals.map((g, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-4 hover-lift">
              <Target className="size-4 text-accent mb-2" />
              <div className="text-sm font-medium leading-snug">{g}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ROADMAP */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <SectionHead label="ROADMAP" title={`Your roadmap into ${d.name}`} sub="A staged 12+ month plan from zero to landing the role." />
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-5 gap-3">
          {d.roadmap.map((p, i) => (
            <motion.div key={p.phase} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass-strong rounded-2xl p-5 hover-lift relative overflow-hidden">
              <div className="absolute -top-4 -right-2 text-[80px] font-extrabold text-white/[0.04] leading-none">{String(i + 1).padStart(2, "0")}</div>
              <div className="text-[10px] font-mono text-primary tracking-widest">{p.phase}</div>
              <div className="text-lg font-bold mt-1">{p.title}</div>
              <div className="text-[10px] font-mono text-muted-foreground tracking-widest mt-1">{p.duration}</div>
              <ul className="mt-4 space-y-2">
                {p.items.map((it) => (
                  <li key={it} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                    <Zap className="size-3 text-accent shrink-0 mt-0.5" /> {it}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* LONG-TERM */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <SectionHead label="LONG_TERM" title="The 10-year arc" sub="Where this path can take you if you compound." />
        <div className="mt-8 relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-transparent" />
          <div className="space-y-4">
            {d.longTermMilestones.map((m, i) => (
              <motion.div key={m.year} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="pl-12 relative">
                <div className="absolute left-2 top-3 size-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                  <Calendar className="size-2.5 text-primary" />
                </div>
                <div className="glass rounded-xl p-4 hover-lift">
                  <div className="text-[10px] font-mono text-primary tracking-widest">{m.year.toUpperCase()}</div>
                  <div className="text-sm font-bold mt-1">{m.goal}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* RELATED CAREERS */}
      {d.relatedCareers.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <SectionHead label="ROLES" title={`Top ${d.name} roles`} />
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {d.relatedCareers.map((c) => (
              <div key={c.slug} className="glass rounded-2xl p-5 hover-lift">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[10px] font-mono text-muted-foreground tracking-widest">{c.industry.toUpperCase()}</div>
                  <div className="text-xs font-mono font-bold text-primary">{c.match}% MATCH</div>
                </div>
                <h3 className="text-lg font-bold">{c.title}</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{c.summary}</p>
                <div className="mt-4 flex justify-between items-center text-xs">
                  <span className="font-mono text-success">{c.salary}</span>
                  <span className="font-mono text-accent">{c.growth}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* RESOURCES */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <SectionHead label="RESOURCES" title="What to learn from" />
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {d.resources.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-4 hover-lift">
              <Users className="size-4 text-primary mb-2" />
              <div className="text-[10px] font-mono text-muted-foreground tracking-widest">{r.type.toUpperCase()}</div>
              <div className="text-sm font-medium mt-1">{r.title}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="glass-strong rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 size-[400px] rounded-full bg-primary/15 blur-[100px]" />
          </div>
          <div className="relative">
            <h3 className="text-3xl md:text-4xl font-extrabold">Ready to lock in {d.name}?</h3>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Take the AI assessment — we'll personalize this plan to your background, skills, and goals.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/assessment" className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-bold">Take assessment</Link>
              <Link to="/mentors" className="px-6 py-3 rounded-full glass text-sm font-bold">Book a mentor</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="text-[10px] font-mono text-muted-foreground tracking-widest">{label}</div>
      <div className="text-lg md:text-xl font-extrabold text-gradient-brand mt-1">{value}</div>
    </div>
  );
}

function Card({ icon, label, title, children }: { icon: React.ReactNode; label: string; title: string; children: React.ReactNode }) {
  return (
    <div className="glass-strong rounded-2xl p-6 hover-lift">
      <div className="flex items-center gap-2 text-primary mb-3">
        {icon}
        <span className="text-[10px] font-mono tracking-widest">{label}</span>
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function SectionHead({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div>
      <div className="font-mono text-xs text-primary tracking-widest">{label}</div>
      <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight">{title}</h2>
      {sub && <p className="text-muted-foreground mt-2 max-w-2xl">{sub}</p>}
    </div>
  );
}
