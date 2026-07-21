import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { PageLoader } from "./PageLoader";
import { hidePageLoader, usePageLoader } from "@/lib/nav-loader";

export function PageLoaderHost() {
  const { visible, label } = usePageLoader();
  const status = useRouterState({ select: (s) => s.status });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const startPathRef = useRef<string | null>(null);
  const safetyRef = useRef<number | null>(null);

  useEffect(() => {
    if (visible) {
      startPathRef.current = pathname;
      if (safetyRef.current) window.clearTimeout(safetyRef.current);
      safetyRef.current = window.setTimeout(() => hidePageLoader(), 4000);
    } else {
      if (safetyRef.current) {
        window.clearTimeout(safetyRef.current);
        safetyRef.current = null;
      }
    }
    return () => {
      if (safetyRef.current) {
        window.clearTimeout(safetyRef.current);
        safetyRef.current = null;
      }
    };
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!visible) return;
    if (status === "idle" && startPathRef.current && pathname !== startPathRef.current) {
      // Give the new route a frame to paint before removing the mask.
      const t = window.setTimeout(() => hidePageLoader(), 60);
      return () => window.clearTimeout(t);
    }
  }, [status, pathname, visible]);

  if (!visible) return null;
  return <PageLoader label={label} />;
}
