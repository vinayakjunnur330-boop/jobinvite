I found the main blocker: the app code is already trying to render an OTP-only email, but the sender domain is still pending DNS verification. Until that completes, auth emails can continue falling back to the default link-style email.

Plan:
1. Keep the current restored blue login page design unchanged.
2. Make the OTP send request explicitly request an email OTP flow and remove redirect-link options from that OTP-only call, so the auth provider sends/uses a code instead of a magic-link redirect.
3. Re-check the custom OTP email template and webhook path so the “magiclink” auth email body renders only the 6-digit code and no clickable link.
4. Keep password reset/signup confirmation links working, because those flows legitimately need links.
5. After the code fix, you will still need to finish the email DNS setup for `notify.rolehub.com`; otherwise default link emails may keep appearing before the custom OTP email activates.

Required DNS records still pending:
- TXT `_lovable-email.rolehub.com`
- NS `notify.rolehub.com` to `ns3.lovable.cloud`
- NS `notify.rolehub.com` to `ns4.lovable.cloud`