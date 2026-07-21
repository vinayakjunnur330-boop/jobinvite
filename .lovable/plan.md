## Goal
Kill the homepage flash when clicking "Sign In" and cover the transition with a minimalist geometric loader (Apple/Linear style).

## Root cause
The Navbar's "Sign In" uses TanStack `<Link to="/login">`. Client-side navigation is fast but the login route lazy-loads; during that gap the home page remains painted → the "flash". No transition mask exists.

## Changes

### 1. New `src/components/PageLoader.tsx`
Framer Motion loader exactly as specified: full-screen `#050505` overlay, `z-[9999]`, tumbling white block + floating orb + "Connecting..." caption. Accepts optional `label` prop (default "Connecting...") so it can be reused for other transitions.

### 2. New `src/lib/nav-loader.ts`
Tiny event-bus store (subscribe/emit pattern, no deps) exposing:
- `showPageLoader(label?)` — mounts loader immediately
- `hidePageLoader()` — unmounts
- `usePageLoader()` hook returning `{ visible, label }`

This lets any button trigger the mask synchronously on click (before navigation resolves).

### 3. New `src/components/PageLoaderHost.tsx`
Subscribes to the store and renders `<PageLoader />` when visible. Auto-hides on route change completion by listening to `useRouterState({ select: s => s.status })` — hides once status returns to `"idle"` on a new pathname. Safety timeout (max 4s) to avoid a stuck loader.

Mounted once inside `RootAppContent` in `src/routes/__root.tsx` (above `<Toaster />`).

### 4. Wire "Sign In" (and Sign Up) in `src/components/Navbar.tsx`
Replace the `<Link to="/login">` sign-in trigger(s) with a button/Link whose `onClick` calls `showPageLoader()` immediately, then navigates via `useNavigate()`. Same for mobile menu variant. This paints the black loader on the same frame as the click, so the home page never shows through.

### 5. Also cover `<Link to="/login">` in `FuturisticHero` CTA area if it links to auth (verify during build; only patch auth-bound links, nothing else).

## Out of scope
- No changes to auth logic, login page content, or business logic.
- No global route-transition mask on every navigation — only auth-entry buttons, per the reported flash.

## Verification
- Click Sign In on desktop + mobile viewports via Playwright; capture frames to confirm no white/home paint between click and login route.
- Confirm loader unmounts once `/login` renders.
