import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/dashboard/saved")({
  head: () => ({
    meta: [
      { title: "Saved Jobs & Favorites — CareerPilot AI" },
      { name: "description", content: "All the roles, careers, and resources you starred, organized for action." },
      { property: "og:title", content: "Saved Jobs & Favorites — CareerPilot AI" },
      { property: "og:description", content: "All the roles, careers, and resources you starred, organized for action." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Dashboard"
      title="Saved Jobs & Favorites"
      description="All the roles, careers, and resources you starred, organized for action."
      parentLabel="Dashboard"
      parentTo="/dashboard"
    />
  );
}
