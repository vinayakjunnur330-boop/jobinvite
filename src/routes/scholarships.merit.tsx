import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/scholarships/merit")({
  head: () => ({
    meta: [
      { title: "Merit-Based Awards — CareerPilot AI" },
      { name: "description", content: "Scholarships that reward academic and professional excellence." },
      { property: "og:title", content: "Merit-Based Awards — CareerPilot AI" },
      { property: "og:description", content: "Scholarships that reward academic and professional excellence." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Scholarships"
      title="Merit-Based Awards"
      description="Scholarships that reward academic and professional excellence."
      parentLabel="Scholarships"
      parentTo="/scholarships"
    />
  );
}
