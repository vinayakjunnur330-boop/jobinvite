import { motion } from "framer-motion";
import { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {image && (
        <div className="absolute inset-0">
          <img src={image} alt="" loading="lazy" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
        </div>
      )}
      <div className="absolute -top-32 left-1/3 size-[500px] rounded-full bg-primary/20 blur-[140px] animate-aurora pointer-events-none" />
      <div className="absolute top-1/4 -right-32 size-[440px] rounded-full bg-accent/20 blur-[140px] animate-aurora pointer-events-none" style={{ animationDelay: "-8s" }} />
      <div className="absolute inset-0 grid-bg radial-fade opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-xs text-primary tracking-widest mb-4">{eyebrow}</motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }} className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] max-w-4xl">
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-5 text-lg text-muted-foreground max-w-2xl">
            {subtitle}
          </motion.p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
