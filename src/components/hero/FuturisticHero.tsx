import { lazy, Suspense, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Brain, Search, Sparkles, ArrowRight } from "lucide-react";

const NeuralCanvas = lazy(() => import("./NeuralCanvas"));

function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

function MagneticButton({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setPos({ x: (e.clientX - (r.left + r.width / 2)) * 0.35, y: (e.clientY - (r.top + r.height / 2)) * 0.35 });
      }}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 260, damping: 18, mass: 0.4 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

function FuturisticSearch() {
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) window.location.href = `/jobs?q=${encodeURIComponent(q)}`;
      }}
      className="group relative w-full"
    >
      {/* animated conic glow border */}
      <div
        aria-hidden
        className="absolute -inset-[1.5px] rounded-2xl opacity-60 group-hover:opacity-100 group-focus-within:opacity-100 blur-[2px] transition-opacity"
        style={{
          background:
            "conic-gradient(from 0deg, #8b5cf6, #22d3ee, #ec4899, #8b5cf6)",
          animation: "spin 6s linear infinite",
        }}
      />
      <div className="relative flex items-center gap-2 rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 p-2 pl-5">
        <Search className="size-5 text-white/60 shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search 2,400+ careers — try 'AI Engineer', 'UX Designer', 'Pilot'…"
          className="flex-1 bg-transparent text-white placeholder:text-white/40 py-3 outline-none text-[15px]"
        />
        <MagneticButton className="relative inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 text-white text-sm font-semibold shadow-[0_0_25px_-4px_rgba(139,92,246,0.6)]">
          Search <ArrowRight className="size-4" />
        </MagneticButton>
      </div>
    </form>
  );
}

export function FuturisticHero() {
  const hydrated = useHydrated();

  return (
    <section className="relative overflow-hidden bg-[#05060d]">
      {/* animated aurora orbs */}
      <div aria-hidden className="absolute -top-40 -left-32 size-[560px] rounded-full bg-violet-600/25 blur-[140px] animate-pulse" />
      <div aria-hidden className="absolute top-1/3 -right-40 size-[520px] rounded-full bg-cyan-400/20 blur-[140px] animate-pulse" style={{ animationDelay: "1.4s" }} />
      <div aria-hidden className="absolute bottom-0 left-1/2 -translate-x-1/2 size-[480px] rounded-full bg-fuchsia-500/20 blur-[140px] animate-pulse" style={{ animationDelay: "2.6s" }} />

      {/* subtle grid overlay */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />

      {/* 3D canvas */}
      <div className="absolute inset-0">
        {hydrated && (
          <Suspense fallback={null}>
            <NeuralCanvas />
          </Suspense>
        )}
      </div>

      {/* vignette to seat text */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05060d]/40 to-[#05060d]" />

      {/* content */}
      <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-32 md:pt-36 md:pb-40">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.11, delayChildren: 0.1 } } }}
          className="max-w-3xl"
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl text-xs font-medium text-white/70 mb-8"
          >
            <Sparkles className="size-3.5 text-cyan-300" />
            <span>Powered by a neural career engine · 44 industries</span>
          </motion.div>

          {[
            "Find the career",
            <>
              you were{" "}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
                built for.
              </span>
            </>,
          ].map((line, i) => (
            <motion.h1
              key={i}
              variants={{
                hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
                show: { opacity: 1, y: 0, filter: "blur(0px)" },
              }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.02] text-white"
            >
              {line}
            </motion.h1>
          ))}

          <motion.p
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.7 }}
            className="mt-7 text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed"
          >
            CareerPilot fuses verified labor data, resume intelligence, and a personalized
            neural assessment into one adaptive roadmap — for the career you'll actually love.
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.7 }}
            className="mt-10 max-w-2xl"
          >
            <FuturisticSearch />
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.7 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/assessment">
              <MagneticButton className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#05060d] text-sm font-semibold shadow-[0_10px_40px_-10px_rgba(255,255,255,0.4)]">
                <Brain className="size-4" /> Take the neural assessment
              </MagneticButton>
            </Link>
            <Link
              to="/resume"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 bg-white/[0.03] backdrop-blur-xl text-white text-sm font-medium hover:bg-white/[0.08] hover:border-white/30 transition-all"
            >
              <Sparkles className="size-4 text-cyan-300" /> Analyze my resume
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
