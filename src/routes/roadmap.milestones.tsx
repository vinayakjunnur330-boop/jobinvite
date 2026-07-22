import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/roadmap/milestones")({
  head: () => ({
    meta: [
      { title: "Milestone Tracker — CareerPilot AI" },
      { name: "description", content: "Set milestones, track streaks, and celebrate every level up." },
      { property: "og:title", content: "Milestone Tracker — CareerPilot AI" },
      { property: "og:description", content: "Set milestones, track streaks, and celebrate every level up." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Roadmap"
      title="Milestone Tracker"
      description="Set milestones, track streaks, and celebrate every level up."
      parentLabel="Roadmap"
      parentTo="/roadmap"
    />
  );
}
