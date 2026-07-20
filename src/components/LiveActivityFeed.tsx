import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity } from "lucide-react";

type Item = { id: number; icon: string; text: string };

const POOL: Omit<Item, "id">[] = [
  { icon: "🟢", text: "14 new roles added in Data Science" },
  { icon: "🔥", text: "3 Mentors are live right now" },
  { icon: "⚡", text: "Priya S. just landed a Product Design interview" },
  { icon: "🚀", text: "AI Engineer roles up 22% this week" },
  { icon: "🎯", text: "Marcus L. matched 94% with UX Research" },
  { icon: "💼", text: "Google posted 8 new SWE openings" },
  { icon: "📈", text: "Median salary for ML Engineers: $186k" },
  { icon: "🧭", text: "Aisha K. completed her 6-month roadmap" },
  { icon: "🌐", text: "Remote-first jobs now 41% of listings" },
  { icon: "✨", text: "12 new mentors joined Aviation domain" },
  { icon: "🛰️", text: "Aerospace hiring surged 18% in Q4" },
  { icon: "🩺", text: "Healthcare AI roles opened in 6 new cities" },
];

export function LiveActivityFeed({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const [items, setItems] = useState<Item[]>(() =>
    POOL.slice(0, compact ? 1 : 3).map((p, i) => ({ ...p, id: i })),
  );

  useEffect(() => {
    let counter = items.length;
    const interval = setInterval(() => {
      const next = POOL[Math.floor(Math.random() * POOL.length)];
      counter += 1;
      setItems((prev) => [{ ...next, id: counter }, ...prev].slice(0, compact ? 1 : 3));
    }, 2600);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact]);

  return (
    <div
      className={`relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/60 animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
        </span>
        <Activity className="size-3.5 text-white/60" />
        <span className="text-[11px] uppercase tracking-[0.18em] text-white/60 font-medium">
          Live activity
        </span>
      </div>

      <div className={`relative ${compact ? "h-14" : "h-[168px]"} px-4 py-2`}>
        <AnimatePresence initial={false}>
          {items.map((it, idx) => (
            <motion.div
              key={it.id}
              layout
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              animate={{ opacity: 1 - idx * 0.25, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="flex items-center gap-3 py-2 text-sm text-white/85"
            >
              <span className="text-base">{it.icon}</span>
              <span className="truncate">{it.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
