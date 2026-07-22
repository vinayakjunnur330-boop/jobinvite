import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/internships/summer")({
  head: () => ({
    meta: [
      { title: "Summer Internships — CareerPilot AI" },
      { name: "description", content: "The best summer cohorts across tech, business, and creative fields." },
      { property: "og:title", content: "Summer Internships — CareerPilot AI" },
      { property: "og:description", content: "The best summer cohorts across tech, business, and creative fields." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Internships"
      title="Summer Internships"
      description="The best summer cohorts across tech, business, and creative fields."
      parentLabel="Internships"
      parentTo="/internships"
    />
  );
}
