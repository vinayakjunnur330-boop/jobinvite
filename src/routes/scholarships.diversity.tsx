import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/scholarships/diversity")({
  head: () => ({
    meta: [
      { title: "Diversity Awards — CareerPilot AI" },
      { name: "description", content: "Programs supporting underrepresented voices in every field." },
      { property: "og:title", content: "Diversity Awards — CareerPilot AI" },
      { property: "og:description", content: "Programs supporting underrepresented voices in every field." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Scholarships"
      title="Diversity Awards"
      description="Programs supporting underrepresented voices in every field."
      parentLabel="Scholarships"
      parentTo="/scholarships"
    />
  );
}
