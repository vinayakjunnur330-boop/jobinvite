// Tiny pub/sub used to show the full-screen splash gate whenever a
// chat-opening button is pressed. Keeps underlying content from flashing
// while the chat surface mounts / initializes.

type Listener = (active: boolean) => void;

const listeners = new Set<Listener>();
let active = false;
let hideTimer: number | null = null;

function emit() {
  for (const l of listeners) l(active);
}

export function subscribeChatGate(l: Listener) {
  listeners.add(l);
  l(active);
  return () => {
    listeners.delete(l);
  };
}

/**
 * Show the chat-opening splash gate. The gate is hidden automatically after
 * `duration` ms — enough time for the target chat surface to mount and cover
 * the underlying page. Calling again resets the timer.
 */
export function openChatGate(duration = 550) {
  if (typeof window === "undefined") return;
  active = true;
  emit();
  if (hideTimer !== null) window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    active = false;
    hideTimer = null;
    emit();
  }, duration);
}

export function closeChatGate() {
  if (hideTimer !== null && typeof window !== "undefined") {
    window.clearTimeout(hideTimer);
    hideTimer = null;
  }
  active = false;
  emit();
}
