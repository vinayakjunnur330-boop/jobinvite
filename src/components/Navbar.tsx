import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, LogOut, Compass } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const primaryLinks = [
  { to: "/", label: "Home" },
  { to: "/nexus", label: "Nexus" },
  { to: "/assessment", label: "Assessment" },
  { to: "/jobs", label: "Jobs" },
  { to: "/mentors", label: "Mentors" },
  { to: "/about", label: "About" },
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Compass className="size-4" strokeWidth={2.4} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">CareerPilot</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          {primaryLinks.map((l) => {
            const active = l.to === "/" ? path === "/" : path.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`transition-colors ${active ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              <Link to="/dashboard" className="size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm" title={user.email ?? ""}>
                {initial}
              </Link>
              <button onClick={handleSignOut} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors" aria-label="Sign out">
                <LogOut className="size-4" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign in
              </Link>
              <Link
                to="/assessment"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-primary transition-colors active:scale-[0.98]"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background px-6 py-5 space-y-3">
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
                <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium">Sign in</Link>
                <Link to="/assessment" onClick={() => setOpen(false)} className="ml-auto px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium">Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
