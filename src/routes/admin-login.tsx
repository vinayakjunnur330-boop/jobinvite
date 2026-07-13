import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shield, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyRoles } from "@/lib/roles.functions";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — CareerPilot AI" },
      { name: "description", content: "Restricted admin console access." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const checkRoles = useServerFn(getMyRoles);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  // If already signed in AND admin, jump straight in.
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      try {
        const r = await checkRoles();
        if (r.isAdmin) navigate({ to: "/admin" });
      } catch { /* ignore */ }
    })();
  }, [checkRoles, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const r = await checkRoles();
      if (!r.isAdmin) {
        await supabase.auth.signOut();
        throw new Error("This account does not have admin access.");
      }
      toast.success("Welcome, admin.");
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary/10 border border-primary/30 text-primary mb-4">
            <Shield className="size-6" />
          </div>
          <div className="font-mono text-[11px] tracking-[0.22em] text-primary uppercase mb-2">Restricted Access</div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
          <p className="mt-2 text-sm text-muted-foreground">Only accounts with the admin role can continue past this screen.</p>
        </div>

        <form onSubmit={submit} className="glass p-6 rounded-2xl space-y-4 border border-border">
          <div>
            <label className="block text-xs font-mono tracking-widest text-muted-foreground mb-1.5">EMAIL</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
              className="w-full h-11 px-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              placeholder="admin@yourcompany.com"
            />
          </div>
          <div>
            <label className="block text-xs font-mono tracking-widest text-muted-foreground mb-1.5">PASSWORD</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                className="w-full h-11 px-3 pr-10 rounded-lg bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPw ? "Hide" : "Show"}>
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={busy}
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : (<>Enter Console <ArrowRight className="size-4" /></>)}
          </button>

          <div className="text-center text-xs text-muted-foreground pt-2">
            Not an admin? <Link to="/login" className="text-primary hover:underline">Regular sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
