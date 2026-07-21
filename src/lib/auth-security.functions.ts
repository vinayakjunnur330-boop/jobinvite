import { createServerFn } from "@tanstack/react-start";
import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Sliding-window limits for magic-link requests.
// Per email: max 3 in 15 min, 5 in 60 min. Per IP: max 10 in 60 min.
const EMAIL_SHORT_WINDOW_MS = 15 * 60 * 1000;
const EMAIL_SHORT_LIMIT = 3;
const EMAIL_LONG_WINDOW_MS = 60 * 60 * 1000;
const EMAIL_LONG_LIMIT = 5;
const IP_WINDOW_MS = 60 * 60 * 1000;
const IP_LIMIT = 10;
// Minimum spacing between consecutive resends for the same email.
const EMAIL_COOLDOWN_MS = 30 * 1000;

const emailSchema = z.object({
  email: z.string().email().max(254).transform((v) => v.trim().toLowerCase()),
});

export type MagicLinkQuota =
  | { allowed: true; cooldownMs: 0 }
  | { allowed: false; retryAfterMs: number; reason: "cooldown" | "email_short" | "email_long" | "ip" };

export const checkMagicLinkQuota = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailSchema.parse(data))
  .handler(async ({ data }): Promise<MagicLinkQuota> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip =
      getRequestHeader("cf-connecting-ip") ||
      getRequestHeader("x-real-ip") ||
      getRequestIP({ xForwardedFor: true }) ||
      "unknown";
    const now = Date.now();
    const since = new Date(now - IP_WINDOW_MS).toISOString();

    const { data: rows, error } = await supabaseAdmin
      .from("magic_link_requests")
      .select("email, ip, created_at")
      .or(`email.eq.${data.email},ip.eq.${ip}`)
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (error) {
      // Fail-open on infra error but log; do not block real users.
      console.error("[magic-link] rate lookup failed", error.message);
      return { allowed: true, cooldownMs: 0 };
    }

    const forEmail = (rows ?? []).filter((r) => r.email === data.email);
    const forIp = (rows ?? []).filter((r) => r.ip === ip);

    if (forEmail[0]) {
      const gap = now - new Date(forEmail[0].created_at).getTime();
      if (gap < EMAIL_COOLDOWN_MS) {
        return { allowed: false, reason: "cooldown", retryAfterMs: EMAIL_COOLDOWN_MS - gap };
      }
    }

    const emailShort = forEmail.filter((r) => now - new Date(r.created_at).getTime() < EMAIL_SHORT_WINDOW_MS);
    if (emailShort.length >= EMAIL_SHORT_LIMIT) {
      const oldest = emailShort[emailShort.length - 1];
      const retryAfterMs = EMAIL_SHORT_WINDOW_MS - (now - new Date(oldest.created_at).getTime());
      return { allowed: false, reason: "email_short", retryAfterMs: Math.max(retryAfterMs, 1000) };
    }
    if (forEmail.length >= EMAIL_LONG_LIMIT) {
      const oldest = forEmail[forEmail.length - 1];
      const retryAfterMs = EMAIL_LONG_WINDOW_MS - (now - new Date(oldest.created_at).getTime());
      return { allowed: false, reason: "email_long", retryAfterMs: Math.max(retryAfterMs, 1000) };
    }
    if (forIp.length >= IP_LIMIT) {
      const oldest = forIp[forIp.length - 1];
      const retryAfterMs = IP_WINDOW_MS - (now - new Date(oldest.created_at).getTime());
      return { allowed: false, reason: "ip", retryAfterMs: Math.max(retryAfterMs, 1000) };
    }

    await supabaseAdmin.from("magic_link_requests").insert({ email: data.email, ip });
    return { allowed: true, cooldownMs: 0 };
  });

// Sign out from all devices (revokes all refresh tokens for the current user).
export const signOutAllDevices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.signOut(context.userId, "global");
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// Resend a signup verification / magic link — subject to the same throttling.
export const resendVerificationEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailSchema.parse(data))
  .handler(async ({ data }) => {
    // Reuse the same throttling path.
    const quota = await checkMagicLinkQuota({ data });
    if (!quota.allowed) return { sent: false as const, quota };
    // We only record the request here; the actual email is sent by supabase.auth.signInWithOtp
    // from the client (which also carries emailRedirectTo). This function exists so callers
    // outside the login flow (e.g. dashboard "resend verification" banner) share the same limits.
    return { sent: true as const };
  });
