import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/dashboard/analytics")({
  head: () => ({
    meta: [
      { title: "Progress & Analytics — CareerPilot AI" },
      { name: "description", content: "Visualize your growth, streaks, and skill velocity over time." },
      { property: "og:title", content: "Progress & Analytics — CareerPilot AI" },
      { property: "og:description", content: "Visualize your growth, streaks, and skill velocity over time." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Dashboard"
      title="Progress & Analytics"
      description="Visualize your growth, streaks, and skill velocity over time."
      parentLabel="Dashboard"
      parentTo="/dashboard"
    />
  );
}
