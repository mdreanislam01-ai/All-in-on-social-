# Official integration notes

The current app was designed around provider-hosted authentication and documented APIs. Each card opens Orbit’s own open screen, which hands the visitor two real `https://` links to the official website: one in the same tab (the browser back button returns to Orbit) and one in a new tab. **The app contains no iframe at all.** Facebook, WhatsApp, Messenger and TikTok all send `X-Frame-Options` or CSP `frame-ancestors`, so an embedded frame can only ever show a broken page; Orbit does not proxy those sites, does not remove or rewrite those headers, and does not ask for or store provider passwords. An Android Chrome `intent://` escape hatch is offered only when Orbit itself is displayed inside another app’s browser, and it always keeps the `https://` URL as `S.browser_fallback_url`. A visit is never treated as an API connection.

## Current service registry

| Service | Official web destination | Official integration method | Scope and boundary |
| --- | --- | --- | --- |
| Facebook | [facebook.com](https://www.facebook.com/) | [Facebook Login for the Web](https://developers.facebook.com/documentation/facebook-login/web) (Meta SDK/OAuth) | Sign-in and only the Graph API data permitted by the granted/reviewed permissions. This is not an embedded Facebook site or a personal-feed mirror. |
| WhatsApp | [web.whatsapp.com](https://web.whatsapp.com/) | [WhatsApp Business Platform Embedded Signup](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview) and Cloud API | Business asset onboarding and supported business messaging. Do not present this as consumer WhatsApp Web or personal-inbox synchronization. Embedded Signup requires a configured Meta app and server-side post-flow/token handling. |
| Messenger | [messenger.com](https://www.messenger.com/) | [Messenger Platform](https://developers.facebook.com/documentation/business-messaging/messenger-platform) | Official business/Page messaging and related API workflows subject to Page access and permissions—not a personal Messenger inbox mirror. |
| TikTok | [tiktok.com](https://www.tiktok.com/) | [Login Kit](https://developers.tiktok.com/docs/en/login-kit-overview) (OAuth 2.0) and approved [Display API](https://developers.tiktok.com/docs/en/display-api-overview) capabilities | Consented/approved profile and video data only. This is not an embedded TikTok website. Web authorization code exchange belongs on a backend. |

Docs and API approvals change. Re-check each provider’s current terms, product configuration, permissions, review requirements, and API version before shipping a connector. In particular, use the currently supported version of any Meta Embedded Signup flow.

## Integration adapter contract

`src/integrations/types.ts` and `src/integrations/registry.ts` are the reusable catalog used by the dashboard, detail dialog, settings, and activity view. New services can be added as registry entries; real connections should be separate adapters with explicit states (`not-connected`, `connected`, `needs-reauthorization`, `error`).

A production adapter should:

1. Start an official provider-hosted OAuth/login flow using an exact HTTPS redirect allowlist and an unpredictable state/CSRF value.
2. Validate state and exchange authorization codes on a trusted backend (use PKCE wherever the provider supports it). Never expose client secrets in frontend bundles.
3. Request only the scopes needed for a clearly described feature and handle partial/denied permissions.
4. Store and refresh tokens only server-side with encryption, access controls, and safe redaction in logs. Do not put tokens in `localStorage` or `sessionStorage`.
5. Mark an integration connected only after validating the callback and provider response. Implement revoke/disconnect, expiry, reauthorization, deletion, and error states.
6. Use a provider-approved SDK/embed only where documentation explicitly permits it. Otherwise open the provider website in a new tab and retain a visible path back to the dashboard.

## Third-party service accounts are never website passwords

Orbit does not ask for Facebook, WhatsApp, Messenger, or TikTok passwords. The only account sign-in shown by Orbit itself is the optional Supabase passwordless email-link flow for the Orbit workspace.
