import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, Brain, Compass, Rocket, TrendingUp, Search, Zap, Star, Shield, Globe } from "lucide-react";
import heroAi from "@/assets/hero-ai.jpg";
import studentAi from "@/assets/student-ai.jpg";
import careersCollage from "@/assets/careers-collage.jpg";
import medical from "@/assets/medical.jpg";
import design from "@/assets/design.jpg";
import aviation from "@/assets/aviation.jpg";
import sports from "@/assets/sports.jpg";
import business from "@/assets/business.jpg";
import { careers, domains, futureJobs, testimonials, stats, trends } from "@/lib/careers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerPilot AI — Discover your perfect career with AI" },
      { name: "description", content: "AI-powered career counselor for students, graduates, and professionals across 44+ domains: tech, medical, design, business, aviation, sports, and more." },
      { property: "og:title", content: "CareerPilot AI — Discover your perfect career" },
      { property: "og:description", content: "AI guidance across every major career domain. Personalized assessments, salary insights, learning roadmaps." },
    ],
  }),
  component: Home,
});

function useCounter(target: number, duration = 1800) {
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

function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  return (
    <div onMouseMove={(e) => setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })}>
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[95vh] overflow-hidden flex items-center">
        {/* parallax bg image */}
        <motion.div style={{ y: heroY, scale: heroScale, opacity: heroOpacity }} className="absolute inset-0">
          <img src={heroAi} alt="" width={1920} height={1280} className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </motion.div>

        {/* animated aurora blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 size-[480px] rounded-full bg-primary/30 blur-[120px] animate-aurora" />
          <div className="absolute top-1/4 -right-32 size-[520px] rounded-full bg-accent/25 blur-[140px] animate-aurora" style={{ animationDelay: "-6s" }} />
          <div className="absolute bottom-0 left-1/3 size-[420px] rounded-full bg-primary/20 blur-[120px] animate-aurora" style={{ animationDelay: "-12s" }} />
        </div>

        {/* mouse glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity opacity-60"
          style={{
            background: `radial-gradient(600px circle at ${mouse.x * 100}% ${mouse.y * 100}%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 60%)`,
          }}
        />

        {/* grid */}
        <div className="absolute inset-0 grid-bg radial-fade opacity-30 animate-grid pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-strong text-xs font-mono mb-6 animate-pulse-glow">
              <span className="size-1.5 rounded-full bg-success animate-pulse" />
              AI_COUNSELOR · ONLINE · 44 DOMAINS
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95]">
              Find the career
              <br />
              you were <span className="text-gradient-shimmer">built</span> for.
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              CareerPilot is your AI counselor across every domain — tech, medicine, design, finance,
              aviation, sports, creative, government, and 38 more. One assessment. A lifetime of clarity.
            </p>

            {/* search bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="mt-8 max-w-2xl"
            >
              <div className="glass-strong rounded-2xl p-2 flex items-center gap-2 hover-lift">
                <Search className="size-5 ml-3 text-muted-foreground" />
                <input
                  placeholder="Search 2,400+ careers — try 'pilot', 'designer', 'AI'..."
                  className="flex-1 bg-transparent px-2 py-3 text-sm md:text-base outline-none placeholder:text-muted-foreground"
                />
                <Link to="/assessment" className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-bold flex items-center gap-2 whitespace-nowrap hover:scale-[1.02] transition-transform">
                  Pilot it <ArrowRight className="size-4" />
                </Link>
              </div>
            </motion.div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/assessment" className="px-6 py-3 rounded-full bg-foreground text-background text-sm font-bold hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-2">
                <Brain className="size-4" /> Take AI assessment
              </Link>
              <Link to="/resume" className="px-6 py-3 rounded-full glass-strong text-sm font-bold hover:border-primary/50 transition-colors flex items-center gap-2">
                <Sparkles className="size-4" /> Analyze my resume
              </Link>
            </div>

            {/* stats strip */}
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="glass rounded-xl p-4"
                >
                  <div className="text-2xl md:text-3xl font-extrabold text-gradient-brand">
                    <Counter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-muted-foreground tracking-widest animate-float">
          SCROLL TO EXPLORE ↓
        </div>
      </section>

      {/* LOGO MARQUEE */}
      <section className="border-y border-border py-8 overflow-hidden bg-card/30">
        <div className="text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-6">
          Trusted by students & professionals from
        </div>
        <div className="relative">
          <div className="flex gap-16 animate-marquee whitespace-nowrap text-2xl font-bold text-muted-foreground/50">
            {[..."Google · Meta · IIT Bombay · Stanford · AIIMS · NIFT · IIM · Microsoft · NASA · Tesla · Amazon · Pixar · Goldman Sachs · UN".split("·"), ..."Google · Meta · IIT Bombay · Stanford · AIIMS · NIFT · IIM · Microsoft · NASA · Tesla · Amazon · Pixar · Goldman Sachs · UN".split("·")].map((l, i) => (
              <span key={i} className="tracking-tight">{l.trim()}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CAREER DOMAINS */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <SectionHeader
          eyebrow="DOMAINS"
          title="Every career. Every dream. Mapped."
          subtitle="From neurosurgery to nano-influencer, we cover 44 domains and thousands of role variations."
        />

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {domains.map((d, i) => (
            <motion.div
              key={d}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 12) * 0.03 }}
              className="glass rounded-xl px-3 py-3 text-sm font-medium hover-lift cursor-pointer text-center"
            >
              {d}
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED CATEGORIES (image cards) */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-4">
          <CategoryCard image={medical} title="Medical & Healthcare" count="180+ roles" />
          <CategoryCard image={design} title="Design & Creative" count="240+ roles" />
          <CategoryCard image={aviation} title="Aviation & Defense" count="95+ roles" />
          <CategoryCard image={business} title="Business & Finance" count="320+ roles" />
          <CategoryCard image={sports} title="Sports & Fitness" count="110+ roles" />
          <CategoryCard image={careersCollage} title="See all 44 domains" count="2,400+ roles" highlight />
        </div>
      </section>

      {/* HOW IT WORKS - 3 step cinematic */}
      <section className="relative max-w-7xl mx-auto px-6 py-24">
        <SectionHeader eyebrow="HOW_IT_WORKS" title="From confused to confident in three steps." />
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {[
            { icon: Brain, title: "Tell AI about you", desc: "Skills, interests, qualifications, personality, goals. 5 minutes, 30+ signals.", step: "01" },
            { icon: Compass, title: "Get personalized matches", desc: "Top careers ranked by fit, demand, salary, and your future trajectory.", step: "02" },
            { icon: Rocket, title: "Follow your roadmap", desc: "12-month milestone plan, curated courses, mentor intros, and live tracking.", step: "03" },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7 }}
              className="glass-strong rounded-2xl p-7 hover-lift relative overflow-hidden group"
            >
              <div className="absolute -top-6 -right-4 text-[120px] font-extrabold text-white/[0.03] leading-none">{s.step}</div>
              <s.icon className="size-9 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              <div className="mt-4 h-px bg-gradient-to-r from-primary/40 to-transparent group-hover:from-accent/60 transition-colors" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI ASSISTANT SHOWCASE */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src={studentAi} alt="" width={1280} height={896} loading="lazy" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="font-mono text-xs text-primary tracking-widest mb-3">PILOT · AI COUNSELOR</div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Chat with an AI that
              <br />
              <span className="text-gradient-brand">actually knows your field.</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Trained on 2.4M career trajectories. Speaks 12 languages. Answers everything from
              "Should I do an MBA?" to "How do I switch from law to UX?"
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Skill gap analysis", "Salary negotiation", "Career pivot plans", "Portfolio review", "Interview prep"].map((t) => (
                <span key={t} className="px-3 py-1.5 rounded-full glass text-xs font-mono">{t}</span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="glass-strong rounded-3xl p-6 shadow-[0_30px_80px_-20px_color-mix(in_oklab,var(--primary)_30%,transparent)]">
            <ChatPreview />
          </motion.div>
        </div>
      </section>

      {/* TRENDING + FUTURE JOBS */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-6">
        <div className="glass-strong rounded-2xl p-8 hover-lift">
          <div className="font-mono text-xs text-primary tracking-widest mb-3 flex items-center gap-2">
            <TrendingUp className="size-3" /> TRENDING_NOW
          </div>
          <h3 className="text-2xl font-bold mb-6">Hottest industries this quarter</h3>
          <div className="space-y-3">
            {trends.slice(0, 6).map((t, i) => (
              <motion.div key={t.industry} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-sm font-medium">{t.industry}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${t.color === "primary" ? "bg-primary" : "bg-accent"}`} style={{ width: `${parseInt(t.change)}%` }} />
                  </div>
                  <span className={`font-mono font-bold text-xs ${t.color === "primary" ? "text-primary" : "text-accent"}`}>{t.change}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-8 hover-lift">
          <div className="font-mono text-xs text-accent tracking-widest mb-3 flex items-center gap-2">
            <Zap className="size-3" /> FUTURE_JOBS
          </div>
          <h3 className="text-2xl font-bold mb-6">Careers that will define the next decade</h3>
          <div className="space-y-3">
            {futureJobs.map((j, i) => (
              <motion.div key={j.title} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-bold">{j.title}</div>
                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5">EMERGES_BY · {j.year}</div>
                  </div>
                  <div className="text-xs font-mono text-accent">{j.demand}% demand</div>
                </div>
                <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent to-primary" style={{ width: `${j.demand}%` }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TOP CAREERS BENTO */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <SectionHeader eyebrow="EXPLORE" title="A few of the 2,400+ paths we map." />
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {careers.slice(0, 9).map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.08 }}
              className="glass rounded-2xl p-6 hover-lift group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="font-mono text-[10px] text-muted-foreground tracking-widest">{c.industry.toUpperCase()}</div>
                <div className="text-xs font-mono font-bold text-primary">{c.match}% MATCH</div>
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-gradient-brand transition-all">{c.title}</h3>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{c.summary}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{c.salary}</span>
                <span className="text-success font-mono">{c.growth}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <SectionHeader eyebrow="STORIES" title="People who found their path." />
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass-strong rounded-2xl p-6 hover-lift">
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="size-3.5 fill-primary text-primary" />)}
              </div>
              <p className="text-sm leading-relaxed mb-5">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="size-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-bold">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Shield, label: "Private by default", desc: "Your data is encrypted. Never sold." },
            { icon: Globe, label: "12 languages", desc: "Built for a global workforce." },
            { icon: Zap, label: "Real-time AI", desc: "Streaming responses, instant insights." },
            { icon: Star, label: "94% match rate", desc: "Verified across 2.4M trajectories." },
          ].map((f) => (
            <div key={f.label} className="glass rounded-2xl p-6 hover-lift">
              <f.icon className="size-6 text-primary mb-3" />
              <div className="font-bold text-sm">{f.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden glass-strong p-12 md:p-20 text-center">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-primary/20 blur-[120px] animate-aurora" />
          <div className="relative">
            <div className="font-mono text-xs text-primary tracking-widest mb-4">READY?</div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Your future self is
              <br />
              <span className="text-gradient-shimmer">waiting on the other side.</span>
            </h2>
            <p className="text-muted-foreground mt-5 max-w-xl mx-auto">
              5 minutes. One assessment. A career path that finally makes sense. Free forever.
            </p>
            <Link to="/assessment" className="inline-flex items-center gap-2 mt-8 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-base font-bold hover:scale-105 transition-transform shadow-[0_0_40px_-8px_var(--primary)]">
              Begin assessment <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-mono text-xs text-primary tracking-widest mb-3">{eyebrow}</motion.div>
      <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">{title}</motion.h2>
      {subtitle && <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="mt-4 text-muted-foreground text-lg">{subtitle}</motion.p>}
    </div>
  );
}

function CategoryCard({ image, title, count, highlight }: { image: string; title: string; count: string; highlight?: boolean }) {
  return (
    <Link to="/dashboard" className="group relative aspect-[4/3] rounded-2xl overflow-hidden hover-lift block">
      <img src={image} alt={title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1200ms] ease-[cubic-bezier(0.32,0.72,0,1)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      {highlight && <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 mix-blend-overlay" />}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="text-[10px] font-mono uppercase tracking-widest text-primary mb-1">{count}</div>
        <div className="text-xl font-bold">{title}</div>
        <div className="mt-2 flex items-center gap-1.5 text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
          Explore <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

function ChatPreview() {
  const messages = [
    { role: "user", text: "I'm a 22yr old commerce grad. Hate accounting. Love design. Help?" },
    { role: "ai", text: "Got it. Based on your profile, your top 3 pivots: Product Designer (94% fit), UX Researcher (88%), Brand Strategist (82%). Want me to draft a 6-month transition roadmap?" },
    { role: "user", text: "Yes — and what's the salary jump?" },
    { role: "ai", text: "Realistic Year-1: ₹8–14L. Year-3 senior: ₹18–32L. I'll prep a portfolio plan + 12 target companies. ✦" },
  ];
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="size-3.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm">Pilot</span>
          <span className="size-1.5 rounded-full bg-success animate-pulse" />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">LIVE</span>
      </div>
      {messages.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.4 }}
          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
            m.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-white/5 border border-border"
          }`}>
            {m.text}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
