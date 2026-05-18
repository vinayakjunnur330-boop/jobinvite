import { createFileRoute } from "@tanstack/react-router";
import { skillsRadar } from "@/lib/careers";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Skill Analysis — CareerPilot AI" },
      { name: "description", content: "See how your skills compare to current market demand and find your gaps." },
      { property: "og:title", content: "Skill Analysis" },
      { property: "og:description", content: "Your skill telemetry vs. market demand." },
    ],
  }),
  component: SkillsPage,
});

function SkillsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="font-mono text-xs text-primary tracking-widest mb-3">SKILL_TELEMETRY</div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Your skill stack vs. the market</h1>
      <p className="text-muted-foreground max-w-2xl mb-12">Each bar shows your current proficiency against what the market is currently paying premiums for.</p>

      <div className="grid lg:grid-cols-3 gap-4 mb-12">
        <StatBig label="STRENGTHS" value="3" hint="Above market" tone="success" />
        <StatBig label="GAPS" value="3" hint="Below market" tone="accent" />
        <StatBig label="OVERALL" value="68%" hint="Market alignment" tone="primary" />
      </div>

      <div className="glass rounded-3xl p-8">
        <div className="space-y-6">
          {skillsRadar.map((s) => (
            <div key={s.skill}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm">{s.skill}</span>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-primary">YOU {s.you}%</span>
                  <span className="text-muted-foreground">MKT {s.market}%</span>
                </div>
              </div>
              <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-muted/40" style={{ width: `${s.market}%` }} />
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent" style={{ width: `${s.you}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <div className="glass p-6 rounded-2xl">
          <div className="font-mono text-[10px] text-success tracking-widest mb-2">STRENGTHS</div>
          <h3 className="font-bold mb-3">Lean into these</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Communication — above market average</li>
            <li>• Problem solving — strong baseline</li>
            <li>• Python — close to top quartile</li>
          </ul>
        </div>
        <div className="glass p-6 rounded-2xl border-accent/40">
          <div className="font-mono text-[10px] text-accent tracking-widest mb-2">PRIORITY_GAPS</div>
          <h3 className="font-bold mb-3">Close these first</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• ML / AI — high market demand</li>
            <li>• Cloud / DevOps — required for senior roles</li>
            <li>• System design — gating for staff+ levels</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatBig({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: "primary" | "accent" | "success" }) {
  const cls = tone === "primary" ? "text-primary" : tone === "accent" ? "text-accent" : "text-success";
  return (
    <div className="glass p-6 rounded-2xl">
      <div className={`text-[10px] font-mono tracking-widest mb-2 ${cls}`}>{label}</div>
      <div className="text-3xl font-extrabold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{hint}</div>
    </div>
  );
}
