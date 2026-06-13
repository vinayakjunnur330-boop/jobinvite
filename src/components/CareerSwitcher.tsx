import { motion } from "framer-motion";
import { useCareer } from "@/contexts/CareerContext";
import { CAREER_LIST } from "@/lib/career-links";
import { cn } from "@/lib/utils";

export function CareerSwitcher({ className }: { className?: string }) {
  const { active, setActive } = useCareer();
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {CAREER_LIST.map((c) => {
        const isActive = c.key === active;
        const Icon = c.icon;
        return (
          <button
            key={c.key}
            onClick={(e) => setActive(c.key, e)}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-foreground/20 bg-foreground text-background shadow-elevated"
                : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30",
            )}
          >
            <Icon className="size-4" />
            <span>{c.label}</span>
            {isActive && (
              <motion.span
                layoutId="career-pill-glow"
                className="absolute inset-0 -z-10 rounded-full"
                style={{ boxShadow: `0 0 25px -2px ${c.glow}` }}
                transition={{ type: "spring", stiffness: 240, damping: 26 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
