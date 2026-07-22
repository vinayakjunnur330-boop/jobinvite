import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, MessageSquare, DollarSign, Sparkles, ArrowRight, CheckCircle2, BookOpen } from "lucide-react";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Career Support Hub — Free resume, interview & negotiation guides — CareerPilot AI" },
      { name: "description", content: "Free ATS-friendly resume templates, interview prep checklists, and salary negotiation guides — built to reduce job-search anxiety." },
      { property: "og:title", content: "Career Support Hub — CareerPilot AI" },
      { property: "og:description", content: "Free templates and playbooks for a calmer, more confident job search." },
    ],
  }),
  component: ResourcesPage,
});

const templates = [
  { name: "Modern ATS Resume", desc: "Clean single-column layout that passes every ATS parser.", pages: "1 page · .docx / .pdf" },
  { name: "Career Switcher Resume", desc: "Skills-first format for changing industries.", pages: "1 page · .docx / .pdf" },
  { name: "Senior / Executive Resume", desc: "Achievement-led with quantified impact.", pages: "2 pages · .docx / .pdf" },
  { name: "New Grad Resume", desc: "Highlights projects and coursework when experience is light.", pages: "1 page · .docx / .pdf" },
];

const interviewChecklist = [
  "Research the company's last 3 product/blog updates",
  "Prepare 3 STAR stories that map to the role",
  "Have 5 thoughtful questions for the interviewer",
  "Confirm salary range and interview format upfront",
  "Test your camera, mic, and lighting 30 min before",
  "Send a personalized thank-you note within 24 hours",
];

const negotiationPlays = [
  { title: "Anchor with a range", body: "Always give a range 10–15% above your target. Silence after the offer is your friend." },
  { title: "Negotiate the whole package", body: "Base salary, sign-on, equity, PTO, remote flexibility, and title all move independently." },
  { title: "Never accept on the call", body: "Say: \"Thanks for the offer — I'd like 24–48 hours to review.\" Every time." },
  { title: "Use competing offers gracefully", body: "Frame it as decision-making context, not leverage: \"I'm weighing another offer at $X.\"" },
];

export function ResourcesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <header className="mb-12 max-w-3xl">
        <div className="font-mono text-xs text-primary tracking-widest mb-3">CAREER_SUPPORT_HUB</div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Job hunting is stressful. Here's a calmer way through it.</h1>
        <p className="text-muted-foreground text-lg">Free resume templates, interview checklists, and negotiation playbooks — no email gate, no upsell.</p>
      </header>

      {/* Templates */}
      <section className="mb-14">
        <SectionHead icon={<FileText className="size-4" />} eyebrow="RESUME_TEMPLATES" title="ATS-friendly resume templates" />
        <div className="grid md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <div key={t.name} className="glass rounded-2xl p-5 hover:border-primary/50 transition-colors flex items-start gap-4">
              <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <FileText className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
                <div className="text-[11px] font-mono text-muted-foreground mt-2">{t.pages}</div>
              </div>
              <button className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 whitespace-nowrap">
                Download <ArrowRight className="size-3" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Interview prep */}
      <section className="mb-14 grid md:grid-cols-2 gap-6">
        <div>
          <SectionHead icon={<MessageSquare className="size-4" />} eyebrow="INTERVIEW_PREP" title="Pre-interview checklist" />
          <div className="glass rounded-2xl p-6 space-y-3">
            {interviewChecklist.map((c) => (
              <div key={c} className="flex items-start gap-3">
                <CheckCircle2 className="size-4 text-success flex-shrink-0 mt-0.5" />
                <span className="text-sm">{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHead icon={<Sparkles className="size-4" />} eyebrow="PRACTICE" title="Mock interviews with AI" />
          <div className="glass-strong rounded-2xl p-6 h-full flex flex-col">
            <p className="text-sm text-muted-foreground mb-4">
              Practice behavioral and role-specific questions with our AI counselor. Get feedback on structure, clarity, and impact — 24/7, free, private.
            </p>
            <ul className="text-sm space-y-2 mb-6">
              <li className="flex gap-2"><CheckCircle2 className="size-4 text-success mt-0.5" /> STAR-format coaching</li>
              <li className="flex gap-2"><CheckCircle2 className="size-4 text-success mt-0.5" /> Role-specific technical drills</li>
              <li className="flex gap-2"><CheckCircle2 className="size-4 text-success mt-0.5" /> Voice or text input</li>
            </ul>
            <Link to="/assessment" className="mt-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-foreground text-neutral-900 text-sm font-semibold hover:bg-primary transition-colors">
              Start a mock interview <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Negotiation */}
      <section className="mb-14">
        <SectionHead icon={<DollarSign className="size-4" />} eyebrow="NEGOTIATION" title="Four plays that consistently raise offers" />
        <div className="grid md:grid-cols-2 gap-4">
          {negotiationPlays.map((p, i) => (
            <div key={p.title} className="glass rounded-2xl p-6">
              <div className="text-[10px] font-mono text-primary tracking-widest mb-2">PLAY_0{i + 1}</div>
              <div className="font-bold mb-1">{p.title}</div>
              <p className="text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Guides */}
      <section>
        <SectionHead icon={<BookOpen className="size-4" />} eyebrow="DEEPER_READS" title="Long-form guides" />
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: "The 30-day job search plan", read: "8 min read" },
            { title: "How to write a cover letter that gets read", read: "6 min read" },
            { title: "Remote-first: how to interview & negotiate for it", read: "10 min read" },
          ].map((g) => (
            <Link key={g.title} to="/blog" className="glass rounded-2xl p-5 hover:border-primary/50 transition-colors block">
              <div className="text-[10px] font-mono text-muted-foreground tracking-widest mb-2">{g.read.toUpperCase()}</div>
              <div className="font-semibold">{g.title}</div>
              <div className="text-xs text-primary mt-3 inline-flex items-center gap-1">Read guide <ArrowRight className="size-3" /></div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHead({ icon, eyebrow, title }: { icon: React.ReactNode; eyebrow: string; title: string }) {
  return (
    <div className="mb-5">
      <div className="font-mono text-[10px] text-primary tracking-widest mb-2 inline-flex items-center gap-2">{icon} {eyebrow}</div>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}
