import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { parallaxStore } from "@/lib/parallax-store";
import { useCareer } from "@/contexts/CareerContext";

export function ParallaxBackdrop() {
  const raw = useMotionValue(0);
  const smooth = useSpring(raw, { stiffness: 80, damping: 22, mass: 0.6 });
  const { profile } = useCareer();

  useEffect(() => {
    raw.set(parallaxStore.get());
    return parallaxStore.subscribe((v) => raw.set(v));
  }, [raw]);

  // Different layers move at different rates for true depth.
  const yOrb1 = useTransform(smooth, (v) => v * 0.35);
  const yOrb2 = useTransform(smooth, (v) => v * 0.6);
  const yOrb3 = useTransform(smooth, (v) => v * 0.85);
  const yGrid = useTransform(smooth, (v) => v * 0.15);
  const yDots = useTransform(smooth, (v) => v * 0.5);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Soft base wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.indigo.50)_0%,transparent_55%)]" />

      {/* Grid layer */}
      <motion.div
        style={{ y: yGrid }}
        className="absolute -inset-y-32 inset-x-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
      />

      {/* Career-tinted orbs */}
      <motion.div
        style={{ y: yOrb1, background: `radial-gradient(circle, ${profile.glow} 0%, transparent 60%)` }}
        className="absolute -top-40 -left-32 size-[640px] rounded-full blur-3xl opacity-60 transition-[background] duration-700"
      />
      <motion.div
        style={{ y: yOrb2, background: `radial-gradient(circle, ${profile.glow} 0%, transparent 65%)` }}
        className="absolute top-1/3 -right-40 size-[720px] rounded-full blur-3xl opacity-40 transition-[background] duration-700"
      />
      <motion.div
        style={{ y: yOrb3, background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 65%)" }}
        className="absolute -bottom-48 left-1/4 size-[560px] rounded-full blur-3xl opacity-50"
      />

      {/* Cosmic particle dots */}
      <motion.svg
        style={{ y: yDots }}
        className="absolute inset-0 w-full h-full opacity-50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(79,70,229,0.35)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </motion.svg>
    </div>
  );
}
