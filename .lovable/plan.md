## Problem

On the home page, the animated aurora orbs, particle field, cursor spotlight, and grid overlay (the "bubbles / dynamic effects") disappear for **guest users on mobile**, and the entire main content (Navbar, Hero, Footer, ChatWidget) is also being suppressed on mobile in that state.

## Root cause

In `src/routes/__root.tsx`, `RootAppContent` computes:

```ts
const suspendMobileUnderlay = isMobile && !loading && !isAuthenticated && !onAuthRoute;
```

and then uses it to gate BOTH `<AmbientBackground />` and the entire `<Navbar/> <Outlet/> <Footer/> <ChatWidget/>` block. This was originally added to reduce mobile paint cost behind the Zoiee overlay, but it now removes the ambient visuals (and the hero itself) for every unauthenticated mobile visitor.

`AmbientBackground.tsx` already has its own, correct pause mechanism (`usePauseForMobileZoieeOverlay`) that only disables the backdrop while the Zoiee chat overlay is actively open on mobile — so the root-level guard is redundant and destructive.

## Fix

Edit `src/routes/__root.tsx` only:

1. Delete the `useIsMobileViewport` hook and its usage.
2. Remove `suspendMobileUnderlay` and always render `<AmbientBackground />` plus the `<Navbar/> <main><Outlet/></main> <Footer/> <ChatWidget/>` block.
3. Keep the existing `!onAuthRoute` guard on `<GuestConcierge />`.
4. Leave `AmbientBackground.tsx`, `FuturisticHero.tsx`, `NeuralCanvas.tsx`, and `ParticleField.tsx` untouched — they already handle mobile (NeuralCanvas is desktop-only by design; orbs + particle field remain on mobile) and reduced-motion correctly.

## Verification

- Load `/` on mobile viewport (392×788) as a guest: aurora orbs, particle field, cursor spotlight, and grid overlay are visible behind the hero; Navbar, Hero, Footer, ChatWidget all render.
- Load `/` on desktop: unchanged — NeuralCanvas + orbs both present.
- Open Zoiee chat on mobile: `AmbientBackground` still pauses via its internal `zoiee-overlay-active` check (no regression).
- `/login` on mobile: unchanged (auth route path already excluded).
