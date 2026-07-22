import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/internships/corporate")({
  head: () => ({
    meta: [
      { title: "Corporate Programs — CareerPilot AI" },
      { name: "description", content: "Structured internship programs at leading global companies." },
      { property: "og:title", content: "Corporate Programs — CareerPilot AI" },
      { property: "og:description", content: "Structured internship programs at leading global companies." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Internships"
      title="Corporate Programs"
      description="Structured internship programs at leading global companies."
      parentLabel="Internships"
      parentTo="/internships"
    />
  );
}
