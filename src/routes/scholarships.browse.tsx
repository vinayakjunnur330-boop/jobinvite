import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/scholarships/browse")({
  head: () => ({
    meta: [
      { title: "Browse All Scholarships — CareerPilot AI" },
      { name: "description", content: "Explore every scholarship in our database with smart filters." },
      { property: "og:title", content: "Browse All Scholarships — CareerPilot AI" },
      { property: "og:description", content: "Explore every scholarship in our database with smart filters." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Scholarships"
      title="Browse All Scholarships"
      description="Explore every scholarship in our database with smart filters."
      parentLabel="Scholarships"
      parentTo="/scholarships"
    />
  );
}
