import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Target, Compass, Users, ShieldCheck, LineChart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — CareerPilot" },
      { name: "description", content: "CareerPilot helps students and professionals navigate the modern labor market with verified data, personalized guidance, and an expert coach network." },
      { property: "og:title", content: "About CareerPilot" },
      { property: "og:description", content: "Our mission, values, and the people building career intelligence you can trust." },
    ],
  }),
  component: AboutPage,
});

const values = [
  { icon: LineChart, title: "Data-grounded guidance", text: "Every recommendation is sourced from verified labor market and compensation datasets — never opinions." },
  { icon: Target, title: "Precision over volume", text: "We surface a short list of high-fit careers, not 500 generic suggestions you'd never act on." },
  { icon: Compass, title: "Adaptive roadmaps", text: "Plans rebuild themselves as your skills sharpen and as the market shifts around you." },
  { icon: ShieldCheck, title: "Privacy by default", text: "Your resume, assessments, and history stay yours. Never sold, never shared with employers without consent." },
];

const team = [
  { name: "Aanya Mehta", role: "Co-founder · CEO", bio: "Former product lead, LinkedIn Career Insights." },
  { name: "Daniel Cho", role: "Co-founder · CTO", bio: "Ex-Stripe ML. Built recommendation systems at scale." },
  { name: "Priya Raghavan", role: "Head of Coaching", bio: "20 years guiding executives across 14 industries." },
  { name: "Marcus Lee", role: "Head of Research", bio: "Labor economist. Previously at Brookings." },
];

const timeline = [
  { year: "2022", title: "Founded", text: "Started from a Stanford d.school project on career mobility." },
  { year: "2023", title: "1M assessments", text: "Reached one million completed assessments across 38 countries." },
  { year: "2024", title: "Coaching network", text: "Onboarded 400+ verified industry mentors." },
  { year: "2025", title: "Series A", text: "Raised $18M to expand into apprenticeship programs." },
];

function AboutPage() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary mb-5">
            <Sparkles className="size-3.5" /> About CareerPilot
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            Built for the careers that <span className="text-primary">don't exist yet.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            The half-life of professional skills is shrinking and new roles emerge every quarter.
            We combine resume intelligence, structured assessments, and live market data to give you
            a clear path forward — and re-route it the moment something changes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/assessment" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-neutral-900 text-sm font-medium hover:bg-primary transition-colors active:scale-[0.98]">
              Start your assessment <ArrowRight className="size-4" />
            </Link>
            <Link to="/contact" className="inline-flex items-center px-5 py-2.5 rounded-lg border border-border bg-background text-sm font-medium hover:border-foreground/30 transition-colors">
              Talk to our team
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {[
            { v: "1.2M+", l: "Career paths mapped" },
            { v: "10M+", l: "Job signals analyzed daily" },
            { v: "94%", l: "Match precision rate" },
            { v: "38", l: "Countries served" },
          ].map((s) => (
            <div key={s.l} className="bg-card p-6 md:p-8">
              <div className="text-3xl md:text-4xl font-bold tracking-tight">{s.v}</div>
              <div className="text-sm text-muted-foreground mt-2">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="max-w-2xl mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">What guides us</h2>
          <p className="text-muted-foreground mt-3">Four principles we apply to every product decision we make.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="panel p-6 hover-lift"
            >
              <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <v.icon className="size-5" />
              </div>
              <h3 className="font-semibold text-base mb-1.5">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="max-w-2xl mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The people behind the product</h2>
          <p className="text-muted-foreground mt-3">A small, deliberate team of engineers, researchers, and career experts.</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {team.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="panel p-5"
            >
              <div className="size-12 rounded-full bg-secondary text-foreground flex items-center justify-center text-base font-semibold mb-4">
                {m.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="font-semibold text-sm">{m.name}</div>
              <div className="text-xs text-primary mt-0.5">{m.role}</div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{m.bio}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 panel p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="size-5 text-primary" />
            <p className="text-sm">We're hiring across engineering, research, and coaching.</p>
          </div>
          <a href="mailto:careers@careerpilot.ai" className="text-sm font-medium story-link text-primary">
            See open roles
          </a>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="max-w-2xl mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Our path so far</h2>
        </div>
        <div className="relative border-l border-border pl-8 space-y-8">
          {timeline.map((t, i) => (
            <motion.div
              key={t.year}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative"
            >
              <div className="absolute -left-[37px] top-1 size-3 rounded-full bg-primary border-4 border-background" />
              <div className="text-xs font-medium text-primary">{t.year}</div>
              <div className="font-semibold mt-1">{t.title}</div>
              <p className="text-sm text-muted-foreground mt-1">{t.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
