import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AssessmentKind = "personality" | "technical" | "aptitude" | "career_fit" | "interview";

export const saveAssessmentResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown): {
    kind: AssessmentKind;
    score: number;
    details: Record<string, unknown>;
  } => {
    const d = data as { kind?: unknown; score?: unknown; details?: unknown };
    const allowed: AssessmentKind[] = ["personality", "technical", "aptitude", "career_fit", "interview"];
    if (typeof d.kind !== "string" || !allowed.includes(d.kind as AssessmentKind))
      throw new Error("Invalid kind");
    if (typeof d.score !== "number") throw new Error("score required");
    return {
      kind: d.kind as AssessmentKind,
      score: Math.max(0, Math.min(100, Math.round(d.score))),
      details: (d.details && typeof d.details === "object" ? d.details : {}) as Record<string, unknown>,
    };
  })
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("assessment_results")
      .insert({
        user_id: context.userId,
        kind: data.kind,
        score: data.score,
        details: data.details,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listAssessmentResults = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("assessment_results")
      .select("id, kind, score, details, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// Career fit uses previously-saved results if any.
export const getLatestByKind = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("assessment_results")
      .select("kind, score, details, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    const byKind: Record<string, { score: number; details: Record<string, unknown>; created_at: string }> = {};
    for (const row of data ?? []) {
      if (!byKind[row.kind]) {
        byKind[row.kind] = {
          score: row.score,
          details: (row.details ?? {}) as Record<string, unknown>,
          created_at: row.created_at,
        };
      }
    }
    return byKind;
  });
