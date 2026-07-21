import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { careers } from "@/lib/careers";

function trendFor(demand: string, growth: string) {
  const growthPct = parseInt(growth.replace(/[^0-9-]/g, "")) || 0;
  const outlook =
    demand === "Extreme" ? "Explosive 5-year expansion; hiring outpaces supply."
    : demand === "High" ? "Sustained growth; healthy talent market."
    : "Steady but competitive; specialization wins.";
  const futureRoles = growthPct >= 20
    ? ["AI-augmented specialist", "Automation lead", "Cross-domain strategist"]
    : ["Senior IC", "Team lead", "Consultant"];
  return { growthPct, outlook, futureRoles };
}

export default defineTool({
  name: "get_job_trends",
  title: "Get job trends & future demand",
  description: "Return current hiring trends, growth outlook, and future industry demand for one or more careers by slug.",
  inputSchema: {
    slugs: z.array(z.string().min(1).max(80)).min(1).max(10).describe("Career slugs to analyze."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slugs }) => {
    const results = slugs.map((slug) => {
      const c = careers.find((x) => x.slug === slug);
      if (!c) return { slug, error: "Not found" };
      const t = trendFor(c.demand, c.growth);
      return {
        slug: c.slug,
        title: c.title,
        industry: c.industry,
        demand: c.demand,
        growth: c.growth,
        growthPct: t.growthPct,
        salary: c.salary,
        outlook: t.outlook,
        emergingRoles: t.futureRoles,
        keySkills: c.skills,
      };
    });
    const text = results
      .map((r) =>
        "error" in r
          ? `• ${r.slug}: not found`
          : `• ${r.title} — ${r.demand} demand, ${r.growth}\n  ${r.outlook}\n  Emerging: ${r.emergingRoles.join(", ")}`,
      )
      .join("\n\n");
    return { content: [{ type: "text", text }], structuredContent: { trends: results } };
  },
});
