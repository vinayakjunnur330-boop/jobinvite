import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/roadmap/business")({
  head: () => ({
    meta: [
      { title: "Business & Management Paths — CareerPilot AI" },
      { name: "description", content: "Grow from analyst to executive with structured learning tracks." },
      { property: "og:title", content: "Business & Management Paths — CareerPilot AI" },
      { property: "og:description", content: "Grow from analyst to executive with structured learning tracks." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Roadmap"
      title="Business & Management Paths"
      description="Grow from analyst to executive with structured learning tracks."
      parentLabel="Roadmap"
      parentTo="/roadmap"
    />
  );
}
