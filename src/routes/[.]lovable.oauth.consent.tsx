import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type OAuthAPI = {
  getAuthorizationDetails: (id: string) => Promise<{
    data: { client?: { name?: string; redirect_uris?: string[] } | null; scope?: string; redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
  approveAuthorization: (id: string) => Promise<{
    data: { redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
  denyAuthorization: (id: string) => Promise<{
    data: { redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
};

function oauthApi(): OAuthAPI {
  // supabase.auth.oauth is a beta namespace — keep a local typed wrapper.
  return (supabase.auth as unknown as { oauth: OAuthAPI }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/login", search: { form: "1", next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen w-full flex items-center justify-center p-6 bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white">
      <div className="max-w-sm text-center rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-xl p-8">
        <h1 className="text-lg font-semibold">Authorization unavailable</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-white/60">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState<"approve" | "deny" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? "an application";
  const redirectUri = details?.client?.redirect_uris?.[0];
  const scope = details?.scope ?? "openid email profile";

  async function decide(approve: boolean) {
    setBusy(approve ? "approve" : "deny");
    setError(null);
    const api = oauthApi();
    const { data, error } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (error) {
      setBusy(null);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(null);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-2xl p-8">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Connect {clientName} to CareerPilot AI</h1>
            <p className="text-xs text-gray-500 dark:text-white/50">This lets {clientName} use CareerPilot AI as you.</p>
          </div>
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 p-3">
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-white/50">Access being granted</div>
            <ul className="mt-2 space-y-1">
              <li>• Call CareerPilot AI's enabled tools while you are signed in</li>
              <li>• Read and manage your saved careers and profile</li>
              <li>• Share your basic profile ({scope})</li>
            </ul>
          </div>
          {redirectUri && (
            <p className="text-xs text-gray-500 dark:text-white/40 break-all">
              Redirects to: {redirectUri}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-white/50">
            This does not bypass CareerPilot AI's permissions or backend policies.
          </p>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-500">{error}</p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => decide(false)}
            disabled={busy !== null}
            className="flex-1 h-11 rounded-full border border-gray-200 dark:border-white/15 text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50"
          >
            {busy === "deny" ? <Loader2 className="mx-auto size-4 animate-spin" /> : "Cancel connection"}
          </button>
          <button
            onClick={() => decide(true)}
            disabled={busy !== null}
            className="flex-1 h-11 rounded-full bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50"
          >
            {busy === "approve" ? <Loader2 className="mx-auto size-4 animate-spin" /> : "Approve"}
          </button>
        </div>
      </div>
    </main>
  );
}
