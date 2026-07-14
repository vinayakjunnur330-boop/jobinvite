import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ReactNode } from "react";

/**
 * Scroll-reveal wrapper. Children fade in and slide up (translateY 20px → 0)
 * as they enter the viewport. When `stagger` is true, direct children are
 * revealed sequentially. Fully respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
  stagger = false,
  staggerDelay = 0.1,
  as = "div",
  once = true,
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  stagger?: boolean;
  staggerDelay?: number;
  as?: "div" | "section" | "ul" | "ol";
  once?: boolean;
  amount?: number;
}) {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: reduce
        ? {}
        : { staggerChildren: stagger ? staggerDelay : 0, delayChildren: delay },
    },
  };

  const item: Variants = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: reduce
        ? { duration: 0 }
        : { duration: 0.55, ease: [0.32, 0.72, 0, 1] },
    },
  };

  const MotionTag = motion[as] as typeof motion.div;

  if (!stagger) {
    return (
      <MotionTag
        className={className}
        initial="hidden"
        whileInView="show"
        viewport={{ once, amount }}
        variants={item}
        transition={{ delay: reduce ? 0 : delay }}
      >
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={container}
    >
      {children}
    </MotionTag>
  );
}

/** Direct child of a staggered <Reveal stagger>. */
export function RevealItem({
  children,
  className,
  y = 20,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  const item: Variants = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: reduce
        ? { duration: 0 }
        : { duration: 0.55, ease: [0.32, 0.72, 0, 1] },
    },
  };
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
