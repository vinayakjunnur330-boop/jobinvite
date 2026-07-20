import { useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ParticleField } from "@/components/motion/ParticleField";

/**
 * Global animated backdrop that lives behind every route so the
 * transparent glass panels have something rich to reveal.
 * Also installs a single global mouse tracker that exposes
 * `--mx` / `--my` on <html> for any `.glass-deep` spotlight.
 */
export function AmbientBackground() {
  const { scrollY } = useScroll();
  const orbY1 = useTransform(scrollY, [0, 2000], [0, -240]);
  const orbY2 = useTransform(scrollY, [0, 2000], [0, -140]);
  const orbY3 = useTransform(scrollY, [0, 2000], [0, -80]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let lastEl: HTMLElement | null = null;
    const root = document.documentElement;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      // per-element spotlight for anything with [data-spotlight]
      const target = (e.target as HTMLElement | null)?.closest?.("[data-spotlight]") as HTMLElement | null;
      if (target !== lastEl) {
        if (lastEl) {
          lastEl.style.removeProperty("--mx-l");
          lastEl.style.removeProperty("--my-l");
        }
        lastEl = target;
      }
      if (raf) return;
      raf = requestAnimationFrame(() => {
        root.style.setProperty("--mx", `${tx}px`);
        root.style.setProperty("--my", `${ty}px`);
        if (target) {
          const r = target.getBoundingClientRect();
          target.style.setProperty("--mx-l", `${tx - r.left}px`);
          target.style.setProperty("--my-l", `${ty - r.top}px`);
        }
        raf = 0;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden gpu"
      style={{ transform: "translateZ(0)", willChange: "transform" }}
    >
      <div className="absolute inset-0 bg-[#05060d]" />

      {/* Live particle field */}
      <ParticleField />

      {/* Breathing aurora orbs — parallax on scroll */}
      <motion.div
        className="absolute -top-40 -left-32 size-[620px] rounded-full blur-[150px]"
        style={{ background: "rgba(139,92,246,0.28)", y: orbY1 }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-40 size-[560px] rounded-full blur-[150px]"
        style={{ background: "rgba(34,211,238,0.22)", y: orbY2 }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-1/3 size-[520px] rounded-full blur-[150px]"
        style={{ background: "rgba(236,72,153,0.22)", y: orbY3 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.45, 0.8, 0.45] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2.4 }}
      />

      {/* Global cursor spotlight */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(600px circle at var(--mx, 50%) var(--my, 30%), rgba(139,92,246,0.18), rgba(34,211,238,0.06) 40%, transparent 70%)",
        }}
      />

      {/* Fine grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
    </div>
  );
}
