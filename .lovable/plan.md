Plan to fix the login flow without changing the blue design:

1. **Make “Send code” send a real OTP experience**
   - Update the email OTP request so it stays in the 6-digit code flow and does not rely on the magic-link callback.
   - Configure the backend auth email template/settings so the email clearly shows the 6-digit code instead of presenting the link as the primary action.
   - Keep the current mobile-safe OTP screen: 6 boxes, numeric keyboard, paste support, auto-submit after 6 digits, resend timer.

2. **Keep magic links out of the normal login page**
   - Password reset can still send a reset link, because that is correct.
   - “Use code instead” will show only the OTP path: send code → enter 6 digits → verify → signed in.

3. **Show the same restored blue login page after Zoiee’s 3 free questions**
   - Remove/avoid the separate dark Zoiee auth modal as the main gate.
   - When the user finishes 3 guest questions, send them to the existing blue `/login` page with a safe return path, so mobile and desktop use one shared working login flow.
   - Preserve the loading mask while navigating so the homepage/chat does not flash behind it.

4. **Social buttons stay as requested**
   - Keep Google and Apple enabled.
   - Keep GitHub and Facebook visible but disabled with “Soon”, so they do not break mobile login.

5. **Verify on mobile and desktop**
   - Test the OTP send state, OTP verify form behavior, password login UI, and Zoiee 3-question gate on a phone-sized viewport and desktop viewport.