import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/assessment/aptitude")({
  head: () => ({
    meta: [
      { title: "Aptitude & Logic Quiz — CareerPilot AI" },
      { name: "description", content: "Sharpen numerical, verbal, and abstract reasoning with adaptive challenges." },
      { property: "og:title", content: "Aptitude & Logic Quiz — CareerPilot AI" },
      { property: "og:description", content: "Sharpen numerical, verbal, and abstract reasoning with adaptive challenges." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Assessment"
      title="Aptitude & Logic Quiz"
      description="Sharpen numerical, verbal, and abstract reasoning with adaptive challenges."
      parentLabel="Assessment"
      parentTo="/assessment"
    />
  );
}
