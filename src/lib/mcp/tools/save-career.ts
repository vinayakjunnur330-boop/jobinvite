import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { careers } from "@/lib/careers";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "save_career",
  title: "Save a career",
  description: "Save a career from the CareerPilot AI catalog to the signed-in user's dashboard.",
  inputSchema: {
    slug: z.string().trim().min(1).max(80).describe("Career slug from search_careers or get_career."),
    notes: z.string().trim().max(500).optional().describe("Optional personal note about why this career interests you."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug, notes }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const career = careers.find((c) => c.slug === slug);
    if (!career) {
      return { content: [{ type: "text", text: `No career found with slug "${slug}".` }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("saved_careers")
      .upsert(
        {
          user_id: ctx.getUserId(),
          career_slug: career.slug,
          title: career.title,
          industry: career.industry,
          notes: notes ?? null,
        },
        { onConflict: "user_id,career_slug" },
      )
      .select()
      .maybeSingle();
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Saved "${career.title}" to your dashboard.` }],
      structuredContent: { saved: data },
    };
  },
});
