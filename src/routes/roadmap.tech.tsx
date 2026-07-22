import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/roadmap/tech")({
  head: () => ({
    meta: [
      { title: "Tech & Engineering Paths — CareerPilot AI" },
      { name: "description", content: "Step-by-step roadmaps for software, data, cloud, and security careers." },
      { property: "og:title", content: "Tech & Engineering Paths — CareerPilot AI" },
      { property: "og:description", content: "Step-by-step roadmaps for software, data, cloud, and security careers." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Roadmap"
      title="Tech & Engineering Paths"
      description="Step-by-step roadmaps for software, data, cloud, and security careers."
      parentLabel="Roadmap"
      parentTo="/roadmap"
    />
  );
}
