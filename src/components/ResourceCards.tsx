import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useCareer } from "@/contexts/CareerContext";
import type { CareerLink } from "@/lib/career-links";

const KEYS = ["learning", "videos", "network", "community"] as const;
const LABELS: Record<(typeof KEYS)[number], string> = {
  learning: "Learning Platform",
  videos: "Video Tutorials",
  network: "Professional Network",
  community: "Community",
};

export function ResourceCards() {
  const { profile, active } = useCareer();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {KEYS.map((k) => {
        const link = profile[k] as CareerLink;
        const Icon = link.icon;
        return (
          <AnimatePresence key={k} mode="wait">
            <motion.a
              key={`${active}-${k}`}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10, rotateX: -8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -10, rotateX: 8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="group relative block rounded-2xl border border-border bg-card p-5 hover:border-foreground/20 hover:-translate-y-0.5 transition-all shadow-elevated"
              style={{ transformPerspective: 800 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`size-10 rounded-xl flex items-center justify-center ${profile.accentBg} ${profile.accent}`}
                >
                  <Icon className="size-5" />
                </div>
                <ExternalLink className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                {LABELS[k]}
              </div>
              <div className="text-sm font-semibold text-foreground mb-1.5 leading-tight">
                {link.label}
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                {link.description}
              </div>
              <div
                className="absolute inset-x-5 -bottom-px h-px opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, transparent, ${profile.glow}, transparent)` }}
              />
            </motion.a>
          </AnimatePresence>
        );
      })}
    </div>
  );
}
