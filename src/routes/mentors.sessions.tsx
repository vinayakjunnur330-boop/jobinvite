import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/mentors/sessions")({
  head: () => ({
    meta: [
      { title: "My Sessions — CareerPilot AI" },
      { name: "description", content: "Upcoming and past sessions, notes, and action items in one place." },
      { property: "og:title", content: "My Sessions — CareerPilot AI" },
      { property: "og:description", content: "Upcoming and past sessions, notes, and action items in one place." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Mentors"
      title="My Sessions"
      description="Upcoming and past sessions, notes, and action items in one place."
      parentLabel="Mentors"
      parentTo="/mentors"
    />
  );
}
