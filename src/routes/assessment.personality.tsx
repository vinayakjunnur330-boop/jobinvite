import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/assessment/personality")({
  head: () => ({
    meta: [
      { title: "Personality & Trait Test — CareerPilot AI" },
      { name: "description", content: "Discover the traits that shape how you work, lead, and collaborate." },
      { property: "og:title", content: "Personality & Trait Test — CareerPilot AI" },
      { property: "og:description", content: "Discover the traits that shape how you work, lead, and collaborate." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Assessment"
      title="Personality & Trait Test"
      description="Discover the traits that shape how you work, lead, and collaborate."
      parentLabel="Assessment"
      parentTo="/assessment"
    />
  );
}
