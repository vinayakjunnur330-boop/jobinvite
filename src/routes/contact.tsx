import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { Mail, MapPin, MessageCircle, Send, CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — CareerPilot" },
      { name: "description", content: "Reach the CareerPilot team for questions, partnerships, press, or product feedback. We respond within one business day." },
      { property: "og:title", content: "Contact CareerPilot" },
      { property: "og:description", content: "Get in touch — we typically reply within one business day." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email address").max(160),
  subject: z.string().trim().min(3, "Subject is required").max(120),
  message: z.string().trim().min(20, "Please give us a few more details (min 20 chars)").max(2000),
});

type FormValues = z.infer<typeof schema>;
type Errors = Partial<Record<keyof FormValues, string>>;

const channels = [
  { icon: Mail, label: "Email", value: "hello@careerpilot.ai", href: "mailto:hello@careerpilot.ai" },
  { icon: MessageCircle, label: "Live chat", value: "Pilot Assistant (bottom right)" },
  { icon: MapPin, label: "Office", value: "San Francisco, CA" },
];

function ContactPage() {
  const [values, setValues] = useState<FormValues>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const update = <K extends keyof FormValues>(k: K, v: string) => {
    setValues((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const validateField = <K extends keyof FormValues>(k: K) => {
    const r = schema.shape[k].safeParse(values[k]);
    if (!r.success) setErrors((prev) => ({ ...prev, [k]: r.error.issues[0]?.message }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(values);
    if (!r.success) {
      const fieldErrors: Errors = {};
      r.error.issues.forEach((i) => {
        const key = i.path[0] as keyof FormValues;
        if (!fieldErrors[key]) fieldErrors[key] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setStatus("submitting");
    await new Promise((res) => setTimeout(res, 1100));
    setStatus("success");
  };

  const reset = () => {
    setValues({ name: "", email: "", subject: "", message: "" });
    setErrors({});
    setStatus("idle");
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pt-20 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <div className="text-xs font-medium text-primary mb-3">Contact</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Get in touch</h1>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          Questions, partnerships, press, or product feedback — leave us a note and we'll
          reply within one business day.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4 mt-12">
        {channels.map((c, i) => {
          const inner = (
            <div className="panel p-5 hover-lift h-full">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                <c.icon className="size-4" />
              </div>
              <div className="text-xs text-muted-foreground">{c.label}</div>
              <div className="font-medium text-sm mt-1">{c.value}</div>
            </div>
          );
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              {c.href ? <a href={c.href} className="block">{inner}</a> : inner}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 panel p-6 md:p-8 max-w-3xl">
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10"
            >
              <div className="size-12 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="size-6" />
              </div>
              <h2 className="text-xl font-semibold">Message received</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Thanks for reaching out — a member of our team will reply to{" "}
                <span className="text-foreground font-medium">{values.email}</span> within
                one business day.
              </p>
              <button
                onClick={reset}
                className="mt-6 inline-flex items-center px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium hover:border-foreground/30 transition-colors"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={submit}
              noValidate
              className="space-y-5"
            >
              <div className="grid md:grid-cols-2 gap-5">
                <Field
                  label="Full name"
                  name="name"
                  value={values.name}
                  error={errors.name}
                  onChange={(v) => update("name", v)}
                  onBlur={() => validateField("name")}
                  placeholder="Jane Doe"
                />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  value={values.email}
                  error={errors.email}
                  onChange={(v) => update("email", v)}
                  onBlur={() => validateField("email")}
                  placeholder="jane@company.com"
                />
              </div>
              <Field
                label="Subject"
                name="subject"
                value={values.subject}
                error={errors.subject}
                onChange={(v) => update("subject", v)}
                onBlur={() => validateField("subject")}
                placeholder="Partnership inquiry"
              />
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1.5">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={values.message}
                  onChange={(e) => update("message", e.target.value)}
                  onBlur={() => validateField("message")}
                  placeholder="Tell us a bit about what you need…"
                  aria-invalid={!!errors.message}
                  className={`w-full bg-background border rounded-lg px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/60 focus-ring transition-colors ${errors.message ? "border-destructive" : "border-border"}`}
                />
                {errors.message && <p className="text-xs text-destructive mt-1.5">{errors.message}</p>}
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">We'll never share your email.</p>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-primary transition-colors active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "submitting" ? (
                    <><Loader2 className="size-4 animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="size-4" /> Send message</>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({
  label, name, value, error, onChange, onBlur, type = "text", placeholder,
}: {
  label: string; name: string; value: string; error?: string;
  onChange: (v: string) => void; onBlur: () => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={`w-full bg-background border rounded-lg px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/60 focus-ring transition-colors ${error ? "border-destructive" : "border-border"}`}
      />
      {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
    </div>
  );
}
