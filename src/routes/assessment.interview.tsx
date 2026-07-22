import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { AssessmentShell } from "@/components/AssessmentShell";
import { ScoreRing } from "@/components/ScoreRing";
import { generateInterviewQuestions, scoreInterviewAnswers } from "@/lib/ai-grader.functions";

export const Route = createFileRoute("/assessment/interview")({
  head: () => ({
    meta: [
      { title: "Mock Interview Readiness — CareerPilot AI" },
      { name: "description", content: "Take a role-specific AI mock interview with per-answer feedback and exemplar responses." },
      { property: "og:title", content: "Mock Interview Readiness" },
      { property: "og:description", content: "AI mock interviews with feedback and exemplar answers." },
    ],
  }),
  component: Page,
});

type PerQ = { question: string; answer_score: number; feedback: string; exemplar: string };
type ScoreResult = { overall: number; verdict: string; per_question: PerQ[]; top_tips: string[] };

function Page() {
  const genFn = useServerFn(generateInterviewQuestions);
  const scoreFn = useServerFn(scoreInterviewAnswers);
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState<string[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<"idle" | "gen" | "score">("idle");
  const [result, setResult] = useState<ScoreResult | null>(null);

  const start = async () => {
    if (role.trim().length < 2) {
      toast.error("Enter a role (e.g. Frontend Engineer).");
      return;
    }
    setLoading("gen");
    setResult(null);
    try {
      const r = (await genFn({ data: { role: role.trim() } })) as { questions: string[] };
      setQuestions(r.questions);
      setAnswers({});
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading("idle");
    }
  };

  const submit = async () => {
    if (!questions) return;
    const qa = questions.map((q, i) => ({ question: q, answer: (answers[i] ?? "").trim() }));
    if (qa.some((x) => x.answer.length < 5)) {
      toast.error("Please answer every question (at least a sentence).");
      return;
    }
    setLoading("score");
    try {
      const r = (await scoreFn({ data: { role: role.trim(), qa } })) as ScoreResult;
      setResult(r);
      toast.success("Scored & saved");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading("idle");
    }
  };

  return (
    <AssessmentShell
      eyebrow="Mock Interview Readiness"
      title="Rehearse the interview before the interview."
      description="Pick a role — Zoiee will ask five realistic questions, then score your answers and give you a stronger version to model."
      nextPath="/assessment/interview"
    >
      {!questions && !result && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <label className="block text-sm text-white/70 mb-2">What role are you interviewing for?</label>
          <div className="flex gap-2">
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Engineer, Product Manager"
              className="flex-1 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/40 outline-none focus:border-cyan-400/60"
            />
            <button
              onClick={start}
              disabled={loading === "gen"}
              className="rounded-lg bg-white text-neutral-900 px-4 py-2.5 text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50"
            >
              {loading === "gen" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Start
            </button>
          </div>
        </div>
      )}

      {questions && !result && (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-xs uppercase tracking-widest text-white/50 mb-2">Question {i + 1}</div>
              <div className="text-white mb-3">{q}</div>
              <textarea
                value={answers[i] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
                rows={4}
                placeholder="Type your answer…"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/40 outline-none focus:border-cyan-400/60 resize-y"
              />
            </div>
          ))}
          <button
            onClick={submit}
            disabled={loading === "score"}
            className="rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-neutral-900 px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50"
          >
            {loading === "score" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Score my answers
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 flex flex-col md:flex-row items-center gap-8 justify-around">
            <ScoreRing score={result.overall} label="Readiness" />
            <div className="text-center md:text-left">
              <div className="text-xs uppercase tracking-widest text-white/50 mb-1">Verdict</div>
              <div className="text-2xl font-semibold text-white">{result.verdict}</div>
              <div className="mt-2 text-sm text-white/60">Role: {role}</div>
            </div>
          </div>

          <div className="space-y-3">
            {result.per_question.map((p, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm text-white/70">Q{i + 1}. {p.question}</div>
                  <div className="text-xs text-white/60">{p.answer_score}/100</div>
                </div>
                <p className="text-sm text-white/80 mt-2 leading-relaxed">{p.feedback}</p>
                <div className="mt-3 rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-cyan-300 mb-1">Stronger answer</div>
                  <p className="text-sm text-white/90 leading-relaxed">{p.exemplar}</p>
                </div>
              </div>
            ))}
          </div>

          {result.top_tips?.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-sm font-medium text-white mb-3">Top tips</div>
              <ul className="list-disc list-inside space-y-1 text-sm text-white/80">
                {result.top_tips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}

          <button
            onClick={() => {
              setResult(null);
              setQuestions(null);
              setAnswers({});
            }}
            className="rounded-lg border border-white/15 text-white px-4 py-2 text-sm"
          >
            Try another role
          </button>
        </div>
      )}
    </AssessmentShell>
  );
}
