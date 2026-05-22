import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — CareerPilot AI" },
      { name: "description", content: "Sign in or create an account to save your career assessments, roadmaps, and AI chat history." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
      if (res.error) throw res.error instanceof Error ? res.error : new Error(String(res.error));
      if (!res.redirected) navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2 max-w-7xl mx-auto px-6 py-12 gap-12 items-center">
      <div className="hidden lg:block">
        <div className="font-mono text-xs text-primary tracking-widest mb-3">ACCESS_PORTAL</div>
        <h1 className="text-5xl font-extrabold tracking-tight leading-[1.05] mb-6">
          Resume your <span className="text-gradient-brand">flight plan.</span>
        </h1>
        <p className="text-muted-foreground max-w-md">
          Your assessments, saved careers, and AI conversations — synced across every device.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-10">
          {[["Saved", "Roadmaps"], ["Tracked", "Skill progress"], ["History", "AI chats"], ["Personal", "Career list"]].map(([a, b]) => (
            <div key={b} className="glass p-4 rounded-xl">
              <div className="text-xs font-mono text-primary">{a}</div>
              <div className="font-semibold text-sm mt-1">{b}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass p-8 rounded-3xl w-full max-w-md mx-auto">
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6">
          {(["signin", "signup"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              {m === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <button onClick={google} disabled={busy} className="w-full py-3 rounded-xl border border-border bg-white/5 hover:bg-white/10 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
          <svg className="size-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">or email</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && <Field label="Full name" value={name} onChange={setName} required />}
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Password" type="password" value={password} onChange={setPassword} required />
          <button type="submit" disabled={busy} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:shadow-[var(--shadow-glow-primary)] transition-all disabled:opacity-50">
            {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-6">
          By continuing, you agree to our <Link to="/about" className="text-primary hover:underline">Terms</Link>.
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </div>
  );
}
