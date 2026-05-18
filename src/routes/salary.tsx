import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import dataViz from "@/assets/data-viz.jpg";
import { careers } from "@/lib/careers";

export const Route = createFileRoute("/salary")({
  head: () => ({
    meta: [
      { title: "Salary Prediction — CareerPilot AI" },
      { name: "description", content: "AI-powered salary forecasts across 44 career domains, with growth and demand signals." },
    ],
  }),
  component: Salary,
});

function Salary() {
  return (
    <>
      <PageHero
        eyebrow="SALARY_PREDICTION"
        title={<>Know what your career <span className="text-gradient-brand">should pay you.</span></>}
        subtitle="Live salary intelligence across 2,400+ roles, factoring in geography, experience, and 36-month projections."
        image={dataViz}
      />
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-3 mb-10">
          {[
            { label: "MEDIAN_TOP_10", value: "$215k", icon: DollarSign },
            { label: "3YR_GROWTH", value: "+34%", icon: TrendingUp },
            { label: "ROLES_TRACKED", value: "2,400+", icon: DollarSign },
          ].map((s) => (
            <div key={s.label} className="glass-strong rounded-2xl p-6 hover-lift">
              <div className="font-mono text-[10px] text-primary tracking-widest mb-2">{s.label}</div>
              <div className="text-3xl font-extrabold text-gradient-brand">{s.value}</div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-6">Compensation across domains</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {careers.slice(0, 16).map((c, i) => {
            const max = 400;
            const low = parseInt(c.salary.replace(/[^0-9]/g, "").slice(0, 3)) || 80;
            const high = Math.min(max, low + 120);
            return (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 6) * 0.04 }}
                className="glass rounded-xl p-5 hover-lift"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold">{c.title}</div>
                    <div className="text-[10px] font-mono text-muted-foreground tracking-widest">{c.industry.toUpperCase()}</div>
                  </div>
                  <span className="text-xs font-mono text-success">{c.growth}</span>
                </div>
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="absolute h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ left: `${(low / max) * 100}%`, width: `${((high - low) / max) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs mt-2 text-muted-foreground font-mono">
                  <span>{c.salary.split("–")[0].trim()}</span>
                  <span>{c.salary.split("–")[1]?.trim() || "—"}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}
