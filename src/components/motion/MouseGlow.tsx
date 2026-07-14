import { useEffect, useRef } from "react";

/**
 * A soft cursor-tracking radial glow overlay, meant for dark sections.
 * Position the parent `relative` and drop this in as a full-cover child.
 * Uses pointer events for pen/mouse; disabled on touch and when
 * prefers-reduced-motion is set.
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

    const onMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      tx = e.clientX - rect.left;
      ty = e.clientY - rect.top;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          el.style.setProperty("--mx", `${tx}px`);
          el.style.setProperty("--my", `${ty}px`);
          el.style.opacity = "1";
          raf = 0;
        });
      }
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ${className}`}
      style={{
        background: `radial-gradient(${size}px circle at var(--mx, 50%) var(--my, 50%), ${color}, transparent 60%)`,
        mixBlendMode: "screen",
      }}
    />
  );
}
