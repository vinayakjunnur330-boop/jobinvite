import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/blog/stories")({
  head: () => ({
    meta: [
      { title: "Success Stories — CareerPilot AI" },
      { name: "description", content: "Real journeys from ambitious start to breakthrough offer." },
      { property: "og:title", content: "Success Stories — CareerPilot AI" },
      { property: "og:description", content: "Real journeys from ambitious start to breakthrough offer." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Blog"
      title="Success Stories"
      description="Real journeys from ambitious start to breakthrough offer."
      parentLabel="Blog"
      parentTo="/blog"
    />
  );
}
