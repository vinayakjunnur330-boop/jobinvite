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
  const checkRoles = useServerFn(getMyRoles);
  const fetchUsers = useServerFn(listAllUsers);

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

  if (loading || !user || rolesQ.isLoading || !rolesQ.data?.isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const users = usersQ.data?.users ?? [];
  const adminCount = users.filter((u) => u.roles.includes("admin")).length;

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
        <Stat icon={<Bookmark className="size-4" />} label="SAVED_CAREERS" value="—" />
        <Stat icon={<MessageSquare className="size-4" />} label="CONVERSATIONS" value="—" />
      </div>

      <section className="glass rounded-2xl border border-border overflow-hidden">
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
            {users.map((u) => (
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
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-8 text-xs text-muted-foreground">
        Need to grant admin to another account? Add a row in the <code className="px-1.5 py-0.5 rounded bg-white/5">user_roles</code> table with that user's id and role <code className="px-1.5 py-0.5 rounded bg-white/5">admin</code>.
        <Link to="/dashboard" className="ml-2 text-primary hover:underline">Back to user dashboard →</Link>
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
