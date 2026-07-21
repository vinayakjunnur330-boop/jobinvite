import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { persistCareerPilotSession } from "@/lib/auth-persistence";
import { useServerFn } from "@tanstack/react-start";
import { getMyRoles } from "@/lib/roles.functions";

const SESSION_KEY = "user_session";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Signing you in…" }] }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const checkRoles = useServerFn(getMyRoles);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const finalize = async () => {
      // Handle explicit ?error in URL (expired link, denied, etc.)
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const errParam = url.searchParams.get("error_description") || hash.get("error_description") || url.searchParams.get("error") || hash.get("error");
      if (errParam) {
        setError(decodeURIComponent(errParam.replace(/\+/g, " ")));
        return;
      }

      // supabase-js auto-detects session from the URL hash. Poll briefly.
      for (let i = 0; i < 30; i++) {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        if (data.session) {
          persistCareerPilotSession(data.session, { touchLastLogin: true });
          localStorage.setItem(SESSION_KEY, JSON.stringify({ user: data.session.user, token: data.session.access_token }));
          try {
            const r = await checkRoles();
            navigate({ to: r.isAdmin ? "/admin" : "/dashboard", replace: true });
          } catch {
            navigate({ to: "/dashboard", replace: true });
          }
          return;
        }
        await new Promise((r) => setTimeout(r, 200));
      }
      setError("We couldn't complete sign-in. The link may have expired — please request a new one.");
    };

    finalize();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#050505] p-4">
      <div className="w-full max-w-sm text-center rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-2xl p-8">
        {!error ? (
          <>
            <Loader2 className="mx-auto size-6 animate-spin text-blue-500" />
            <h1 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Signing you in…</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-white/50">Finalizing your secure session.</p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Sign-in link problem</h1>
            <p className="mt-2 text-sm text-red-500 dark:text-red-300">{error}</p>
            <button
              onClick={() => navigate({ to: "/login", search: { form: "1" } })}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-blue-500 px-5 text-sm font-medium text-white hover:bg-blue-600"
            >
              Back to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
