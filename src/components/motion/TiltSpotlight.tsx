import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Cursor-tracking spotlight + subtle 3D tilt wrapper.
 * Auto-disables on touch / reduced motion.
 */
type Props = {
  children: ReactNode;
  className?: string;
  tilt?: number; // max degrees
  spotlightColor?: string;
  radius?: number;
  as?: "div" | "article" | "section";
  style?: CSSProperties;
};

export function TiltSpotlight({
  children,
  className = "",
  tilt = 6,
  spotlightColor = "rgba(139,92,246,0.18)",
  radius = 500,
  style,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const px = useMotionValue(-9999);
  const py = useMotionValue(-9999);

  const rx = useSpring(useTransform(my, [0, 1], [tilt, -tilt]), { stiffness: 160, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-tilt, tilt]), { stiffness: 160, damping: 18 });

  const isFine =
    typeof window !== "undefined" &&
    window.matchMedia?.("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isFine) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    mx.set(x / r.width);
    my.set(y / r.height);
    px.set(x);
    py.set(y);
  };
  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
    px.set(-9999);
    py.set(-9999);
  };

  const bg = useTransform(
    [px, py] as any,
    ([x, y]: number[]) =>
      `radial-gradient(${radius}px circle at ${x}px ${y}px, ${spotlightColor}, transparent 45%)`
  );

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`relative [transform-style:preserve-3d] ${className}`}
      style={{ rotateX: isFine ? rx : 0, rotateY: isFine ? ry : 0, ...style }}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-80 mix-blend-screen"
        style={{ background: bg }}
      />
    </motion.div>
  );
}
