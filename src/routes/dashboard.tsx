import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { ArrowRight, Bookmark, Download, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { careers, trends } from "@/lib/careers";
import { listSavedCareers, removeSavedCareer } from "@/lib/saved-careers.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Dashboard — CareerPilot AI" },
      { name: "description", content: "Your saved careers, AI recommendations, and live market pulse." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="h-8 w-64 rounded glass animate-pulse mb-6" />
        <div className="grid lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 glass rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return <Authed />;
}

function Authed() {
  const qc = useQueryClient();
  const list = useServerFn(listSavedCareers);
  const remove = useServerFn(removeSavedCareer);

  const { data, isLoading } = useQuery({
    queryKey: ["saved-careers"],
    queryFn: () => list(),
  });

  const del = useMutation({
    mutationFn: (career_slug: string) => remove({ data: { career_slug } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-careers"] });
      toast.success("Removed from saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to remove"),
  });

  const saved = data?.items ?? [];
  const top5 = careers.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="font-mono text-xs text-primary tracking-widest mb-2">FLIGHT_DECK</div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Your career flight deck</h1>
          <p className="text-muted-foreground mt-2">Saved careers, AI recommendations, and live market signals — all in one place.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl border border-border bg-white/5 hover:bg-white/10 text-sm font-medium flex items-center gap-2">
          <Download className="size-4" /> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Stat label="SAVED_PATHS" value={String(saved.length)} tone="primary" />
        <Stat label="MARKET_DEMAND" value="Extreme" tone="accent" />
        <Stat label="AI_MATCHES" value="5 top" tone="primary" />
        <Stat label="SKILL_GAPS" value="3 found" tone="accent" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Saved careers from DB */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold flex items-center gap-2"><Bookmark className="size-4 text-primary"/> Your saved careers</h2>
              <Link to="/" className="text-xs text-primary hover:underline">Discover more →</Link>
            </div>
            {isLoading ? (
              <div className="space-y-2">{Array.from({length:2}).map((_,i)=><div key={i} className="h-20 glass rounded-2xl animate-pulse"/>)}</div>
            ) : saved.length === 0 ? (
              <div className="glass p-6 rounded-2xl text-center">
                <p className="text-sm text-muted-foreground mb-3">No saved careers yet. Tap the bookmark on any AI recommendation below to add one.</p>
                <Link to="/" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">Explore careers <ArrowRight className="size-3"/></Link>
              </div>
            ) : (
              <div className="space-y-2">
                {saved.map((s) => (
                  <div key={s.id} className="glass p-4 rounded-2xl flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{s.industry || "Career"}</div>
                      <div className="font-bold truncate">{s.title}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to="/domain/$slug" params={{ slug: s.career_slug }} className="text-xs font-bold text-primary hover:underline">Open</Link>
                      <button onClick={() => del.mutate(s.career_slug)} className="size-8 rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive flex items-center justify-center" aria-label="Remove">
                        <Trash2 className="size-4"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* AI recommendations */}
          <section>
            <h2 className="text-lg font-bold mb-3">AI recommendations for you</h2>
            <div className="space-y-3">
              {top5.map((c, i) => (
                <div key={c.slug} className="glass p-5 rounded-2xl hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-mono font-bold flex-shrink-0">0{i + 1}</div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{c.industry}</div>
                          <h3 className="text-xl font-bold">{c.title}</h3>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-extrabold text-gradient-brand leading-none">{c.match}%</div>
                          <div className="text-[10px] font-mono text-muted-foreground mt-1">MATCH</div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{c.summary}</p>
                      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                        <Mini label="SALARY" value={c.salary} />
                        <Mini label="GROWTH" value={c.growth} good />
                        <Mini label="DEMAND" value={c.demand} />
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${c.match}%` }} />
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-1.5">
                          {c.skills.slice(0, 4).map((s) => <span key={s} className="text-[10px] font-mono px-2 py-0.5 bg-white/5 border border-border rounded">{s}</span>)}
                        </div>
                        <Link to="/roadmap" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                          View roadmap <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-3">
          <div className="glass p-5 rounded-2xl">
            <div className="font-mono text-[10px] text-primary tracking-widest mb-3">MARKET_PULSE</div>
            <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="size-4 text-success" /> Hottest industries</h3>
            <div className="space-y-2">
              {trends.slice(0, 5).map((t) => (
                <div key={t.industry} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{t.industry}</span>
                  <span className={`font-mono font-bold text-xs ${t.color === "primary" ? "text-primary" : "text-accent"}`}>{t.change}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-5 rounded-2xl">
            <div className="font-mono text-[10px] text-accent tracking-widest mb-3">QUICK_ACTIONS</div>
            <div className="space-y-2">
              <Link to="/assessment" className="block p-3 rounded-lg bg-white/5 border border-border hover:bg-white/10 text-sm font-medium">→ Run new assessment</Link>
              <Link to="/skills" className="block p-3 rounded-lg bg-white/5 border border-border hover:bg-white/10 text-sm font-medium">→ Skill gap analysis</Link>
              <Link to="/roadmap" className="block p-3 rounded-lg bg-white/5 border border-border hover:bg-white/10 text-sm font-medium">→ Open roadmap</Link>
              <Link to="/jobs" className="block p-3 rounded-lg bg-white/5 border border-border hover:bg-white/10 text-sm font-medium">→ Job market</Link>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl border-primary/30">
            <div className="font-mono text-[10px] text-primary tracking-widest mb-2">PILOT_TIP</div>
            <p className="text-sm text-muted-foreground">Tap the Pilot Assistant (bottom-right) to draft a custom 90-day roadmap for any career on this page.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "primary" | "accent" }) {
  return (
    <div className="glass p-4 rounded-xl">
      <div className={`text-[10px] font-mono tracking-widest mb-1 ${tone === "primary" ? "text-primary" : "text-accent"}`}>{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
function Mini({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="p-2 bg-white/5 rounded border border-border">
      <div className="text-[9px] text-muted-foreground font-mono">{label}</div>
      <div className={`font-semibold text-xs ${good ? "text-success" : ""}`}>{value}</div>
    </div>
  );
}
