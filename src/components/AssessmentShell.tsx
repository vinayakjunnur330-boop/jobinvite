import { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function AssessmentShell({
  eyebrow,
  title,
  description,
  nextPath,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  nextPath: string;
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-fuchsia-500/10 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 pt-14 pb-8">
          <Link to="/assessment" className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white mb-6">
            <ArrowLeft className="size-3.5" /> Back to Assessment
          </Link>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 md:p-10">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-cyan-300/90 mb-3">
              <Sparkles className="size-3.5" /> {eyebrow}
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-white/70 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="text-white/60 text-sm">Loading…</div>
        ) : !user ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-white/70 mb-4">Sign in to take this assessment and save your score.</p>
            <button
              onClick={() => navigate({ to: "/login", search: { next: nextPath } as never })}
              className="rounded-lg bg-white text-neutral-900 px-5 py-2 text-sm font-semibold"
            >
              Sign in to continue
            </button>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
