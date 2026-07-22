import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/mentors/book")({
  head: () => ({
    meta: [
      { title: "Book a 1:1 Session — CareerPilot AI" },
      { name: "description", content: "Reserve a private session that fits your schedule and goals." },
      { property: "og:title", content: "Book a 1:1 Session — CareerPilot AI" },
      { property: "og:description", content: "Reserve a private session that fits your schedule and goals." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Mentors"
      title="Book a 1:1 Session"
      description="Reserve a private session that fits your schedule and goals."
      parentLabel="Mentors"
      parentTo="/mentors"
    />
  );
}
