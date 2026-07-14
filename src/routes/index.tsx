import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowRight, Brain, Compass, Rocket, TrendingUp, Zap, Star,
  ShieldCheck, Globe, CheckCircle2, Sparkles,
} from "lucide-react";
import medical from "@/assets/medical.jpg";
import design from "@/assets/design.jpg";
import aviation from "@/assets/aviation.jpg";
import sports from "@/assets/sports.jpg";
import business from "@/assets/business.jpg";
import careersCollage from "@/assets/careers-collage.jpg";
import { careers, domains, futureJobs, testimonials, stats, trends } from "@/lib/careers";
import { slugifyDomain } from "@/lib/domains";
import { SmartSearch } from "@/components/SmartSearch";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { MouseGlow } from "@/components/motion/MouseGlow";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerPilot — Personalized career intelligence" },
      { name: "description", content: "An AI career counselor for students and professionals across 44 industries. Personalized assessments, salary benchmarks, and adaptive learning roadmaps." },
      { property: "og:title", content: "CareerPilot — Personalized career intelligence" },
      { property: "og:description", content: "Data-grounded guidance for the careers you want — and the ones you haven't considered yet." },
    ],
  }),
  component: Home,
});

function useCounter(target: number, duration = 1600) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const n = useCounter(value);
  return <span>{n.toLocaleString()}{suffix}</span>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg radial-fade opacity-60 pointer-events-none" />
        <div
          aria-hidden
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top, color-mix(in oklab, var(--primary) 12%, transparent), transparent 70%)",
          }}
        />
        <MouseGlow size={520} color="color-mix(in oklab, var(--primary) 22%, transparent)" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="max-w-3xl"
          >
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground mb-6"
            >
              <span className="size-1.5 rounded-full bg-success" />
              Trusted by 12,400+ professionals across 38 countries
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
            >
              Find the career
              <br />
              you were <span className="text-primary">built for.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
            >
              CareerPilot is an AI career counselor that combines verified labor data,
              resume intelligence, and personalized assessments to help you build a path
              that actually fits — across 44 industries.
            </motion.p>

            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mt-8 max-w-xl">
              <SmartSearch />
            </motion.div>

            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to="/assessment"
                className="btn-cta inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-primary transition-colors active:scale-[0.98]"
              >
                <Brain className="size-4" /> Take the assessment
              </Link>

              <Link
                to="/resume"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-background text-sm font-medium hover:border-foreground/30 transition-colors"
              >
                <Sparkles className="size-4" /> Analyze my resume
              </Link>
            </motion.div>

            <motion.ul
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
            >
              {["Free to start", "No credit card", "5-minute assessment"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-success" /> {t}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl border border-border overflow-hidden">
            {stats.map((s) => (
              <div key={s.label} className="bg-card p-5 md:p-6">
                <div className="text-2xl md:text-3xl font-bold tracking-tight">
                  <Counter value={s.value} suffix={s.suffix} />
                </div>
                <div className="text-xs text-muted-foreground mt-1.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <SectionHeader
          eyebrow="How it works"
          title="From confused to confident in three steps."
          subtitle="A structured process built around verified data and a personal roadmap that adapts as you grow."
        />
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {[
            { icon: Brain, title: "Tell us about you", desc: "Five minutes to capture your skills, interests, and goals across 30+ structured signals." },
            { icon: Compass, title: "Get matched paths", desc: "Top careers ranked by personal fit, market demand, and projected compensation." },
            { icon: Rocket, title: "Follow your roadmap", desc: "A 12-month milestone plan with curated courses, mentor intros, and progress tracking." },
          ].map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.55 }}
              className="panel p-6 hover-lift"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <s.icon className="size-4.5" />
                </div>
                <div className="text-xs font-medium text-muted-foreground">Step {String(i + 1).padStart(2, "0")}</div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DOMAINS */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-24 border-t border-border">
        <SectionHeader
          eyebrow="Coverage"
          title="Every industry. Every role. Mapped."
          subtitle="From neurosurgery to product design — 44 domains and thousands of role variants."
        />
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {domains.map((d, i) => (
            <motion.div
              key={d}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 12) * 0.02 }}
            >
              <Link
                to="/domain/$slug"
                params={{ slug: slugifyDomain(d) }}
                className="block border border-border bg-card rounded-lg px-3 py-2.5 text-sm text-center text-foreground/80 hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                {d}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CATEGORY CARDS */}
      <section className="max-w-6xl mx-auto px-6 pb-20 md:pb-24">
        <div className="grid md:grid-cols-3 gap-4">
          <CategoryCard image={medical} title="Medical & Healthcare" count="180+ roles" />
          <CategoryCard image={design} title="Design & Creative" count="240+ roles" />
          <CategoryCard image={aviation} title="Aviation & Defense" count="95+ roles" />
          <CategoryCard image={business} title="Business & Finance" count="320+ roles" />
          <CategoryCard image={sports} title="Sports & Fitness" count="110+ roles" />
          <CategoryCard image={careersCollage} title="Explore all 44 domains" count="2,400+ roles" highlight />
        </div>
      </section>

      {/* PILOT — AI COUNSELOR */}
      <section className="border-t border-border bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="text-xs font-medium text-primary mb-3">Pilot · AI counselor</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              An advisor that actually understands your field.
            </h2>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed">
              Pilot is trained on millions of career trajectories and verified labor signals.
              Ask about pivots, salary negotiation, portfolio strategy, or interview prep —
              get specific answers grounded in real outcomes.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                "Skill gap analysis with concrete next steps",
                "Compensation benchmarks for your level and city",
                "Personalized 6-month transition roadmaps",
                "Portfolio and resume review",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="panel p-6 bg-card"
            style={{ boxShadow: "var(--shadow-elevated)" }}
          >
            <ChatPreview />
          </motion.div>
        </div>
      </section>

      {/* TRENDING + FUTURE JOBS */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-2 gap-4">
        <DataPanel
          icon={<TrendingUp className="size-4" />}
          eyebrow="Trending now"
          title="Hottest industries this quarter"
        >
          <div className="space-y-2.5 mt-5">
            {trends.slice(0, 6).map((t, i) => (
              <motion.div
                key={t.industry}
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/60 hover:bg-secondary transition-colors"
              >
                <span className="text-sm font-medium">{t.industry}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${parseInt(t.change)}%` }} />
                  </div>
                  <span className="font-mono text-xs font-semibold text-primary">{t.change}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </DataPanel>

        <DataPanel
          icon={<Zap className="size-4" />}
          eyebrow="Emerging roles"
          title="Careers that will define the next decade"
        >
          <div className="space-y-2.5 mt-5">
            {futureJobs.map((j, i) => (
              <motion.div
                key={j.title}
                initial={{ opacity: 0, x: 6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-lg bg-secondary/60 hover:bg-secondary transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-semibold">{j.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Emerges by {j.year}</div>
                  </div>
                  <div className="text-xs font-medium text-primary">{j.demand}% demand</div>
                </div>
                <div className="mt-2 h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${j.demand}%` }} />
                </div>
              </motion.div>
            ))}
          </div>
        </DataPanel>
      </section>

      {/* CAREER CARDS */}
      <section className="max-w-6xl mx-auto px-6 pb-20 md:pb-24">
        <SectionHeader eyebrow="Explore" title="A few of the 2,400+ paths we map." />
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {careers.slice(0, 9).map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (i % 3) * 0.06, duration: 0.5 }}
              className="panel p-5 hover-lift"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{c.industry}</div>
                <div className="text-xs font-semibold text-primary">{c.match}% match</div>
              </div>
              <h3 className="text-base font-semibold mb-1.5">{c.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{c.summary}</p>
              <div className="flex justify-between items-center text-xs pt-3 border-t border-border">
                <span className="text-muted-foreground">{c.salary}</span>
                <span className="text-success font-medium">{c.growth}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-t border-border bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <SectionHeader eyebrow="Customer stories" title="People who found their path." />
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="panel p-6 hover-lift"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, k) => <Star key={k} className="size-3.5 fill-primary text-primary" />)}
                </div>
                <p className="text-sm leading-relaxed mb-5 text-foreground/90">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="size-9 rounded-full bg-secondary text-foreground flex items-center justify-center text-sm font-semibold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: ShieldCheck, label: "Private by default", desc: "Encrypted end-to-end. Never sold." },
            { icon: Globe, label: "12 languages", desc: "Built for a global workforce." },
            { icon: Zap, label: "Real-time insights", desc: "Streaming responses, instant answers." },
            { icon: Star, label: "94% match rate", desc: "Verified across 2.4M trajectories." },
          ].map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="panel p-5 hover-lift"
            >
              <f.icon className="size-5 text-primary mb-3" />
              <div className="font-semibold text-sm">{f.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden border border-border bg-foreground text-background p-10 md:p-16">
          <div
            aria-hidden
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse at top right, color-mix(in oklab, var(--primary) 60%, transparent), transparent 60%)",
            }}
          />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              Your future is closer than you think.
            </h2>
            <p className="text-background/70 mt-4 max-w-xl text-base md:text-lg">
              Five minutes. One assessment. A career path that finally makes sense. Free forever.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/assessment"
                className="btn-cta inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-background text-foreground text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors active:scale-[0.98]"
              >
                Start free assessment <ArrowRight className="size-4" />

              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 rounded-lg border border-background/20 text-background text-sm font-medium hover:border-background/50 transition-colors"
              >
                Talk to our team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-xs font-medium text-primary mb-3"
      >
        {eyebrow}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05 }}
        className="text-3xl md:text-4xl font-bold tracking-tight leading-tight"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-muted-foreground text-base md:text-lg"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

function DataPanel({
  icon, eyebrow, title, children,
}: { icon: React.ReactNode; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="panel p-6 md:p-7 hover-lift">
      <div className="text-xs font-medium text-primary mb-2 flex items-center gap-1.5">
        {icon} {eyebrow}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function CategoryCard({ image, title, count, highlight }: { image: string; title: string; count: string; highlight?: boolean }) {
  return (
    <Link
      to="/dashboard"
      className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-border block hover-lift"
    >
      <img
        src={image}
        alt={title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
      {highlight && <div className="absolute inset-0 bg-primary/25 mix-blend-multiply" />}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <div className="text-[11px] font-medium opacity-80 mb-1">{count}</div>
        <div className="text-lg font-semibold">{title}</div>
        <div className="mt-2 flex items-center gap-1.5 text-xs opacity-80 group-hover:opacity-100 transition-opacity">
          Explore <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

function ChatPreview() {
  const messages = [
    { role: "user", text: "I'm a 22-year-old commerce grad. I dislike accounting but love design. What should I do?" },
    { role: "ai", text: "Based on your profile, your top three pivots: Product Designer (94% fit), UX Researcher (88%), Brand Strategist (82%). Want me to draft a 6-month transition roadmap?" },
    { role: "user", text: "Yes — and what's the realistic salary?" },
    { role: "ai", text: "Year-1 (junior): ₹8–14L. Year-3 (senior): ₹18–32L. I'll prepare a portfolio plan and a list of 12 target companies." },
  ];
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Sparkles className="size-3.5" />
          </div>
          <span className="font-semibold text-sm">Pilot</span>
          <span className="size-1.5 rounded-full bg-success animate-pulse" />
        </div>
        <span className="text-[11px] text-muted-foreground">Live</span>
      </div>
      {messages.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.25 }}
          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
              m.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-secondary text-foreground rounded-bl-sm"
            }`}
          >
            {m.text}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
