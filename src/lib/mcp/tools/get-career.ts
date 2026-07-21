import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { careers } from "@/lib/careers";

export default defineTool({
  name: "get_career",
  title: "Get career details",
  description: "Get the full details of a single career by its slug (e.g. 'ai-engineer').",
  inputSchema: {
    slug: z.string().trim().min(1).max(80).describe("Career slug returned by search_careers."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ slug }) => {
    const career = careers.find((c) => c.slug === slug);
    if (!career) {
      return { content: [{ type: "text", text: `No career found with slug "${slug}".` }], isError: true };
    }
    return {
      content: [
        {
          type: "text",
          text: `${career.title}\n${career.summary}\nSalary: ${career.salary} · Growth: ${career.growth} · Demand: ${career.demand}\nSkills: ${career.skills.join(", ")}`,
        },
      ],
      structuredContent: { career },
    };
  },
});
