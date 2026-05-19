import { motion } from "framer-motion";
import studentAi from "@/assets/student-ai.jpg";
import careersCollage from "@/assets/careers-collage.jpg";
import design from "@/assets/design.jpg";
import business from "@/assets/business.jpg";
import medical from "@/assets/medical.jpg";
import aviation from "@/assets/aviation.jpg";

const SCENES = [
  { img: studentAi, label: "Students learning with AI", tag: "LEARN" },
  { img: design, label: "Designers crafting interfaces", tag: "CREATE" },
  { img: business, label: "Teams collaborating to ship", tag: "BUILD" },
  { img: medical, label: "Healthcare in motion", tag: "HEAL" },
  { img: aviation, label: "Pilots commanding the skies", tag: "FLY" },
  { img: careersCollage, label: "Freelancers winning global work", tag: "EARN" },
];

export function CareerScenes() {
  return (
    <section className="relative border-y border-border overflow-hidden">
      {/* full-width animated scene strip */}
      <div className="relative h-[420px] md:h-[480px] w-full">
        {SCENES.map((s, i) => (
          <motion.div
            key={s.label}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: SCENES.length * 4,
              times: [
                (i / SCENES.length),
                (i / SCENES.length) + 0.05,
                ((i + 1) / SCENES.length) - 0.05,
                ((i + 1) / SCENES.length),
              ],
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.img
              src={s.img}
              alt={s.label}
              className="w-full h-full object-cover"
              initial={{ scale: 1.05 }}
              animate={{ scale: 1.15 }}
              transition={{ duration: SCENES.length * 4, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
          </motion.div>
        ))}

        {/* aurora glow */}
        <div className="absolute -top-32 left-1/4 size-[420px] rounded-full bg-primary/20 blur-[140px] animate-aurora pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 size-[380px] rounded-full bg-accent/20 blur-[140px] animate-aurora pointer-events-none" style={{ animationDelay: "-6s" }} />

        {/* foreground content */}
        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="font-mono text-xs text-primary tracking-widest mb-3">REAL_PEOPLE · REAL_PROGRESS</div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              From classroom to <span className="text-gradient-shimmer">first job</span>
              <br />
              to dream career.
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg max-w-xl">
              Students, freelancers, switchers and senior pros — CareerPilot meets you wherever you are
              and walks the road with you.
            </p>
          </motion.div>

          {/* rotating scene tag */}
          <div className="absolute bottom-6 right-6 hidden md:block">
            {SCENES.map((s, i) => (
              <motion.div
                key={s.tag}
                className="absolute right-0 bottom-0 glass-strong rounded-full px-4 py-2 flex items-center gap-2 text-xs font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: SCENES.length * 4,
                  times: [
                    (i / SCENES.length),
                    (i / SCENES.length) + 0.05,
                    ((i + 1) / SCENES.length) - 0.05,
                    ((i + 1) / SCENES.length),
                  ],
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span className="size-1.5 rounded-full bg-success animate-pulse" />
                <span className="tracking-widest">{s.tag}</span>
                <span className="text-muted-foreground">· {s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* stat ribbon */}
      <div className="border-t border-border bg-card/40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { k: "240k+", v: "Students guided" },
            { k: "44", v: "Career domains" },
            { k: "92%", v: "Found direction" },
            { k: "12mo", v: "Avg. to first role" },
          ].map((s, i) => (
            <motion.div
              key={s.v}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="text-2xl md:text-3xl font-extrabold text-gradient-brand">{s.k}</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">{s.v}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
