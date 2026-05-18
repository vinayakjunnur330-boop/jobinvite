import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Target, Compass, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — CareerPilot AI" },
      { name: "description", content: "CareerPilot AI is a startup-grade AI career counselor helping students and professionals navigate the modern job market." },
      { property: "og:title", content: "About CareerPilot AI" },
      { property: "og:description", content: "Our mission, values, and the team behind your career copilot." },
    ],
  }),
  component: AboutPage,
});

const values = [
  { icon: <Sparkles className="size-5" />, title: "Intelligence first", text: "Every recommendation is grounded in real labor market signals, not vibes." },
  { icon: <Target className="size-5" />, title: "Precision over noise", text: "We surface 5 high-fit careers instead of 500 generic suggestions." },
  { icon: <Compass className="size-5" />, title: "Personal navigation", text: "Your roadmap adapts as your skills, goals, and the market evolve." },
  { icon: <Users className="size-5" />, title: "For everyone", text: "Whether you're a student or a 20-year veteran considering a pivot." },
];

export default function AboutPage() { return <Page />; }
function Page() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <div className="font-mono text-xs text-primary tracking-widest mb-3">ABOUT</div>
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">A copilot for the careers that don't exist yet.</h1>
      <p className="text-lg text-muted-foreground max-w-3xl mb-12">
        CareerPilot AI was built for a world where the half-life of skills keeps shrinking and entirely new roles emerge every quarter. We combine resume intelligence, personality signals, and live market data to give you a clear flight path — and re-route it the moment something changes.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-16">
        {values.map((v) => (
          <div key={v.title} className="glass p-6 rounded-2xl">
            <div className="size-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">{v.icon}</div>
            <h3 className="font-bold mb-2">{v.title}</h3>
            <p className="text-sm text-muted-foreground">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-10">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { v: "1.2M+", l: "Paths mapped" },
            { v: "10M+", l: "Job signals analyzed" },
            { v: "94%", l: "Match precision" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-4xl font-extrabold text-gradient-brand">{s.v}</div>
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mt-2">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
