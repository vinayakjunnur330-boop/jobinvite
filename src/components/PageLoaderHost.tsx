import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { PageLoader } from "./PageLoader";
import { hidePageLoader, showPageLoader, usePageLoader } from "@/lib/nav-loader";
import { useAuth } from "@/context/AuthContext";

const SAFETY_MS = 6000;

export function PageLoaderHost() {
  const { visible, label } = usePageLoader();
  const status = useRouterState({ select: (s) => s.status });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { loading: authLoading } = useAuth();
  const startPathRef = useRef<string | null>(null);
  const safetyRef = useRef<number | null>(null);

  const clearSafety = () => {
    if (safetyRef.current) {
      window.clearTimeout(safetyRef.current);
      safetyRef.current = null;
    }
  };

  const armSafety = () => {
    clearSafety();
    safetyRef.current = window.setTimeout(() => hidePageLoader(), SAFETY_MS);
  };

  // Auto-show on any router navigation.
  useEffect(() => {
    if (status === "pending") {
      showPageLoader("Loading...");
    }
  }, [status]);

  // Track visibility lifecycle + safety timer.
  useEffect(() => {
    if (visible) {
      startPathRef.current = pathname;
      armSafety();
    } else {
      clearSafety();
    }
    return clearSafety;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Global fail-safes: any runtime error, rejection, or tab-hide must
  // release the loader so users are never stuck on the mask.
  useEffect(() => {
    const dismiss = () => hidePageLoader();
    const onVisibility = () => { if (document.visibilityState === "hidden") dismiss(); };
    window.addEventListener("error", dismiss);
    window.addEventListener("unhandledrejection", dismiss);
    window.addEventListener("pageshow", dismiss);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("error", dismiss);
      window.removeEventListener("unhandledrejection", dismiss);
      window.removeEventListener("pageshow", dismiss);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Hide once the router is idle AND auth has resolved — prevents the brief
  // signed-in/out UI mismatch after navigation.
  useEffect(() => {
    if (!visible) return;
    if (status !== "idle") return;
    if (authLoading) return;
    const t = window.setTimeout(() => hidePageLoader(), 80);
    return () => window.clearTimeout(t);
  }, [status, pathname, visible, authLoading]);

  if (!visible) return null;
  return <PageLoader label={label} />;
}
