import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { ArrowRight, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/personality")({
  head: () => ({
    meta: [
      { title: "Personality Test — CareerPilot AI" },
      { name: "description", content: "Discover the career archetype that matches your personality. 8 questions, instant AI insight." },
    ],
  }),
  component: Personality,
});

const questions = [
  { q: "In a group project, you naturally…", opts: ["Lead the vision", "Organize the plan", "Build the thing", "Sense the team's mood"] },
  { q: "Your ideal weekend includes…", opts: ["A new city", "Solving a hard puzzle", "Building something", "Deep conversation"] },
  { q: "Pressure makes you…", opts: ["Sharper", "Slower & precise", "Resourceful", "Reflective"] },
  { q: "You're proudest of moments when you…", opts: ["Shipped something bold", "Mastered a craft", "Helped someone grow", "Discovered a truth"] },
  { q: "Money matters to you because it buys…", opts: ["Freedom", "Security", "Impact", "Experiences"] },
  { q: "Your superpower is…", opts: ["Persuasion", "Pattern recognition", "Empathy", "Endurance"] },
  { q: "Pick a workspace.", opts: ["Open studio", "Quiet library", "Workshop / lab", "Cafe with people"] },
  { q: "In 10 years you want to be…", opts: ["Building companies", "World-class expert", "Changing lives", "Exploring new frontiers"] },
];

const archetypes = ["The Builder", "The Strategist", "The Healer", "The Explorer"];

function Personality() {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const done = step >= questions.length;

  const result = done
    ? archetypes[picks.reduce((a, b) => a + b, 0) % archetypes.length]
    : null;

  return (
    <>
      <PageHero
        eyebrow="PERSONALITY_PROFILE"
        title={<>Find the career <span className="text-gradient-brand">archetype</span> you were born for.</>}
        subtitle="A 90-second AI-powered personality scan. No pop psychology — 8 carefully calibrated signals."
      />
      <section className="max-w-3xl mx-auto px-6 py-16">
        {!done && (
          <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-8 md:p-10 hover-lift">
            <div className="flex justify-between items-center mb-6">
              <div className="font-mono text-xs text-primary tracking-widest">QUESTION {step + 1} / {questions.length}</div>
              <div className="text-xs text-muted-foreground">{Math.round(((step) / questions.length) * 100)}%</div>
            </div>
            <div className="h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${(step / questions.length) * 100}%` }} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-8">{questions[step].q}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {questions[step].opts.map((o, i) => (
                <button
                  key={o}
                  onClick={() => { setPicks([...picks, i]); setStep(step + 1); }}
                  className="text-left p-4 rounded-xl glass hover-lift hover:border-primary/50 group"
                >
                  <div className="font-mono text-[10px] text-primary mb-1">{String.fromCharCode(65 + i)}</div>
                  <div className="font-medium group-hover:text-gradient-brand transition-all">{o}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {done && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-strong rounded-3xl p-10 text-center animate-pulse-glow">
            <div className="font-mono text-xs text-primary tracking-widest mb-3">YOUR_ARCHETYPE</div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-gradient-brand mb-4">{result}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">You thrive when you can shape outcomes with your own hands. Your top career matches are loaded into your dashboard.</p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <button onClick={() => { setStep(0); setPicks([]); }} className="px-5 py-3 rounded-full glass-strong text-sm font-bold flex items-center gap-2"><RefreshCw className="size-4" /> Retake</button>
              <a href="/dashboard" className="px-5 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-bold flex items-center gap-2">See matches <ArrowRight className="size-4" /></a>
            </div>
          </motion.div>
        )}
      </section>
    </>
  );
}
