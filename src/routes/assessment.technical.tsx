import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AssessmentShell } from "@/components/AssessmentShell";
import { QuizRunner, type QuizQuestion } from "@/components/QuizRunner";
import { ScoreRing } from "@/components/ScoreRing";
import { saveAssessmentResult } from "@/lib/assessments.functions";

export const Route = createFileRoute("/assessment/technical")({
  head: () => ({
    meta: [
      { title: "Technical Skills Evaluation — CareerPilot AI" },
      { name: "description", content: "15 questions across web, data, algorithms, and databases to benchmark your technical level." },
      { property: "og:title", content: "Technical Skills Evaluation" },
      { property: "og:description", content: "Benchmark your engineering fundamentals across four topics." },
    ],
  }),
  component: Page,
});

type MCQ = QuizQuestion & { correctIndex: number; topic: string };

// value = 1 for correct, 0 for wrong — scoreQuiz sums them
const build = (
  id: string,
  topic: string,
  prompt: string,
  choices: string[],
  correctIndex: number,
): MCQ => ({
  id,
  topic,
  trait: topic,
  prompt,
  correctIndex,
  options: choices.map((c, i) => ({ label: c, value: i === correctIndex ? 1 : 0 })),
});

const Q: MCQ[] = [
  build("w1", "Web", "Which HTTP status means the resource was created?", ["200", "201", "204", "301"], 1),
  build("w2", "Web", "In React, what does useEffect's dependency array control?", ["Render order", "When the effect re-runs", "Component name", "Bundle size"], 1),
  build("w3", "Web", "What does CORS stand for?", ["Cross-Origin Resource Sharing", "Client-Origin Request Signing", "Cached Origin Resource Set", "Cross-Origin Route Setup"], 0),
  build("w4", "Web", "Which selector has the highest specificity?", ["#id", ".class", "tag", "* wildcard"], 0),
  build("d1", "Data", "Which SQL clause filters aggregated rows?", ["WHERE", "GROUP BY", "HAVING", "ORDER BY"], 2),
  build("d2", "Data", "A table without a primary key can still…", ["Enforce uniqueness automatically", "Be indexed", "Prevent duplicates by default", "Be a foreign key target"], 1),
  build("d3", "Data", "Normalization primarily reduces…", ["Read speed", "Data redundancy", "Column count", "Backup size"], 1),
  build("d4", "Data", "Which is NOT a NoSQL database?", ["MongoDB", "DynamoDB", "PostgreSQL", "Redis"], 2),
  build("a1", "Algorithms", "Big-O of binary search on a sorted array?", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], 1),
  build("a2", "Algorithms", "A stack is best described as…", ["FIFO", "LIFO", "Priority queue", "Random access"], 1),
  build("a3", "Algorithms", "Which sort is stable and worst-case O(n log n)?", ["Quicksort", "Heapsort", "Merge sort", "Insertion sort"], 2),
  build("a4", "Algorithms", "Time complexity of a hash map lookup, average case?", ["O(1)", "O(log n)", "O(n)", "O(n²)"], 0),
  build("s1", "Systems", "Which improves fault tolerance most?", ["Vertical scaling", "Replication", "Denormalization", "Bigger CPU"], 1),
  build("s2", "Systems", "A load balancer's primary job is to…", ["Encrypt traffic", "Distribute requests", "Cache responses", "Compile code"], 1),
  build("s3", "Systems", "Idempotent HTTP methods include…", ["POST", "PATCH", "PUT", "CONNECT"], 2),
];

function Page() {
  const save = useServerFn(saveAssessmentResult);
  const [result, setResult] = useState<{ score: number; byTopic: Record<string, { got: number; total: number }> } | null>(null);

  const complete = async (answers: Record<string, number>) => {
    const byTopic: Record<string, { got: number; total: number }> = {};
    let got = 0;
    for (const q of Q) {
      byTopic[q.topic] ??= { got: 0, total: 0 };
      byTopic[q.topic].total += 1;
      const correct = (answers[q.id] ?? 0) === 1;
      if (correct) {
        byTopic[q.topic].got += 1;
        got += 1;
      }
    }
    const score = Math.round((got / Q.length) * 100);
    setResult({ score, byTopic });
    try {
      await save({ data: { kind: "technical", score, details: { byTopic, answers } } });
      toast.success("Result saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <AssessmentShell
      eyebrow="Technical Skills Evaluation"
      title="Benchmark your engineering fundamentals."
      description="15 multiple-choice questions across web, data, algorithms, and systems."
      nextPath="/assessment/technical"
    >
      {!result ? (
        <QuizRunner questions={Q} onComplete={complete} submitLabel="Get my score" />
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 flex items-center gap-8 justify-center">
            <ScoreRing score={result.score} label="Score" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(result.byTopic).map(([topic, v]) => {
              const pct = Math.round((v.got / v.total) * 100);
              return (
                <div key={topic} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">{topic}</span>
                    <span className="text-white/60">{v.got}/{v.total}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AssessmentShell>
  );
}
