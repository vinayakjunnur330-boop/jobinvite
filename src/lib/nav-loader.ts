import { useEffect, useState } from "react";

type Listener = (state: { visible: boolean; label: string }) => void;

let state = { visible: false, label: "Connecting..." };
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l(state));
}

export function showPageLoader(label = "Connecting...") {
  state = { visible: true, label };
  emit();
}

export function hidePageLoader() {
  if (!state.visible) return;
  state = { ...state, visible: false };
  emit();
}

export function usePageLoader() {
  const [s, setS] = useState(state);
  useEffect(() => {
    const l: Listener = (next) => setS(next);
    listeners.add(l);
    l(state);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return s;
}
