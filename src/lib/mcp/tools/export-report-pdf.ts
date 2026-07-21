import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { careers } from "@/lib/careers";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "export_career_report_pdf",
  title: "Export career report (PDF)",
  description: "Generate a downloadable PDF report of the signed-in user's saved careers, profile summary, and recommendations.",
  inputSchema: {
    includeNotes: z.boolean().default(true).describe("Include personal notes on each saved career."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: async ({ includeNotes }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    const [{ data: saved }, { data: profile }] = await Promise.all([
      sb.from("saved_careers").select("career_slug, title, industry, notes, created_at").eq("user_id", ctx.getUserId()).order("created_at", { ascending: false }),
      sb.from("profiles").select("full_name, headline, location, years_experience").eq("id", ctx.getUserId()).maybeSingle(),
    ]);

    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    let page = pdf.addPage([612, 792]);
    const { width, height } = page.getSize();
    let y = height - 60;
    const black = rgb(0.05, 0.05, 0.05);
    const gray = rgb(0.4, 0.4, 0.4);

    const line = (t: string, opts: { size?: number; f?: typeof font; color?: ReturnType<typeof rgb> } = {}) => {
      const size = opts.size ?? 11;
      if (y < 60) { page = pdf.addPage([612, 792]); y = height - 60; }
      page.drawText(t, { x: 50, y, size, font: opts.f ?? font, color: opts.color ?? black, maxWidth: width - 100 });
      y -= size + 6;
    };

    line("CareerPilot AI — Career Report", { size: 22, f: bold });
    line(new Date().toLocaleDateString(), { size: 10, color: gray });
    y -= 10;

    line("Profile", { size: 14, f: bold });
    line(`Name: ${profile?.full_name ?? "—"}`);
    line(`Headline: ${profile?.headline ?? "—"}`);
    line(`Location: ${profile?.location ?? "—"}`);
    line(`Experience: ${profile?.years_experience ?? 0} years`);
    y -= 10;

    line(`Saved Careers (${saved?.length ?? 0})`, { size: 14, f: bold });
    for (const s of saved ?? []) {
      const c = careers.find((x) => x.slug === s.career_slug);
      line(`• ${s.title}`, { size: 12, f: bold });
      line(`  Industry: ${s.industry}${c ? ` • Salary: ${c.salary} • Growth: ${c.growth}` : ""}`, { size: 10, color: gray });
      if (includeNotes && s.notes) line(`  Note: ${s.notes}`, { size: 10 });
    }

    if (!saved?.length) line("No careers saved yet — use save_career to build your dashboard.", { color: gray });

    const bytes = await pdf.save();
    const base64 = Buffer.from(bytes).toString("base64");

    return {
      content: [
        { type: "text", text: `Generated PDF report with ${saved?.length ?? 0} saved careers.` },
        {
          type: "resource",
          resource: {
            uri: `careerpilot://report/${ctx.getUserId()}/${Date.now()}.pdf`,
            mimeType: "application/pdf",
            blob: base64,
          },
        },
      ],
    };
  },
});
