import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/assessment", label: "Assessment" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/mentors", label: "Mentors" },
  { to: "/jobs", label: "Trends" },
  { to: "/success-stories", label: "Stories" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative size-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-primary-foreground shadow-[0_0_20px_-4px_var(--primary)]">
            <Sparkles className="size-4" />
          </div>
          <span className="text-lg font-bold tracking-tighter">CAREERPILOT<span className="text-gradient-brand">AI</span></span>
        </Link>
        <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="hover:text-foreground transition-colors relative"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>
          <Link to="/assessment" className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_20px_-4px_var(--primary)]">
            Start free
          </Link>
        </div>
        <button className="lg:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 px-6 py-4 flex flex-col gap-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">
              {l.label}
            </Link>
          ))}
          <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium">Sign In</Link>
          <Link to="/assessment" onClick={() => setOpen(false)} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold text-center">Start free</Link>
        </div>
      )}
    </nav>
  );
}
