import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { Shield, Users, Bookmark, MessageSquare, LogOut, Loader2, ScrollText, ShieldPlus, ShieldMinus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { getMyRoles, listAllUsers } from "@/lib/roles.functions";
import { listAuditLogs, changeUserRole } from "@/lib/audit.functions";


export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — CareerPilot AI" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPanel,
});

function AdminPanel() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const checkRoles = useServerFn(getMyRoles);
  const fetchUsers = useServerFn(listAllUsers);
  const fetchLogs = useServerFn(listAuditLogs);
  const mutateRole = useServerFn(changeUserRole);

  const rolesQ = useQuery({
    queryKey: ["my-roles"],
    queryFn: () => checkRoles(),
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin-login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (rolesQ.data && !rolesQ.data.isAdmin) navigate({ to: "/admin-login" });
  }, [rolesQ.data, navigate]);

  const usersQ = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers(),
    enabled: !!rolesQ.data?.isAdmin,
  });

  const logsQ = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => fetchLogs(),
    enabled: !!rolesQ.data?.isAdmin,
  });

  if (loading || !user || rolesQ.isLoading || !rolesQ.data?.isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const users = usersQ.data?.users ?? [];
  const logs = logsQ.data?.logs ?? [];
  const adminCount = users.filter((u) => u.roles.includes("admin")).length;
  const userLabel = new Map(users.map((u) => [u.id, u.full_name || u.id.slice(0, 8)]));

  const toggleAdmin = async (targetUserId: string, isAdmin: boolean) => {
    try {
      await mutateRole({ data: { targetUserId, role: "admin", grant: !isAdmin } });
      toast.success(isAdmin ? "Admin revoked" : "Admin granted");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["audit-logs"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 font-mono text-[11px] text-primary tracking-widest mb-2">
            <Shield className="size-3.5" /> ADMIN_CONSOLE
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Control Panel</h1>
          <p className="text-muted-foreground mt-1 text-sm">Signed in as <span className="text-foreground font-medium">{user.email}</span></p>
        </div>
        <button
          onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin-login" }); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-white/5 text-sm"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Stat icon={<Users className="size-4" />} label="TOTAL_USERS" value={String(users.length)} />
        <Stat icon={<Shield className="size-4" />} label="ADMINS" value={String(adminCount)} />
        <Stat icon={<ScrollText className="size-4" />} label="AUDIT_EVENTS" value={String(logs.length)} />
        <Stat icon={<MessageSquare className="size-4" />} label="CONVERSATIONS" value="—" />
      </div>

      <section className="glass rounded-2xl border border-border overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Users</h2>
          <span className="text-xs text-muted-foreground">Latest 200</span>
        </div>
        {usersQ.isLoading ? (
          <div className="p-6 text-center text-sm text-muted-foreground">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No users yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {users.map((u) => {
              const isAdmin = u.roles.includes("admin");
              const isSelf = u.id === user.id;
              return (
                <div key={u.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="size-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-sm">
                    {(u.full_name || "?")[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{u.full_name || "Unnamed"}</div>
                    <div className="text-xs text-muted-foreground font-mono truncate">{u.id}</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {u.roles.length === 0 ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-border text-muted-foreground">user</span>
                    ) : u.roles.map((r) => (
                      <span key={r} className={`text-[10px] font-mono px-2 py-0.5 rounded border ${r === "admin" ? "bg-primary/15 border-primary/40 text-primary" : "bg-white/5 border-border text-muted-foreground"}`}>{r}</span>
                    ))}
                  </div>
                  <button
                    disabled={isSelf}
                    onClick={() => toggleAdmin(u.id, isAdmin)}
                    title={isSelf ? "You can't change your own admin role" : isAdmin ? "Revoke admin" : "Grant admin"}
                    className="ml-2 inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded border border-border hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isAdmin ? <><ShieldMinus className="size-3" /> REVOKE</> : <><ShieldPlus className="size-3" /> GRANT</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="glass rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2"><ScrollText className="size-4 text-primary" /> Audit Log</h2>
          <span className="text-xs text-muted-foreground">Latest 200 events</span>
        </div>
        {logsQ.isLoading ? (
          <div className="p-6 text-center text-sm text-muted-foreground">Loading log…</div>
        ) : logs.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No events recorded yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((l) => {
              const actor = l.actor_user_id ? (userLabel.get(l.actor_user_id) || l.actor_user_id.slice(0, 8)) : "system";
              const target = l.target_user_id ? (userLabel.get(l.target_user_id) || l.target_user_id.slice(0, 8)) : null;
              const role = (l.details as any)?.role;
              return (
                <div key={l.id} className="px-5 py-3 flex items-start gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        l.action === "admin_login" ? "bg-primary/15 border-primary/40 text-primary"
                        : l.action === "role_granted" ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                        : "bg-rose-500/15 border-rose-500/40 text-rose-400"
                      }`}>{l.action.toUpperCase()}</span>
                      <span className="text-foreground font-medium">{actor}</span>
                      {target && target !== actor && (
                        <span className="text-muted-foreground">→ <span className="text-foreground">{target}</span></span>
                      )}
                      {role && <span className="text-xs text-muted-foreground font-mono">({role})</span>}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">
                      actor: {l.actor_user_id ?? "—"}{target ? ` · target: ${l.target_user_id}` : ""}
                    </div>
                  </div>
                  <time className="text-[11px] text-muted-foreground font-mono whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString()}
                  </time>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <p className="mt-8 text-xs text-muted-foreground">
        <Link to="/dashboard" className="text-primary hover:underline">Back to user dashboard →</Link>
      </p>
    </div>
  );
}


function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass p-4 rounded-xl border border-border">
      <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-primary mb-1">{icon}{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
