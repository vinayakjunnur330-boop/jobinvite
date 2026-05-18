import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { testimonials } from "@/lib/careers";
import { Quote } from "lucide-react";

export const Route = createFileRoute("/success-stories")({
  head: () => ({
    meta: [
      { title: "Success Stories — CareerPilot AI" },
      { name: "description", content: "Real students and professionals who found their path with CareerPilot AI." },
    ],
  }),
  component: Stories,
});

function Stories() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="font-mono text-xs text-primary tracking-widest mb-3">SUCCESS_STORIES</div>
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">From lost to launched.</h1>
      <p className="text-muted-foreground mt-3 text-lg max-w-2xl">187,000+ people have used CareerPilot to find their next chapter. Here are a few.</p>

      <div className="grid md:grid-cols-2 gap-5 mt-12">
        {[...testimonials, ...testimonials].slice(0, 8).map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 4) * 0.08 }} className="glass-strong rounded-2xl p-8 hover-lift relative">
            <Quote className="absolute top-6 right-6 size-8 text-primary/30" />
            <p className="text-lg leading-relaxed mb-6">"{t.quote}"</p>
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <div className="size-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-primary-foreground">
                {t.name[0]}
              </div>
              <div>
                <div className="font-bold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
