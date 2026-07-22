import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Account Settings — CareerPilot AI" },
      { name: "description", content: "Manage security, notifications, and preferences." },
      { property: "og:title", content: "Account Settings — CareerPilot AI" },
      { property: "og:description", content: "Manage security, notifications, and preferences." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Dashboard"
      title="Account Settings"
      description="Manage security, notifications, and preferences."
      parentLabel="Dashboard"
      parentTo="/dashboard"
    />
  );
}
