import { AnimatePresence, motion } from "framer-motion";
import { useCareer } from "@/contexts/CareerContext";

export function RippleLayer() {
  const { ripple } = useCareer();
  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      <AnimatePresence>
        {ripple && (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.55 }}
            animate={{ scale: 28, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            style={{
              left: ripple.x - 40,
              top: ripple.y - 40,
              background: `radial-gradient(circle, ${ripple.color} 0%, transparent 70%)`,
            }}
            className="absolute size-20 rounded-full"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
