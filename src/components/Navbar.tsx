import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Sparkles, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const links = [
  { to: "/", label: "Home" },
  { to: "/assessment", label: "Assessment" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/personality", label: "Personality" },
  { to: "/compare", label: "Compare" },
  { to: "/salary", label: "Salary" },
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
  const initial = (user?.user_metadata?.full_name || user?.email || "?")[0]?.toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="relative size-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-primary-foreground shadow-[0_0_20px_-4px_var(--primary)]">
            <Sparkles className="size-4" />
          </div>
          <span className="text-lg font-bold tracking-tighter">CAREERPILOT<span className="text-gradient-brand">AI</span></span>
        </Link>
        <div className="hidden xl:flex items-center gap-5 text-sm font-medium text-muted-foreground overflow-x-auto">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-foreground transition-colors whitespace-nowrap" activeProps={{ className: "text-foreground" }} activeOptions={{ exact: l.to === "/" }}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              <Link to="/dashboard" className="size-9 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center font-bold text-sm" title={user.email ?? ""}>
                {initial}
              </Link>
              <button onClick={handleSignOut} className="text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-1" aria-label="Sign out">
                <LogOut className="size-4" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>
              <Link to="/assessment" className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_20px_-4px_var(--primary)]">
                Start free
              </Link>
            </>
          )}
        </div>
        <button className="xl:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="xl:hidden border-t border-border bg-background/95 px-6 py-4 grid grid-cols-2 gap-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="text-sm font-medium inline-flex items-center gap-1"><LayoutDashboard className="size-4"/> Dashboard</Link>
              <button onClick={() => { setOpen(false); handleSignOut(); }} className="text-sm font-medium text-left">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium">Sign In</Link>
              <Link to="/assessment" onClick={() => setOpen(false)} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold text-center col-span-2">Start free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
