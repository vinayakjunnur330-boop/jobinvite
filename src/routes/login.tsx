import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — CareerPilot AI" },
      { name: "description", content: "Sign in or create an account to save your career assessments, roadmaps, and history." },
      { property: "og:title", content: "Sign In to CareerPilot AI" },
      { property: "og:description", content: "Access your personalized career dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2 max-w-7xl mx-auto px-6 py-12 gap-12 items-center">
      <div className="hidden lg:block">
        <div className="font-mono text-xs text-primary tracking-widest mb-3">ACCESS_PORTAL</div>
        <h1 className="text-5xl font-extrabold tracking-tight leading-[1.05] mb-6">
          Resume your <span className="text-gradient-brand">flight plan.</span>
        </h1>
        <p className="text-muted-foreground max-w-md">
          Your assessments, roadmaps, and saved careers — synced across every device.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-10">
          {[["Saved", "Roadmaps"], ["Tracked", "Skill progress"], ["Exported", "PDF reports"], ["Smart", "Notifications"]].map(([a, b]) => (
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
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              {m === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {mode === "signup" && (
            <Field label="Full name" name="name" />
          )}
          <Field label="Email" name="email" type="email" />
          <Field label="Password" name="password" type="password" />

          <button type="submit" className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:shadow-[var(--shadow-glow-primary)] transition-all">
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button className="w-full py-3 rounded-xl border border-border bg-white/5 hover:bg-white/10 text-sm font-bold">Continue with Google</button>

        <p className="text-xs text-center text-muted-foreground mt-6">
          By continuing, you agree to our{" "}
          <Link to="/about" className="text-primary hover:underline">Terms</Link>.
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        name={name}
        type={type}
        required
        className="mt-2 w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </div>
  );
}
