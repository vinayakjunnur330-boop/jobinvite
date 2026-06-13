import { AnimatePresence, motion } from "framer-motion";
import { useCareer } from "@/contexts/CareerContext";

export function SocialLinks() {
  const { profile, active } = useCareer();
  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6, rotateY: -25 }}
          animate={{ opacity: 1, y: 0, rotateY: 0 }}
          exit={{ opacity: 0, y: -6, rotateY: 25 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2"
          style={{ transformPerspective: 600 }}
        >
          {profile.socials.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.platform}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${s.platform} — ${s.handle}`}
                title={`${s.platform}: ${s.handle}`}
                className="size-9 rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/30 flex items-center justify-center transition-colors"
              >
                <Icon className="size-4" />
              </a>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
