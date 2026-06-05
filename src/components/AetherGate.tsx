import { useEffect, useState } from "react";
import { AuthGateway } from "./AuthGateway";
import { AuthedDashboard } from "./AuthedDashboard";

const KEY = "aether_session_v1";

export function AetherGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [showSite, setShowSite] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setEmail(JSON.parse(raw).email);
    } catch {/* noop */}
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!email) {
    return (
      <AuthGateway
        onAuthed={(e) => {
          localStorage.setItem(KEY, JSON.stringify({ email: e, at: Date.now() }));
          setEmail(e);
          setShowSite(false);
        }}
      />
    );
  }

  if (!showSite) {
    return (
      <AuthedDashboard
        email={email}
        onLogout={() => {
          localStorage.removeItem(KEY);
          setEmail(null);
        }}
      />
    );
  }

  return <>{children}</>;
}
