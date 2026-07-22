import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/roadmap/creative")({
  head: () => ({
    meta: [
      { title: "Creative & Design Paths — CareerPilot AI" },
      { name: "description", content: "Design, motion, product, and content roadmaps built for creatives." },
      { property: "og:title", content: "Creative & Design Paths — CareerPilot AI" },
      { property: "og:description", content: "Design, motion, product, and content roadmaps built for creatives." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Roadmap"
      title="Creative & Design Paths"
      description="Design, motion, product, and content roadmaps built for creatives."
      parentLabel="Roadmap"
      parentTo="/roadmap"
    />
  );
}
