import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/dashboard/applications")({
  head: () => ({
    meta: [
      { title: "Application Tracker — CareerPilot AI" },
      { name: "description", content: "Track every application, interview, and follow-up in one pipeline." },
      { property: "og:title", content: "Application Tracker — CareerPilot AI" },
      { property: "og:description", content: "Track every application, interview, and follow-up in one pipeline." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Dashboard"
      title="Application Tracker"
      description="Track every application, interview, and follow-up in one pipeline."
      parentLabel="Dashboard"
      parentTo="/dashboard"
    />
  );
}
