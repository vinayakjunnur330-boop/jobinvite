import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, TrendingDown } from "lucide-react";
import { trends, careers } from "@/lib/careers";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Job Trends — CareerPilot AI" },
      { name: "description", content: "Live job market signals: industry growth, hot roles, and future demand." },
      { property: "og:title", content: "Job Market Trends" },
      { property: "og:description", content: "Real-time signals across 14 industries." },
    ],
  }),
  component: JobsPage,
});

const decline = [
  { industry: "Print Media", change: "-12%" },
  { industry: "Brick & Mortar Retail", change: "-8%" },
];

function JobsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="font-mono text-xs text-primary tracking-widest mb-3">MARKET_PULSE</div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Live job market trends</h1>
      <p className="text-muted-foreground max-w-2xl mb-12">Aggregated from 10M+ job postings, hiring signals, and compensation surveys across 14 regions.</p>

      <div className="grid lg:grid-cols-3 gap-4 mb-10">
        <Card title="ACTIVE_REQS" value="1.2M" hint="across all industries" />
        <Card title="HOTTEST_ROLE" value="AI Engineer" hint="+38% YoY" />
        <Card title="UPDATED" value="2m ago" hint="streaming live" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-10">
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-4 text-success" />
            <h3 className="font-bold">Rising industries</h3>
          </div>
          <div className="space-y-3">
            {trends.map((t) => (
              <div key={t.industry} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-border">
                <span className="text-sm">{t.industry}</span>
                <span className="font-mono font-bold text-success">{t.change}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="size-4 text-destructive" />
            <h3 className="font-bold">Declining sectors</h3>
          </div>
          <div className="space-y-3">
            {decline.map((t) => (
              <div key={t.industry} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-border">
                <span className="text-sm">{t.industry}</span>
                <span className="font-mono font-bold text-destructive">{t.change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl">
        <h3 className="font-bold mb-4">Highest-paying matched roles</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border">
              <tr><th className="text-left py-2">Role</th><th className="text-left py-2">Industry</th><th className="text-left py-2">Salary</th><th className="text-left py-2">Growth</th><th className="text-left py-2">Demand</th></tr>
            </thead>
            <tbody>
              {careers.slice(0, 8).map((c) => (
                <tr key={c.slug} className="border-b border-border/60">
                  <td className="py-3 font-semibold">{c.title}</td>
                  <td className="py-3 text-muted-foreground">{c.industry}</td>
                  <td className="py-3 font-mono">{c.salary}</td>
                  <td className="py-3 text-success font-mono">{c.growth}</td>
                  <td className="py-3"><span className={`text-[10px] font-mono px-2 py-1 rounded ${c.demand === "Extreme" ? "bg-accent/15 text-accent" : c.demand === "High" ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground"}`}>{c.demand}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="glass p-6 rounded-2xl">
      <div className="text-[10px] font-mono text-primary tracking-widest mb-2">{title}</div>
      <div className="text-3xl font-extrabold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{hint}</div>
    </div>
  );
}
