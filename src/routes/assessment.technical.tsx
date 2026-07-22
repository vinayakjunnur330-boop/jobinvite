import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/assessment/technical")({
  head: () => ({
    meta: [
      { title: "Technical Skills Evaluation — CareerPilot AI" },
      { name: "description", content: "Benchmark your coding, tooling, and domain skills against role expectations." },
      { property: "og:title", content: "Technical Skills Evaluation — CareerPilot AI" },
      { property: "og:description", content: "Benchmark your coding, tooling, and domain skills against role expectations." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Assessment"
      title="Technical Skills Evaluation"
      description="Benchmark your coding, tooling, and domain skills against role expectations."
      parentLabel="Assessment"
      parentTo="/assessment"
    />
  );
}
