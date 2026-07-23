## Problem
In `src/components/ChatWidget.tsx`, chat bubbles use hardcoded dark-mode classes:
- Assistant: `bg-white/5 text-white/90 border-white/10` — near-invisible on white bg in light mode.
- Suggested-question buttons: `bg-white/5 text-white/80` — same issue.
- Header uses `text-white`, `text-white/60` — invisible on light glass panel.
- Input: `text-white placeholder:text-white/40` — invisible when typing in light mode.
- Inline `<code>` in `renderMd` uses `bg-white/10` — invisible.

The chat window container itself (`bg-white/[0.03]`) is also fine only in dark mode.

## Fix
Add `dark:` prefixes to the current white-on-dark classes and add light-mode counterparts using neutral tokens so contrast is legible in both themes. Scope changes strictly to `ChatWidget.tsx` (and the `renderMd` inline code class within it).

Specifically:
- Window shell: `bg-white/80 dark:bg-white/[0.03]`, border `border-neutral-200 dark:border-white/10`.
- Header text: `text-neutral-900 dark:text-white`; muted `text-neutral-500 dark:text-white/60`.
- Assistant bubble: `bg-neutral-100 text-neutral-900 border-neutral-200 dark:bg-white/5 dark:text-white/90 dark:border-white/10`.
- User bubble: keep `bg-primary text-primary-foreground` (already themed).
- Suggested chips: light neutrals + existing dark classes.
- Input: `text-neutral-900 placeholder:text-neutral-500 bg-white dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/40`, border similarly.
- Voice/close buttons: `text-neutral-600 hover:text-neutral-900 dark:text-white/70 dark:hover:text-white`.
- `renderMd` `<code>`: `bg-neutral-200 text-neutral-900 dark:bg-white/10 dark:text-white/90`.
- Streaming caret `▍`: relies on bubble text color, so inherits fix.

No logic changes; presentation only.