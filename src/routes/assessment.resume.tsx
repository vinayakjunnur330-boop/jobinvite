import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/assessment/resume")({
  head: () => ({
    meta: [
      { title: "AI Resume Grader — CareerPilot AI" },
      { name: "description", content: "Get instant, recruiter-grade feedback and rewrites for your resume." },
      { property: "og:title", content: "AI Resume Grader — CareerPilot AI" },
      { property: "og:description", content: "Get instant, recruiter-grade feedback and rewrites for your resume." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Assessment"
      title="AI Resume Grader"
      description="Get instant, recruiter-grade feedback and rewrites for your resume."
      parentLabel="Assessment"
      parentTo="/assessment"
    />
  );
}
