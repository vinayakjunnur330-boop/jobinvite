## Plan: send only a 6-digit verification code

1. **Lock login OTP to code flow**
   - Keep the login button using the email OTP flow.
   - Keep the OTP screen copy code-only, with no magic-link instructions.

2. **Make auth emails code-only**
   - Ensure both login OTP and new-user signup verification emails render only the 6-digit code.
   - Do not pass confirmation/login URLs into these OTP templates.
   - Keep password reset emails as links, because password reset requires the reset page.

3. **Tighten email wording**
   - Change the signup email subject from “Confirm your email” to a code-focused subject like “Your CareerPilot AI verification code”.
   - Keep fallback text telling users to request a new code if no token is available, not to click a link.

4. **Verify with preview**
   - Use the existing email preview page to confirm both Login OTP and Signup OTP contain a 6-digit code and no `https://` link in the plain-text body.

5. **Required DNS step**
   - The sender domain `notify.rolehub.com` is currently still pending DNS verification. Until that is completed, the platform can continue sending the default `email.auth.lovable.cloud` link email instead of the custom code-only template.
   - The exact pending records are:

```text
TXT  _lovable-email.rolehub.com  lovable_email_verify=cfd7fb4984c658fdf125e714d56cba9db67931764cfe132eab1ab1ff6292bb76
NS   notify.rolehub.com          ns3.lovable.cloud
NS   notify.rolehub.com          ns4.lovable.cloud
```

After you approve, I’ll apply the remaining code hardening and re-check the preview output.