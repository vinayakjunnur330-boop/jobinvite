## Plan: Restore social login buttons on `/login`

### Goal
Bring back Google, Apple, GitHub, and Facebook social-login buttons on the existing blue glassmorphic `/login` page. Only Google and Apple will be functional; GitHub and Facebook will be visually present but disabled with a clear "Coming soon" state so the page never breaks on mobile or desktop.

### Why this approach
- Lovable Cloud natively supports **Google** and **Apple** OAuth.
- **GitHub and Facebook** are not natively supported in Lovable Cloud. The previous removal was to prevent runtime errors. Showing them as disabled satisfies the UI request without breaking the auth flow.

### Changes

1. **Update `src/routes/login.tsx`**
   - Replace the single Google button with a 2×2 grid of social buttons: Google, Apple, GitHub, Facebook.
   - Keep the existing blue glassmorphic styling and mobile-safe `h-12` heights.
   - Wire Google and Apple to `lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth/callback" })`.
   - Render GitHub and Facebook as disabled buttons with a tooltip or inline "Coming soon" label.
   - Preserve loading states (`oauthBusy`) for active providers.

2. **Enable Apple provider in backend**
   - Call `supabase--configure_social_auth` with `providers: ["google", "apple"]` so Apple Sign In is active in Supabase Auth.

3. **Verify mobile layout**
   - Ensure the 2×2 grid collapses cleanly on narrow screens (use responsive grid columns and gap).
   - Confirm button text/icon remains tappable and no overlay (e.g., `GuestConcierge`) blocks the buttons on `/login`.

### Out of scope
- No functional GitHub/Facebook OAuth implementation (not supported by Lovable Cloud managed auth).
- No changes to email/password or OTP flows.
- No redesign of the blue glassmorphism aesthetic.

### Acceptance criteria
- `/login` shows four social buttons: Google, Apple, GitHub, Facebook.
- Google and Apple log the user in end-to-end on mobile and desktop.
- GitHub and Facebook are disabled and show a "Coming soon" indicator.
- No auth errors or broken redirects on mobile.