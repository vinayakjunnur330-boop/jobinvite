import { useEffect, useRef } from "react";

/**
 * Cursor-tracking radial glow for dark sections. Renders a fixed-size
 * layer that is moved via `transform: translate3d(...)` — a composited
 * property — so pointer moves never trigger paint. Skipped on touch and
 * when prefers-reduced-motion is set.
 */
export function MouseGlow({
  size = 480,
  color = "rgba(120, 130, 255, 0.18)",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia?.("(hover: none)").matches) return;

    const parent = el.parentElement;
    if (!parent) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    const half = size / 2;

    const onMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      tx = e.clientX - rect.left - half;
      ty = e.clientY - rect.top - half;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
          el.style.opacity = "1";
          raf = 0;
        });
      }
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    parent.addEventListener("pointermove", onMove, { passive: true });
    parent.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [size]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div
        ref={ref}
        className="absolute top-0 left-0 opacity-0 transition-opacity duration-300"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at center, ${color}, transparent 60%)`,
          willChange: "transform, opacity",
          transform: "translate3d(-9999px, -9999px, 0)",
        }}
      />
    </div>
  );
}
