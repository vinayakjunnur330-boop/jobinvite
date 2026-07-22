import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/scholarships/need")({
  head: () => ({
    meta: [
      { title: "Need-Based Grants — CareerPilot AI" },
      { name: "description", content: "Financial aid for students who need support to pursue their goals." },
      { property: "og:title", content: "Need-Based Grants — CareerPilot AI" },
      { property: "og:description", content: "Financial aid for students who need support to pursue their goals." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Scholarships"
      title="Need-Based Grants"
      description="Financial aid for students who need support to pursue their goals."
      parentLabel="Scholarships"
      parentTo="/scholarships"
    />
  );
}
