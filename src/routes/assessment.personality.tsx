import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AssessmentShell } from "@/components/AssessmentShell";
import { QuizRunner, scoreByTrait, scoreQuiz, type QuizQuestion } from "@/components/QuizRunner";
import { ScoreRing } from "@/components/ScoreRing";
import { saveAssessmentResult } from "@/lib/assessments.functions";

export const Route = createFileRoute("/assessment/personality")({
  head: () => ({
    meta: [
      { title: "Personality & Trait Test — CareerPilot AI" },
      { name: "description", content: "A 20-question Big Five personality test that maps your traits to careers you'll thrive in." },
      { property: "og:title", content: "Personality & Trait Test" },
      { property: "og:description", content: "Big Five personality assessment with career-fit trait breakdown." },
    ],
  }),
  component: Page,
});

const AGREE: { label: string; value: number }[] = [
  { label: "Strongly disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly agree", value: 5 },
];

const QUESTIONS: QuizQuestion[] = [
  { id: "o1", trait: "Openness", prompt: "I enjoy exploring new ideas and concepts.", options: AGREE },
  { id: "o2", trait: "Openness", prompt: "I have a vivid imagination.", options: AGREE },
  { id: "o3", trait: "Openness", prompt: "I like to try unfamiliar experiences.", options: AGREE },
  { id: "o4", trait: "Openness", prompt: "I appreciate art, music, or design.", options: AGREE },
  { id: "c1", trait: "Conscientiousness", prompt: "I finish what I start.", options: AGREE },
  { id: "c2", trait: "Conscientiousness", prompt: "I keep my workspace organized.", options: AGREE },
  { id: "c3", trait: "Conscientiousness", prompt: "I plan ahead instead of improvising.", options: AGREE },
  { id: "c4", trait: "Conscientiousness", prompt: "I follow through on commitments.", options: AGREE },
  { id: "e1", trait: "Extraversion", prompt: "I feel energized around groups of people.", options: AGREE },
  { id: "e2", trait: "Extraversion", prompt: "I speak up in meetings.", options: AGREE },
  { id: "e3", trait: "Extraversion", prompt: "I enjoy meeting new people.", options: AGREE },
  { id: "e4", trait: "Extraversion", prompt: "I tend to take charge of situations.", options: AGREE },
  { id: "a1", trait: "Agreeableness", prompt: "I sympathize with others' feelings.", options: AGREE },
  { id: "a2", trait: "Agreeableness", prompt: "I trust people until they give me reason not to.", options: AGREE },
  { id: "a3", trait: "Agreeableness", prompt: "I go out of my way to help others.", options: AGREE },
  { id: "a4", trait: "Agreeableness", prompt: "I avoid conflict when possible.", options: AGREE },
  { id: "n1", trait: "Stability", prompt: "I stay calm under pressure.", options: AGREE },
  { id: "n2", trait: "Stability", prompt: "I recover quickly from setbacks.", options: AGREE },
  { id: "n3", trait: "Stability", prompt: "I rarely feel overwhelmed by my workload.", options: AGREE },
  { id: "n4", trait: "Stability", prompt: "I sleep well even before big events.", options: AGREE },
];

const CAREER_HINTS: Record<string, string[]> = {
  Openness: ["Product Designer", "Research Scientist", "Creative Director"],
  Conscientiousness: ["Project Manager", "Auditor", "Software Engineer"],
  Extraversion: ["Sales Executive", "Community Manager", "Teacher"],
  Agreeableness: ["UX Researcher", "HR Business Partner", "Therapist"],
  Stability: ["ER Physician", "Pilot", "SRE / DevOps"],
};

function Page() {
  const save = useServerFn(saveAssessmentResult);
  const [result, setResult] = useState<{ score: number; traits: Record<string, number> } | null>(null);

  const complete = async (answers: Record<string, number>) => {
    const score = scoreQuiz(QUESTIONS, answers);
    const traits = scoreByTrait(QUESTIONS, answers);
    setResult({ score, traits });
    try {
      await save({ data: { kind: "personality", score, details: { traits, answers } } });
      toast.success("Result saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <AssessmentShell
      eyebrow="Personality & Trait Test"
      title="Discover the shape of your work personality."
      description="20 quick statements. Rate how much each sounds like you. We map your Big Five profile to careers you're wired for."
      nextPath="/assessment/personality"
    >
      {!result ? (
        <QuizRunner questions={QUESTIONS} onComplete={complete} submitLabel="See my profile" />
      ) : (
        <ResultView result={result} />
      )}
    </AssessmentShell>
  );
}

function ResultView({ result }: { result: { score: number; traits: Record<string, number> } }) {
  const top = Object.entries(result.traits).sort((a, b) => b[1] - a[1])[0]?.[0];
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
        <ScoreRing score={result.score} label="Overall" />
        <div className="flex-1">
          <div className="text-xs uppercase tracking-widest text-white/50 mb-1">Dominant trait</div>
          <div className="text-2xl font-semibold text-white">{top}</div>
          <p className="mt-2 text-sm text-white/70">
            Careers well-suited: {CAREER_HINTS[top ?? ""]?.join(" · ") || "Explore all domains"}
          </p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(result.traits).map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white">{k}</span>
              <span className="text-white/60">{v}/100</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500" style={{ width: `${v}%` }} />
            </div>
            <p className="mt-2 text-xs text-white/60">{CAREER_HINTS[k]?.slice(0, 2).join(" · ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
