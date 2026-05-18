import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brain, Compass, FileText, LineChart, Sparkles, Target, Zap } from "lucide-react";
import { careers, trends } from "@/lib/careers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerPilot AI — Navigate your career airspace" },
      { name: "description", content: "AI career counselor: resume analysis, skill gap, salary prediction, personalized roadmaps." },
      { property: "og:title", content: "CareerPilot AI" },
      { property: "og:description", content: "AI career counselor for students and professionals." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-entrance">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              V3.0 COCKPIT NOW LIVE
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 text-balance">
              Navigate your <span className="text-gradient-brand">career airspace.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-[54ch] mb-10 leading-relaxed">
              CareerPilot AI analyzes your trajectory, scans for skill gaps, and instruments your path to a $250k+ salary with precision telemetry.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/assessment" className="px-7 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-[var(--shadow-glow-primary)] transition-all flex items-center justify-center gap-2">
                Start Flight Assessment <ArrowRight className="size-4" />
              </Link>
              <Link to="/resume" className="px-7 py-3.5 bg-white/5 border border-border text-foreground font-bold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <FileText className="size-4" /> Upload Resume
              </Link>
            </div>
          </div>

          <div className="relative animate-entrance" style={{ animationDelay: "200ms" }}>
            <div className="relative glass rounded-2xl p-4 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                <div className="size-3 rounded-full bg-destructive/50" />
                <div className="size-3 rounded-full bg-yellow-500/50" />
                <div className="size-3 rounded-full bg-success/60" />
                <div className="ml-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Telemetry / Career_Path_01</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-border">
                    <div className="text-[10px] font-mono text-primary mb-1">SALARY_PREDICTION</div>
                    <div className="text-2xl font-bold tracking-tight">
                      $142,500<span className="text-sm text-success font-mono ml-2">+12%</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-border">
                    <div className="text-[10px] font-mono text-accent mb-1">SKILL_COHERENCE</div>
                    <div className="h-2 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-accent w-[78%]" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 font-mono">78% aligned</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-border">
                    <div className="text-[10px] font-mono text-primary mb-1">TOP_MATCH</div>
                    <div className="text-sm font-bold">AI Engineer · 96%</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent rounded-xl border border-border p-4 flex flex-col justify-between">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Live_Map.exe</div>
                  <div className="flex-1 flex items-center justify-center py-6">
                    <div className="relative">
                      <div className="size-20 rounded-full border border-primary/40 animate-ping absolute" />
                      <div className="size-20 rounded-full border-2 border-primary/70 flex items-center justify-center relative">
                        <Compass className="size-8 text-primary" />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono text-center">PATH OPTIMAL</div>
                </div>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 size-40 bg-primary/20 blur-[100px] -z-0" />
            <div className="absolute -bottom-10 -left-10 size-40 bg-accent/20 blur-[100px] -z-0" />
          </div>
        </div>
      </section>

      {/* FEATURES BENTO */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Intelligent Pathfinding</h2>
            <p className="text-muted-foreground">Real-time data for modern industry transitions.</p>
          </div>
          <div className="flex gap-2 font-mono text-xs">
            <span className="px-2 py-1 bg-white/5 border border-border rounded">STATUS: OPTIMAL</span>
            <span className="px-2 py-1 bg-white/5 border border-border rounded">SCAN: ACTIVE</span>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <FeatureCard className="md:col-span-2" icon={<Brain className="size-5" />} title="AI Career Recommendation" desc="Match against 15+ careers across tech, business, healthcare, and creative industries. Top 5 picks ranked by fit, salary, and demand." tags={["NEURAL", "RANK_v3"]} />
          <FeatureCard icon={<Target className="size-5" />} title="Skill Gap Analysis" desc="Pinpoint exactly which skills you're missing for your dream role." accentValue="94%" valueLabel="Precision" />
          <FeatureCard icon={<LineChart className="size-5" />} title="Market Pulse" desc="Cybersecurity demand up 40% in EMEA this quarter." />
          <FeatureCard icon={<Sparkles className="size-5" />} title="AI Chatbot" desc="Talk to Pilot — your always-on career advisor." />
          <FeatureCard className="md:col-span-2" icon={<Zap className="size-5" />} title="Personalized Roadmap" desc="A 12-month flight plan with courses, milestones, and certifications mapped to your target role." tags={["12 MONTH", "ADAPTIVE"]} />
        </div>
      </section>

      {/* TOP CAREERS */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="font-mono text-xs text-primary tracking-widest mb-2">RANKED_BY_FIT</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Top career matches</h2>
          </div>
          <Link to="/dashboard" className="text-sm font-medium text-primary hover:underline hidden sm:flex items-center gap-1">
            See full dashboard <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {careers.slice(0, 6).map((c) => (
            <div key={c.slug} className="glass p-6 rounded-2xl hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{c.industry}</div>
                  <h3 className="text-lg font-bold mt-1">{c.title}</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{c.match}%</div>
                  <div className="text-[10px] font-mono text-muted-foreground">MATCH</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{c.summary}</p>
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="p-2 bg-white/5 rounded border border-border">
                  <div className="text-[9px] text-muted-foreground font-mono">SALARY</div>
                  <div className="font-semibold">{c.salary}</div>
                </div>
                <div className="p-2 bg-white/5 rounded border border-border">
                  <div className="text-[9px] text-muted-foreground font-mono">GROWTH</div>
                  <div className="font-semibold text-success">{c.growth}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {c.skills.slice(0, 3).map((s) => (
                  <span key={s} className="text-[10px] font-mono px-2 py-0.5 bg-white/5 border border-border rounded">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MARKET PULSE */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="glass rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="font-mono text-xs text-accent tracking-widest mb-3">LIVE_SIGNAL</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Where the market is moving</h2>
              <p className="text-muted-foreground mb-6">Aggregated from 10M+ job postings, salary reports, and hiring signals across 14 regions.</p>
              <Link to="/jobs" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
                Open job trends <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {trends.map((t) => (
                <div key={t.industry} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-border">
                  <span className="text-sm font-medium">{t.industry}</span>
                  <span className={`font-mono font-bold ${t.color === "primary" ? "text-primary" : "text-accent"}`}>{t.change}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center border border-border bg-gradient-to-br from-primary/15 via-card to-accent/10">
          <div className="absolute -top-20 -right-20 size-60 bg-primary/20 blur-[120px]" />
          <div className="absolute -bottom-20 -left-20 size-60 bg-accent/20 blur-[120px]" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Ready for takeoff?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">Run a 5-minute assessment and unlock your personalized career flight plan.</p>
            <Link to="/assessment" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-[var(--shadow-glow-primary)] transition-all">
              Begin Assessment <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc, tags, accentValue, valueLabel, className = "" }: { icon: React.ReactNode; title: string; desc: string; tags?: string[]; accentValue?: string; valueLabel?: string; className?: string }) {
  return (
    <div className={`p-8 glass rounded-3xl hover:border-primary/50 transition-colors ${className}`}>
      <div className="size-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-5">{icon}</div>
      {accentValue && <div className="text-3xl font-bold text-accent mb-2">{accentValue}{valueLabel && <span className="text-xs font-mono text-muted-foreground ml-2">{valueLabel}</span>}</div>}
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{desc}</p>
      {tags && (
        <div className="flex gap-2">
          {tags.map((t) => <span key={t} className="text-[10px] font-mono py-1 px-2 bg-white/5 border border-border rounded">{t}</span>)}
        </div>
      )}
    </div>
  );
}
