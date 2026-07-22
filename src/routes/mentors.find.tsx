import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/mentors/find")({
  head: () => ({
    meta: [
      { title: "Find a Mentor — CareerPilot AI" },
      { name: "description", content: "Match with mentors by industry, role, and career stage." },
      { property: "og:title", content: "Find a Mentor — CareerPilot AI" },
      { property: "og:description", content: "Match with mentors by industry, role, and career stage." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Mentors"
      title="Find a Mentor"
      description="Match with mentors by industry, role, and career stage."
      parentLabel="Mentors"
      parentTo="/mentors"
    />
  );
}
