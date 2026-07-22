import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, LogOut, Compass, Sparkles, Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";
import { showPageLoader } from "@/lib/nav-loader";

function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, , toggle] = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`size-9 inline-flex items-center justify-center rounded-full border border-white/15 dark:border-white/15 border-black/10 bg-white/[0.04] dark:bg-white/[0.04] text-foreground/80 hover:text-foreground hover:bg-white/[0.1] dark:hover:bg-white/[0.08] transition-colors ${className}`}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

const primaryLinks = [
  { to: "/", label: "Home" },
  { to: "/assessment", label: "Assessment" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/mentors", label: "Mentors" },
  { to: "/scholarships", label: "Scholarships" },
  { to: "/internships", label: "Internships" },
  { to: "/blog", label: "Blog" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const initial = (user?.user_metadata?.full_name || user?.email || "?")[0]?.toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/[0.02] backdrop-blur-3xl border-b border-white/10 shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] gpu">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="relative size-9 rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-600/40 border border-white/15 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_-4px_rgba(139,92,246,0.6)]">
            <Compass className="size-4 text-cyan-300" strokeWidth={2.4} />
            <Sparkles className="absolute -top-1 -right-1 size-3 text-fuchsia-300 drop-shadow-[0_0_6px_rgba(236,72,153,0.9)]" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">
            CareerPilot<span className="text-gradient-ai font-bold ml-1">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/dashboard" className="hidden sm:flex size-9 rounded-full bg-primary text-primary-foreground items-center justify-center font-semibold text-sm" title={user.email ?? ""}>
                {initial}
              </Link>
              <button onClick={handleSignOut} className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground items-center gap-1.5 transition-colors" aria-label="Sign out">
                <LogOut className="size-4" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" search={{ form: "1" }} onClick={() => showPageLoader()} className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign in
              </Link>
              <Link
                to="/assessment"
                className="hidden sm:inline-flex btn-glass text-sm"
              >
                Get started
              </Link>
            </>
          )}
          <button className="text-foreground size-9 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.1] transition-colors" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-white/[0.02] backdrop-blur-3xl px-6 py-5 space-y-3">
          {primaryLinks.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-border flex gap-3">
            {user ? (
              <button onClick={() => { setOpen(false); handleSignOut(); }} className="text-sm font-medium">Sign out</button>
            ) : (
              <>
                <Link to="/login" search={{ form: "1" }} onClick={() => { setOpen(false); showPageLoader(); }} className="text-sm font-medium">Sign in</Link>
                <Link to="/assessment" onClick={() => setOpen(false)} className="ml-auto px-4 py-2 bg-foreground text-neutral-900 rounded-lg text-sm font-medium">Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
