import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/mentors/become")({
  head: () => ({
    meta: [
      { title: "Become a Mentor — CareerPilot AI" },
      { name: "description", content: "Share your expertise, grow your brand, and earn as a CareerPilot mentor." },
      { property: "og:title", content: "Become a Mentor — CareerPilot AI" },
      { property: "og:description", content: "Share your expertise, grow your brand, and earn as a CareerPilot mentor." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Mentors"
      title="Become a Mentor"
      description="Share your expertise, grow your brand, and earn as a CareerPilot mentor."
      parentLabel="Mentors"
      parentTo="/mentors"
    />
  );
}
