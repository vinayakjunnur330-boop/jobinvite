import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Profile ---------------------------------------------------------------
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw new Error(error.message);
    return { profile: data };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        full_name: z.string().trim().max(120).optional(),
        headline: z.string().trim().max(160).optional(),
        phone: z.string().trim().max(40).optional(),
        location: z.string().trim().max(160).optional(),
        resume_url: z.string().trim().url().max(500).optional().or(z.literal("")),
        years_experience: z.number().int().min(0).max(60).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch = {
      ...data,
      resume_url: data.resume_url === "" ? null : data.resume_url,
    };
    const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Applications ----------------------------------------------------------
export const listMyApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("job_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

export const applyToJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        job_id: z.string().min(1).max(80),
        job_title: z.string().min(1).max(200),
        company: z.string().min(1).max(200),
        cover_note: z.string().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("job_applications").upsert(
      { user_id: userId, ...data, cover_note: data.cover_note ?? null },
      { onConflict: "user_id,job_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Alerts ----------------------------------------------------------------
export const getMyAlertPrefs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("job_alert_preferences")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { prefs: data };
  });

export const upsertMyAlertPrefs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        industries: z.array(z.string().max(80)).max(20).default([]),
        arrangements: z.array(z.string().max(40)).max(10).default([]),
        employment_types: z.array(z.string().max(40)).max(10).default([]),
        experience_levels: z.array(z.string().max(40)).max(10).default([]),
        min_salary: z.number().int().min(0).max(1000000).default(0),
        frequency: z.enum(["daily", "weekly"]).default("weekly"),
        enabled: z.boolean().default(true),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("job_alert_preferences")
      .upsert({ user_id: userId, ...data }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
