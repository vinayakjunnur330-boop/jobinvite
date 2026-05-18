import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, MessageCircle, Send } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — CareerPilot AI" },
      { name: "description", content: "Get in touch with the CareerPilot AI team." },
      { property: "og:title", content: "Contact CareerPilot AI" },
      { property: "og:description", content: "Reach out to our team — we're here to help." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="font-mono text-xs text-primary tracking-widest mb-3">CONTACT</div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Talk to mission control</h1>
      <p className="text-muted-foreground max-w-2xl mb-12">Questions, partnerships, press, or feedback — drop us a line and we'll get back within 24 hours.</p>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: <Mail className="size-4" />, label: "EMAIL", value: "hello@careerpilot.ai" },
          { icon: <MessageCircle className="size-4" />, label: "CHAT", value: "Pilot Assistant · bottom right" },
          { icon: <MapPin className="size-4" />, label: "BASE", value: "San Francisco, CA" },
        ].map((c) => (
          <div key={c.label} className="glass p-5 rounded-2xl">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">{c.icon}</div>
            <div className="text-[10px] font-mono text-muted-foreground tracking-widest">{c.label}</div>
            <div className="font-semibold mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setSent(true); }}
        className="glass p-8 rounded-3xl space-y-4 max-w-2xl"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Name" name="name" />
          <Field label="Email" name="email" type="email" />
        </div>
        <Field label="Subject" name="subject" />
        <div>
          <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Message</label>
          <textarea
            name="message"
            rows={5}
            required
            className="mt-2 w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button type="submit" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center gap-2 hover:shadow-[var(--shadow-glow-primary)] transition-all">
          <Send className="size-4" /> Send message
        </button>
        {sent && <p className="text-sm text-success font-mono">✓ MESSAGE_TRANSMITTED — we'll be in touch soon.</p>}
      </form>
    </div>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        name={name}
        type={type}
        required
        className="mt-2 w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </div>
  );
}
