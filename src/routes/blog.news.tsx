import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/blog/news")({
  head: () => ({
    meta: [
      { title: "Industry News & Trends — CareerPilot AI" },
      { name: "description", content: "The signals shaping hiring, skills, and salaries across industries." },
      { property: "og:title", content: "Industry News & Trends — CareerPilot AI" },
      { property: "og:description", content: "The signals shaping hiring, skills, and salaries across industries." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Blog"
      title="Industry News & Trends"
      description="The signals shaping hiring, skills, and salaries across industries."
      parentLabel="Blog"
      parentTo="/blog"
    />
  );
}
