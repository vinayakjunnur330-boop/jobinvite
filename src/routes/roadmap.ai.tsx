import { createFileRoute } from "@tanstack/react-router";
import { SubPageShell } from "@/components/SubPageShell";

export const Route = createFileRoute("/roadmap/ai")({
  head: () => ({
    meta: [
      { title: "AI & Machine Learning Roadmap — CareerPilot AI" },
      { name: "description", content: "The full arc from Python foundations to production-grade AI systems." },
      { property: "og:title", content: "AI & Machine Learning Roadmap — CareerPilot AI" },
      { property: "og:description", content: "The full arc from Python foundations to production-grade AI systems." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SubPageShell
      eyebrow="Roadmap"
      title="AI & Machine Learning Roadmap"
      description="The full arc from Python foundations to production-grade AI systems."
      parentLabel="Roadmap"
      parentTo="/roadmap"
    />
  );
}
