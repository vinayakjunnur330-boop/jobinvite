import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listSavedCareers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("saved_careers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

export const saveCareer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        career_slug: z.string().min(1).max(120),
        title: z.string().min(1).max(200),
        industry: z.string().max(120).optional(),
        notes: z.string().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("saved_careers")
      .upsert(
        { user_id: userId, career_slug: data.career_slug, title: data.title, industry: data.industry ?? null, notes: data.notes ?? null },
        { onConflict: "user_id,career_slug" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeSavedCareer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ career_slug: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("saved_careers").delete().eq("career_slug", data.career_slug);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
