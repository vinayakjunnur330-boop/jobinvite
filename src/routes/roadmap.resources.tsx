import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/roadmap/resources")({
  head: () => ({
    meta: [
      { title: "Resource Library — CareerPilot AI" },
      { name: "description", content: "Hand-picked books, courses, and tools for every roadmap stage." },
      { property: "og:title", content: "Resource Library — CareerPilot AI" },
      { property: "og:description", content: "Hand-picked books, courses, and tools for every roadmap stage." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Roadmap"
      title="Resource Library"
      description="Hand-picked books, courses, and tools for every roadmap stage."
      parentLabel="Roadmap"
      parentTo="/roadmap"
    />
  );
}
