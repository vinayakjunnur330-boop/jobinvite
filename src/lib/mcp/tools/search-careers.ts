import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { careers } from "@/lib/careers";

export default defineTool({
  name: "search_careers",
  title: "Search careers",
  description:
    "Search CareerPilot AI's career catalog by free-text query and/or category (domain). Returns matching careers with match score, salary range, growth, demand, and key skills.",
  inputSchema: {
    query: z.string().trim().max(120).optional().describe("Free-text search over title, skills, industry, or summary."),
    category: z.string().trim().max(60).optional().describe("Optional domain to filter by (e.g. Technology, Medical)."),
    limit: z.number().int().min(1).max(50).optional().describe("Maximum results to return. Default 10."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, category, limit }) => {
    const q = query?.toLowerCase() ?? "";
    const cat = category?.toLowerCase() ?? "";
    const matches = careers.filter((c) => {
      if (cat && c.category.toLowerCase() !== cat && c.industry.toLowerCase() !== cat) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q))
      );
    });
    const results = matches.slice(0, limit ?? 10);
    const text = results.length
      ? results.map((c) => `• ${c.title} (${c.slug}) — ${c.salary}, ${c.demand} demand`).join("\n")
      : "No careers matched.";
    return { content: [{ type: "text", text }], structuredContent: { results } };
  },
});
