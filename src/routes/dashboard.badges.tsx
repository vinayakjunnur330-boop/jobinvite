import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/dashboard/badges")({
  head: () => ({
    meta: [
      { title: "Skill Badges — CareerPilot AI" },
      { name: "description", content: "Earn verifiable badges as you complete assessments and milestones." },
      { property: "og:title", content: "Skill Badges — CareerPilot AI" },
      { property: "og:description", content: "Earn verifiable badges as you complete assessments and milestones." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Dashboard"
      title="Skill Badges"
      description="Earn verifiable badges as you complete assessments and milestones."
      parentLabel="Dashboard"
      parentTo="/dashboard"
    />
  );
}
