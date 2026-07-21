import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { domains } from "@/lib/careers";

export default defineTool({
  name: "list_domains",
  title: "List career domains",
  description: "List all career domains (categories) CareerPilot AI covers, e.g. Technology, Medical, Finance.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: domains.join(", ") }],
    structuredContent: { domains },
  }),
});
