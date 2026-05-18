import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/assessment", label: "Assessment" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/jobs", label: "Job Trends" },
  { to: "/courses", label: "Courses" },
  { to: "/about", label: "About" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center font-bold text-primary-foreground">P</div>
          <span className="text-lg font-bold tracking-tighter">CAREERPILOT<span className="text-primary">AI</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>
          <Link to="/assessment" className="px-4 py-2 bg-foreground text-background rounded-full text-sm font-bold hover:bg-primary hover:text-primary-foreground transition-all">
            Get Started
          </Link>
        </div>
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 px-6 py-4 flex flex-col gap-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">
              {l.label}
            </Link>
          ))}
          <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium">Sign In</Link>
          <Link to="/assessment" onClick={() => setOpen(false)} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold text-center">Get Started</Link>
        </div>
      )}
    </nav>
  );
}
