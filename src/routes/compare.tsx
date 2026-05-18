import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { careers } from "@/lib/careers";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Career Comparison Tool — CareerPilot AI" },
      { name: "description", content: "Compare any two careers side by side: salary, growth, demand, skills, fit." },
    ],
  }),
  component: Compare,
});

function Compare() {
  const [a, setA] = useState(careers[0].slug);
  const [b, setB] = useState(careers[5].slug);
  const ca = careers.find((c) => c.slug === a)!;
  const cb = careers.find((c) => c.slug === b)!;

  return (
    <>
      <PageHero
        eyebrow="COMPARE"
        title={<>Two paths. <span className="text-gradient-brand">One honest answer.</span></>}
        subtitle="Stack any two careers side by side and let the data decide."
      />
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {[[a, setA, "Career A"], [b, setB, "Career B"]].map(([val, setter, label]: any) => (
            <div key={label} className="glass-strong rounded-2xl p-4">
              <div className="font-mono text-[10px] text-primary tracking-widest mb-2">{label}</div>
              <select value={val} onChange={(e) => setter(e.target.value)} className="w-full bg-transparent border border-border rounded-lg px-3 py-2.5 text-sm font-bold">
                {careers.map((c) => <option key={c.slug} value={c.slug} className="bg-card">{c.title}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[ca, cb].map((c, i) => (
            <motion.div key={c.slug + i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-2xl p-7 hover-lift">
              <div className="text-3xl font-extrabold mb-1">{c.title}</div>
              <div className="font-mono text-xs text-primary mb-6">{c.industry.toUpperCase()}</div>

              <Row label="Match score" value={`${c.match}%`} />
              <Row label="Salary range" value={c.salary} />
              <Row label="YoY growth" value={c.growth} good />
              <Row label="Market demand" value={c.demand} />
              <Row label="Top skills" value={c.skills.join(" · ")} />

              <div className="mt-6 pt-5 border-t border-border">
                <div className="text-xs text-muted-foreground mb-3">SUITABILITY</div>
                <ul className="space-y-1.5 text-sm">
                  <Suit label="High autonomy" yes={c.match > 80} />
                  <Suit label="High earnings ceiling" yes={c.salary.includes("$1") || c.salary.includes("250") || c.salary.includes("400")} />
                  <Suit label="Remote-friendly" yes={["Technology","Data & AI","Design","Marketing"].includes(c.category)} />
                  <Suit label="Future-proof (10yr)" yes={c.demand === "Extreme" || c.demand === "High"} />
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}

function Row({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-border/50">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-bold ${good ? "text-success" : ""}`}>{value}</span>
    </div>
  );
}

function Suit({ label, yes }: { label: string; yes: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {yes ? <Check className="size-4 text-success" /> : <X className="size-4 text-muted-foreground" />}
      <span className={yes ? "" : "text-muted-foreground line-through"}>{label}</span>
    </li>
  );
}
