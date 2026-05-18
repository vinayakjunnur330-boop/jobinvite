import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center font-bold text-primary-foreground">P</div>
            <span className="text-lg font-bold tracking-tighter">CAREERPILOT<span className="text-primary">AI</span></span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Navigate your career airspace with AI-powered telemetry, skill analysis, and personalized roadmaps.
          </p>
        </div>
        <div>
          <h5 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">Platform</h5>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/assessment" className="hover:text-primary">Assessment</Link></li>
            <li><Link to="/resume" className="hover:text-primary">Resume Scan</Link></li>
            <li><Link to="/skills" className="hover:text-primary">Skill Analysis</Link></li>
            <li><Link to="/roadmap" className="hover:text-primary">Roadmap</Link></li>
            <li><Link to="/jobs" className="hover:text-primary">Job Trends</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">Company</h5>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link to="/login" className="hover:text-primary">Sign In</Link></li>
            <li><Link to="/profile" className="hover:text-primary">Profile</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-8 justify-center items-center grayscale opacity-60">
          <div className="flex items-center gap-2 font-mono text-xs tracking-widest text-muted-foreground">
            <span className="size-2 bg-success rounded-full" /> LATENCY: 42MS
          </div>
          <div className="flex items-center gap-2 font-mono text-xs tracking-widest text-muted-foreground">
            <span className="size-2 bg-primary rounded-full" /> USERS_ACTIVE: 12.4K
          </div>
          <div className="flex items-center gap-2 font-mono text-xs tracking-widest text-muted-foreground">
            <span className="size-2 bg-accent rounded-full" /> PATHS_MAPPED: 1.2M
          </div>
        </div>
      </div>
    </footer>
  );
}
