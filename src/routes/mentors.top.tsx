import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/mentors/top")({
  head: () => ({
    meta: [
      { title: "Top Rated Mentors — CareerPilot AI" },
      { name: "description", content: "Meet the mentors our community trusts and rates the highest." },
      { property: "og:title", content: "Top Rated Mentors — CareerPilot AI" },
      { property: "og:description", content: "Meet the mentors our community trusts and rates the highest." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Mentors"
      title="Top Rated Mentors"
      description="Meet the mentors our community trusts and rates the highest."
      parentLabel="Mentors"
      parentTo="/mentors"
    />
  );
}
