import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, Loader2, LogOut, MailWarning, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { checkMagicLinkQuota, signOutAllDevices } from "@/lib/auth-security.functions";

function formatRetry(ms: number): string {
  const s = Math.ceil(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.ceil(s / 60);
  if (m < 60) return `${m} min`;
  return `${Math.ceil(m / 60)}h`;
}

export function AccountSecurityCard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const check = useServerFn(checkMagicLinkQuota);
  const signOutAll = useServerFn(signOutAllDevices);

  const isVerified = useMemo(() => !!user?.email_confirmed_at || !!user?.confirmed_at, [user]);
  const email = user?.email ?? "";

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const [now, setNow] = useState(Date.now());
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [cooldownUntil]);

  const cooldownMs = Math.max(0, cooldownUntil - now);

  const resend = async () => {
    if (!email || resending || cooldownMs > 0) return;
    setResending(true);
    setResent(false);
    try {
      const quota = await check({ data: { email } });
      if (!quota.allowed) {
        setCooldownUntil(Date.now() + quota.retryAfterMs);
        toast.error(
          quota.reason === "cooldown"
            ? `Please wait ${formatRetry(quota.retryAfterMs)} before requesting another link.`
            : `Too many requests. Try again in ${formatRetry(quota.retryAfterMs)}.`,
        );
        return;
      }
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setResent(true);
      setCooldownUntil(Date.now() + 30_000);
      toast.success("Verification link sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send verification link");
    } finally {
      setResending(false);
    }
  };

  const revokeAll = async () => {
    if (revoking) return;
    if (!window.confirm("Sign out of every device where you're currently signed in?")) return;
    setRevoking(true);
    try {
      await signOutAll();
      toast.success("Signed out on all devices");
      await signOut().catch(() => {});
      navigate({ to: "/login", search: { form: "1" } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't revoke sessions");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl space-y-5">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-4 text-primary" />
        <h3 className="font-bold">Account security</h3>
      </div>

      {/* Email verification state */}
      {isVerified ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/5 p-3.5 text-sm">
          <CheckCircle2 className="size-4 mt-0.5 text-emerald-500 shrink-0" />
          <div>
            <div className="font-medium text-emerald-700 dark:text-emerald-300">Email verified</div>
            <div className="text-xs text-emerald-700/80 dark:text-emerald-300/70 break-all">{email}</div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/5 p-3.5">
          <div className="flex items-start gap-3">
            <MailWarning className="size-4 mt-0.5 text-amber-500 shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-amber-700 dark:text-amber-300 text-sm">
                Email not verified
              </div>
              <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/80">
                We sent a magic link to <span className="font-medium break-all">{email}</span> but
                sign-in hasn't finished. Open the link on this device, or resend below.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={resend}
                  disabled={resending || cooldownMs > 0}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-amber-500 hover:bg-amber-600 px-3.5 text-xs font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {resending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  {cooldownMs > 0 ? `Resend in ${Math.ceil(cooldownMs / 1000)}s` : "Resend verification"}
                </button>
                {resent && cooldownMs > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-300">
                    <CheckCircle2 className="size-3" /> Sent
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign out everywhere */}
      <div className="rounded-xl border border-border bg-white/40 dark:bg-white/[0.03] p-3.5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="size-4 mt-0.5 text-red-500 shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-sm">Sign out of all devices</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Revokes every active session for this account across browsers and phones. Use if you've
              lost a device or suspect unauthorized access.
            </p>
            <button
              onClick={revokeAll}
              disabled={revoking}
              className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-full border border-red-400/40 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-300 px-3.5 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {revoking ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
              Sign out everywhere
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
