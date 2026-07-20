import { useRef, type ReactNode, type ComponentPropsWithoutRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type Props = ComponentPropsWithoutRef<typeof motion.button> & {
  children: ReactNode;
  strength?: number; // px pull
  shimmer?: boolean;
};

export function MagneticButton({
  children,
  strength = 14,
  shimmer = true,
  className = "",
  ...rest
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  const fine =
    typeof window !== "undefined" &&
    window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!fine) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * strength;
    const dy = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * strength;
    x.set(dx);
    y.set(dy);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      style={{ x: sx, y: sy }}
      className={`relative overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-cyan-400/50 hover:shadow-[0_0_32px_rgba(34,211,238,0.25)] ${className}`}
      {...rest}
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      {shimmer && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full hover:translate-x-full"
        />
      )}
    </motion.button>
  );
}
