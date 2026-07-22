import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/internships/startup")({
  head: () => ({
    meta: [
      { title: "Tech & Startup Roles — CareerPilot AI" },
      { name: "description", content: "Ship real product at fast-moving startups and tech companies." },
      { property: "og:title", content: "Tech & Startup Roles — CareerPilot AI" },
      { property: "og:description", content: "Ship real product at fast-moving startups and tech companies." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Internships"
      title="Tech & Startup Roles"
      description="Ship real product at fast-moving startups and tech companies."
      parentLabel="Internships"
      parentTo="/internships"
    />
  );
}
