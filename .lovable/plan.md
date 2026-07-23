## Plan: make OTP emails code-only

1. **Force OTP-only auth email content**
   - Update the auth email webhook so `signup` and `magiclink` emails render only the 6-digit token when a token exists.
   - Add a safe fallback message if the backend sends no token, instead of rendering any confirmation link.

2. **Remove link language from login OTP flow**
   - Remove the helper text that tells users to click a magic link.
   - Make the OTP screen copy say only: enter the 6-digit code sent to your email.

3. **Keep password reset links separate**
   - Password reset must still use a link because that flow needs `/reset-password`.
   - Only sign-in/sign-up OTP emails will be code-only.

4. **Important domain requirement**
   - Your email domain `notify.rolehub.com` is still pending DNS verification. Until DNS is completed, the platform may continue sending default link emails instead of your custom OTP template.
   - The required DNS records are visible in Project Settings → Email.

5. **Verify**
   - Re-check the preview/test email page after changes to confirm the signup and magic-link templates contain the 6-digit code and no clickable auth link.