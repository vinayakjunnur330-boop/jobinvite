import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import { AssessmentShell } from "@/components/AssessmentShell";
import { QuizRunner, type QuizQuestion } from "@/components/QuizRunner";
import { ScoreRing } from "@/components/ScoreRing";
import { saveAssessmentResult } from "@/lib/assessments.functions";

export const Route = createFileRoute("/assessment/aptitude")({
  head: () => ({
    meta: [
      { title: "Aptitude & Logic Quiz — CareerPilot AI" },
      { name: "description", content: "A timed 10-question quiz covering numerical, verbal, and logical reasoning with a percentile rank." },
      { property: "og:title", content: "Aptitude & Logic Quiz" },
      { property: "og:description", content: "Timed reasoning quiz with an instant percentile rank." },
    ],
  }),
  component: Page,
});

type MCQ = QuizQuestion & { correctIndex: number; kind: string };
const b = (id: string, kind: string, prompt: string, choices: string[], correctIndex: number): MCQ => ({
  id,
  kind,
  trait: kind,
  prompt,
  correctIndex,
  options: choices.map((c, i) => ({ label: c, value: i === correctIndex ? 1 : 0 })),
});

const Q: MCQ[] = [
  b("n1", "Numerical", "If 3 workers finish a job in 6 days, how many days for 6 workers?", ["2", "3", "4", "5"], 1),
  b("n2", "Numerical", "20% of 250 = ?", ["25", "50", "75", "100"], 1),
  b("n3", "Numerical", "Next in sequence: 2, 6, 12, 20, ?", ["24", "28", "30", "32"], 2),
  b("v1", "Verbal", "Choose the closest synonym of 'meticulous'.", ["Careless", "Careful", "Chaotic", "Casual"], 1),
  b("v2", "Verbal", "'Ephemeral' most nearly means…", ["Lasting", "Sudden", "Short-lived", "Ancient"], 2),
  b("v3", "Verbal", "Antonym of 'benevolent'?", ["Kind", "Cruel", "Generous", "Modest"], 1),
  b("l1", "Logical", "All bloops are razzies. Some razzies are lazzies. Therefore…", ["All bloops are lazzies", "Some bloops are lazzies", "No bloops are lazzies", "None of the above must be true"], 3),
  b("l2", "Logical", "If it rains, the game is cancelled. The game happened. So…", ["It rained", "It did not rain", "It might have rained", "The game was rescheduled"], 1),
  b("l3", "Logical", "Odd one out: cube, sphere, pyramid, square", ["cube", "sphere", "pyramid", "square"], 3),
  b("l4", "Logical", "If A > B and B > C, then…", ["A = C", "A < C", "A > C", "Can't tell"], 2),
];

const TIME_LIMIT = 5 * 60; // seconds

function Page() {
  const save = useServerFn(saveAssessmentResult);
  const [result, setResult] = useState<{ score: number; percentile: number } | null>(null);
  const [remaining, setRemaining] = useState(TIME_LIMIT);
  const startedRef = useRef(false);

  useEffect(() => {
    if (result) return;
    startedRef.current = true;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [result]);

  useEffect(() => {
    if (remaining === 0 && !result) {
      // Auto-submit with whatever they had — treat unanswered as wrong.
      void complete({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  const complete = async (answers: Record<string, number>) => {
    let got = 0;
    for (const q of Q) if ((answers[q.id] ?? 0) === 1) got += 1;
    const score = Math.round((got / Q.length) * 100);
    // Rough percentile curve — makes the result feel meaningful.
    const percentile = Math.min(99, Math.round(Math.pow(score / 100, 1.2) * 99));
    setResult({ score, percentile });
    try {
      await save({ data: { kind: "aptitude", score, details: { percentile, answers } } });
      toast.success("Result saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <AssessmentShell
      eyebrow="Aptitude & Logic Quiz"
      title="Ten problems. Five minutes. One percentile."
      description="A quick timed mix of numerical, verbal, and logical reasoning."
      nextPath="/assessment/aptitude"
    >
      {!result && (
        <div className="mb-4 flex items-center gap-2 text-sm text-white/70">
          <Clock className="size-4 text-cyan-300" />
          Time remaining: <span className="font-mono text-white">{mm}:{ss}</span>
        </div>
      )}
      {!result ? (
        <QuizRunner questions={Q} onComplete={complete} submitLabel="Submit" />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 flex flex-col md:flex-row items-center gap-8 justify-around">
          <ScoreRing score={result.score} label="Score" />
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-white/50 mb-1">Percentile</div>
            <div className="text-4xl font-semibold text-white">{result.percentile}<span className="text-lg text-white/50">th</span></div>
            <p className="mt-2 text-sm text-white/60 max-w-xs">
              You scored better than roughly {result.percentile}% of test-takers.
            </p>
          </div>
        </div>
      )}
    </AssessmentShell>
  );
}
