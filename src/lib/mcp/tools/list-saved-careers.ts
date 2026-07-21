import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_saved_careers",
  title: "List my saved careers",
  description: "List the careers the signed-in CareerPilot AI user has saved to their dashboard.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("saved_careers")
      .select("career_slug, title, industry, notes, created_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false });
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    const rows = data ?? [];
    const text = rows.length
      ? rows.map((r) => `• ${r.title} (${r.career_slug})${r.notes ? ` — ${r.notes}` : ""}`).join("\n")
      : "You haven't saved any careers yet.";
    return { content: [{ type: "text", text }], structuredContent: { saved: rows } };
  },
});
