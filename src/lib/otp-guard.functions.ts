import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes
const MAX_ATTEMPTS = 5
const LOCK_MS = 15 * 60 * 1000 // 15 minutes

const emailInput = z.object({ email: z.string().trim().toLowerCase().email().max(254) })

type Ok = { ok: true; attemptsRemaining: number }
type Err = {
  ok: false
  reason: 'expired' | 'locked' | 'too_many_attempts' | 'not_started'
  message: string
  retryAfterSeconds?: number
  attemptsRemaining?: number
}
type Result = Ok | Err

function friendly(err: Extract<Result, { ok: false }>): Extract<Result, { ok: false }> {
  return err
}

async function admin() {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  return supabaseAdmin
}

/** Called right after the OTP email is sent — resets the challenge window. */
export const startOtpChallenge = createServerFn({ method: 'POST' })
  .inputValidator((raw) => emailInput.parse(raw))
  .handler(async ({ data }): Promise<Ok> => {
    const supabase = await admin()
    await supabase
      .from('otp_challenges')
      .upsert(
        {
          email: data.email,
          issued_at: new Date().toISOString(),
          attempts: 0,
          locked_until: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' },
      )
    return { ok: true, attemptsRemaining: MAX_ATTEMPTS }
  })

/** Called before verifying with Supabase — enforces expiry + lockout. */
export const checkOtpChallenge = createServerFn({ method: 'POST' })
  .inputValidator((raw) => emailInput.parse(raw))
  .handler(async ({ data }): Promise<Result> => {
    const supabase = await admin()
    const { data: row } = await supabase
      .from('otp_challenges')
      .select('issued_at, attempts, locked_until')
      .eq('email', data.email)
      .maybeSingle()

    const now = Date.now()

    if (!row) {
      return friendly({
        ok: false,
        reason: 'not_started',
        message: 'Please request a new code before verifying.',
      })
    }

    if (row.locked_until && new Date(row.locked_until).getTime() > now) {
      const retryAfterSeconds = Math.ceil(
        (new Date(row.locked_until).getTime() - now) / 1000,
      )
      return friendly({
        ok: false,
        reason: 'locked',
        message: `Too many attempts. Try again in ${Math.ceil(retryAfterSeconds / 60)} min.`,
        retryAfterSeconds,
      })
    }

    if (now - new Date(row.issued_at).getTime() > OTP_TTL_MS) {
      return friendly({
        ok: false,
        reason: 'expired',
        message: 'That code has expired. Send yourself a new one.',
      })
    }

    return { ok: true, attemptsRemaining: Math.max(0, MAX_ATTEMPTS - row.attempts) }
  })

/** Called after a failed Supabase verifyOtp — increments attempts, locks after MAX. */
export const recordOtpFailure = createServerFn({ method: 'POST' })
  .inputValidator((raw) => emailInput.parse(raw))
  .handler(async ({ data }): Promise<Result> => {
    const supabase = await admin()
    const { data: row } = await supabase
      .from('otp_challenges')
      .select('issued_at, attempts, locked_until')
      .eq('email', data.email)
      .maybeSingle()

    const now = Date.now()

    if (!row) {
      return friendly({
        ok: false,
        reason: 'not_started',
        message: 'Please request a new code before verifying.',
      })
    }

    // Expired: don't count against attempts; require a new code.
    if (now - new Date(row.issued_at).getTime() > OTP_TTL_MS) {
      return friendly({
        ok: false,
        reason: 'expired',
        message: 'That code has expired. Send yourself a new one.',
      })
    }

    const attempts = row.attempts + 1
    const shouldLock = attempts >= MAX_ATTEMPTS
    const locked_until = shouldLock ? new Date(now + LOCK_MS).toISOString() : row.locked_until

    await supabase
      .from('otp_challenges')
      .update({ attempts, locked_until, updated_at: new Date().toISOString() })
      .eq('email', data.email)

    if (shouldLock) {
      return friendly({
        ok: false,
        reason: 'locked',
        message: `Too many attempts. Try again in ${Math.ceil(LOCK_MS / 60000)} min.`,
        retryAfterSeconds: Math.ceil(LOCK_MS / 1000),
        attemptsRemaining: 0,
      })
    }

    const remaining = MAX_ATTEMPTS - attempts
    return friendly({
      ok: false,
      reason: 'too_many_attempts',
      message:
        remaining === 1
          ? 'Incorrect code — 1 attempt left.'
          : `Incorrect code — ${remaining} attempts left.`,
      attemptsRemaining: remaining,
    })
  })

/** Called after a successful verify — clears the challenge. */
export const clearOtpChallenge = createServerFn({ method: 'POST' })
  .inputValidator((raw) => emailInput.parse(raw))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const supabase = await admin()
    await supabase.from('otp_challenges').delete().eq('email', data.email)
    return { ok: true }
  })
