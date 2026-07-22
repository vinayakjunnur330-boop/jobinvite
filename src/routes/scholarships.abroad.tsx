import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/scholarships/abroad")({
  head: () => ({
    meta: [
      { title: "Study Abroad — CareerPilot AI" },
      { name: "description", content: "International scholarships for global learning journeys." },
      { property: "og:title", content: "Study Abroad — CareerPilot AI" },
      { property: "og:description", content: "International scholarships for global learning journeys." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Scholarships"
      title="Study Abroad"
      description="International scholarships for global learning journeys."
      parentLabel="Scholarships"
      parentTo="/scholarships"
    />
  );
}
