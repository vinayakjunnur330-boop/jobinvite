import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/assessment/career-fit")({
  head: () => ({
    meta: [
      { title: "Career Fit Analyzer — CareerPilot AI" },
      { name: "description", content: "Match your interests, strengths, and values to future-proof careers." },
      { property: "og:title", content: "Career Fit Analyzer — CareerPilot AI" },
      { property: "og:description", content: "Match your interests, strengths, and values to future-proof careers." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Assessment"
      title="Career Fit Analyzer"
      description="Match your interests, strengths, and values to future-proof careers."
      parentLabel="Assessment"
      parentTo="/assessment"
    />
  );
}
