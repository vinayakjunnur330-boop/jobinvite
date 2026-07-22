import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/assessment/interview")({
  head: () => ({
    meta: [
      { title: "Mock Interview Readiness — CareerPilot AI" },
      { name: "description", content: "Practice with AI mock interviews tuned to your target roles." },
      { property: "og:title", content: "Mock Interview Readiness — CareerPilot AI" },
      { property: "og:description", content: "Practice with AI mock interviews tuned to your target roles." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Assessment"
      title="Mock Interview Readiness"
      description="Practice with AI mock interviews tuned to your target roles."
      parentLabel="Assessment"
      parentTo="/assessment"
    />
  );
}
