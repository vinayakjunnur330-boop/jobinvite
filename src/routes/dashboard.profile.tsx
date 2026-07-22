import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({
    meta: [
      { title: "My Profile & Portfolio — CareerPilot AI" },
      { name: "description", content: "Curate a portfolio that shows the best of your work and story." },
      { property: "og:title", content: "My Profile & Portfolio — CareerPilot AI" },
      { property: "og:description", content: "Curate a portfolio that shows the best of your work and story." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Dashboard"
      title="My Profile & Portfolio"
      description="Curate a portfolio that shows the best of your work and story."
      parentLabel="Dashboard"
      parentTo="/dashboard"
    />
  );
}
