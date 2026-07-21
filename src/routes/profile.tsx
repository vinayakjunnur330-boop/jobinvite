import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Bell, Download, Settings } from "lucide-react";
import { AccountSecurityCard } from "@/components/AccountSecurityCard";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — CareerPilot AI" },
      { name: "description", content: "Your profile, saved assessments, certifications, and progress tracking." },
      { property: "og:title", content: "Your Profile" },
      { property: "og:description", content: "Track your career progress." },
    ],
  }),
  component: ProfilePage,
});

const history = [
  { date: "May 14, 2026", title: "AI Engineer assessment", score: "96%" },
  { date: "May 02, 2026", title: "Resume analysis v2", score: "B+" },
  { date: "Apr 21, 2026", title: "Data Scientist comparison", score: "92%" },
];

const certs = [
  { name: "Deep Learning Specialization", issuer: "DeepLearning.AI", date: "2026" },
  { name: "AWS Solutions Architect", issuer: "AWS", date: "2025" },
];

function ProfilePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="glass rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="size-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-extrabold text-primary-foreground">AK</div>
        <div className="flex-1">
          <div className="font-mono text-[10px] text-primary tracking-widest">USER · ACTIVE</div>
          <h1 className="text-2xl font-extrabold">Alex Kim</h1>
          <p className="text-sm text-muted-foreground">alex.kim@example.com · San Francisco</p>
        </div>
        <div className="flex gap-2">
          <button className="size-10 rounded-xl border border-border bg-white/5 flex items-center justify-center hover:bg-white/10" aria-label="Notifications"><Bell className="size-4" /></button>
          <button className="size-10 rounded-xl border border-border bg-white/5 flex items-center justify-center hover:bg-white/10" aria-label="Settings"><Settings className="size-4" /></button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass p-6 rounded-2xl">
            <h3 className="font-bold mb-4">Progress this quarter</h3>
            <div className="space-y-4">
              {[
                { label: "Roadmap completion", v: 42 },
                { label: "Skill stack growth", v: 28 },
                { label: "Courses finished", v: 65 },
              ].map((p) => (
                <div key={p.label}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">{p.label}</span>
                    <span className="font-mono text-primary">{p.v}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${p.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Assessment history</h3>
              <button className="text-xs font-mono text-primary hover:underline flex items-center gap-1"><Download className="size-3" /> EXPORT</button>
            </div>
            <div className="divide-y divide-border">
              {history.map((h) => (
                <div key={h.title} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-semibold text-sm">{h.title}</div>
                    <div className="text-xs text-muted-foreground font-mono">{h.date}</div>
                  </div>
                  <span className="font-mono text-primary text-sm">{h.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4"><Award className="size-4 text-accent" /><h3 className="font-bold">Certifications</h3></div>
            <ul className="space-y-3">
              {certs.map((c) => (
                <li key={c.name}>
                  <div className="font-semibold text-sm">{c.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{c.issuer} · {c.date}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass p-6 rounded-2xl">
            <h3 className="font-bold mb-3">Shortcuts</h3>
            <div className="space-y-2">
              <Link to="/assessment" className="block p-3 rounded-lg bg-white/5 border border-border hover:bg-white/10 text-sm">→ Retake assessment</Link>
              <Link to="/roadmap" className="block p-3 rounded-lg bg-white/5 border border-border hover:bg-white/10 text-sm">→ View roadmap</Link>
              <Link to="/dashboard" className="block p-3 rounded-lg bg-white/5 border border-border hover:bg-white/10 text-sm">→ Open dashboard</Link>
            </div>
          </div>
          <AccountSecurityCard />
        </div>
      </div>
    </div>
  );
}
