// Tiny external store for parallax offset — avoids React re-renders on scroll.
type Listener = (offset: number) => void;

let offset = 0;
const listeners = new Set<Listener>();

export const parallaxStore = {
  get: () => offset,
  set: (next: number) => {
    const clamped = Math.max(-600, Math.min(600, next));
    if (clamped === offset) return;
    offset = clamped;
    listeners.forEach((l) => l(offset));
  },
  add: (delta: number) => parallaxStore.set(offset + delta),
  reset: () => parallaxStore.set(0),
  subscribe: (l: Listener) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
