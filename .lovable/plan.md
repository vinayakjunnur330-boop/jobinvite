# Plan: Parallax Chat Sync + Career-Aware Link Engine

## 1. Career Context (global state)

Create `src/contexts/CareerContext.tsx`:
- `CareerKey = "frontend" | "cybersecurity" | "data-science" | "ai-ml" | "product"`
- Provider with `active`, `setActive(key, originEvent?)`, persisted in `localStorage`.
- Holds a `ripple` `{x,y,id}` triggered on change so any surface can render it.

Create `src/lib/career-links.ts` — typed registry per career:
```ts
{
  label, accent, icon,
  learning: { href, label, thumb },
  videos:   { href, label, thumb },
  network:  { href, label, icon },
  community:{ href, label, icon },
  socials:  [{ platform, href, handle }]
}
```
Curated real URLs (e.g. frontend → roadmap.sh/frontend, Kevin Powell YT, GitHub topic UI; cybersecurity → tryhackme.com, HackTheBox, John Hammond YT, Discord invites; etc.).

Wrap `RootComponent` in `__root.tsx` with `<CareerProvider>`.

## 2. Parallax Slide-Sync background

New `src/components/ParallaxBackdrop.tsx`:
- Fixed full-viewport layer behind app content (z-0). Two-three radial gradient orbs + particle canvas/SVG dots.
- Reads scroll offset from a shared store (`useParallaxStore` — tiny Zustand or `useSyncExternalStore` module with `setOffset(dy)`).
- Each layer translates `Y` with different damping factors (0.15, 0.3, 0.5) using `framer-motion`'s `useSpring` for smooth damped follow.

Mount `<ParallaxBackdrop />` once inside `RootComponent` (above `<Navbar/>`, behind `<main>`).

## 3. Chat panel refactor

Update `src/components/ChatWidget.tsx`:
- Convert from floating popover to **slide-out right side panel** (`framer-motion` x-translate, width 420px, full height, glass).
- Add `onScroll` to the messages `scrollRef`: compute delta vs lastScrollTop, push into parallax store (`setOffset(prev + delta * 0.6)`), clamped.
- Support touch drag scroll already native; same handler covers both.
- Reset offset on panel close with spring back to 0.

## 4. Career-aware link components

New components consuming `useCareer()`:
- `src/components/CareerSwitcher.tsx` — pill row of careers; click triggers ripple at pointer coords + `setActive`.
- `src/components/ResourceCards.tsx` — Learning / Videos / Network / Community cards, wrapped in `<AnimatePresence mode="wait">` keyed by `active`, fade+flip transition.
- `src/components/SocialLinks.tsx` — used in `Footer`; same AnimatePresence pattern, swaps icons/handles per career.

All anchors: `target="_blank" rel="noopener noreferrer"`.

## 5. Integration points

- `Footer.tsx`: replace static social block with `<SocialLinks />`; add small "Resources tuned for: {career}" label.
- `routes/index.tsx`: add `<CareerSwitcher />` + `<ResourceCards />` section on homepage.
- `routes/dashboard.tsx` & `routes/roadmap.tsx`: career cards call `setActive` with click event → ripple.
- Ripple: shared `<RippleLayer />` rendered at body level, listens to context `ripple` and animates scale 0→1 opacity 0.6→0 over 600ms at click coords.

## 6. Files touched

Created:
- `src/contexts/CareerContext.tsx`
- `src/lib/career-links.ts`
- `src/components/ParallaxBackdrop.tsx`
- `src/components/CareerSwitcher.tsx`
- `src/components/ResourceCards.tsx`
- `src/components/SocialLinks.tsx`
- `src/components/RippleLayer.tsx`
- `src/lib/parallax-store.ts`

Edited:
- `src/routes/__root.tsx` (providers + backdrop + ripple layer)
- `src/components/ChatWidget.tsx` (slide-out + scroll sync)
- `src/components/Footer.tsx` (dynamic socials)
- `src/routes/index.tsx` (switcher + resource cards section)
- `src/routes/dashboard.tsx`, `src/routes/roadmap.tsx` (career click handlers)

## 7. Technical notes

- Parallax store kept outside React render path → no re-renders on scroll; only motion values update.
- Damping via `useSpring(value, { stiffness: 80, damping: 20 })`.
- Reduced-motion: respect `prefers-reduced-motion` → disable parallax translate & ripple scale.
- All link URLs vetted, no placeholders.
