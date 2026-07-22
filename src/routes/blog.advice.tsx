import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/blog/advice")({
  head: () => ({
    meta: [
      { title: "Career Advice — CareerPilot AI" },
      { name: "description", content: "Timeless advice from mentors and operators who have been there." },
      { property: "og:title", content: "Career Advice — CareerPilot AI" },
      { property: "og:description", content: "Timeless advice from mentors and operators who have been there." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Blog"
      title="Career Advice"
      description="Timeless advice from mentors and operators who have been there."
      parentLabel="Blog"
      parentTo="/blog"
    />
  );
}
