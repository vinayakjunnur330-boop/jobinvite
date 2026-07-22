import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/internships/prep")({
  head: () => ({
    meta: [
      { title: "Interview Prep — CareerPilot AI" },
      { name: "description", content: "Case studies, coding rounds, and behavioral prep for internship offers." },
      { property: "og:title", content: "Interview Prep — CareerPilot AI" },
      { property: "og:description", content: "Case studies, coding rounds, and behavioral prep for internship offers." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Internships"
      title="Interview Prep"
      description="Case studies, coding rounds, and behavioral prep for internship offers."
      parentLabel="Internships"
      parentTo="/internships"
    />
  );
}
