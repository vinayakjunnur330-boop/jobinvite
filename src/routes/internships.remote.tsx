import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/internships/remote")({
  head: () => ({
    meta: [
      { title: "Remote Roles — CareerPilot AI" },
      { name: "description", content: "Fully remote internships you can join from anywhere." },
      { property: "og:title", content: "Remote Roles — CareerPilot AI" },
      { property: "og:description", content: "Fully remote internships you can join from anywhere." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Internships"
      title="Remote Roles"
      description="Fully remote internships you can join from anywhere."
      parentLabel="Internships"
      parentTo="/internships"
    />
  );
}
