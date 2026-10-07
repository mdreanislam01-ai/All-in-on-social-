# Official integration notes

Every provider used by Orbit refuses to be framed, so the app has no iframe at all: there is nothing to probe, nothing that can render a grey broken page, and no claim that a provider site is "running inside Orbit". Each card, dialog and open screen renders the provider's official HTTPS address as a plain `<a href>`.

Two open behaviours are intentional:

- **Same tab (primary, `{name} খুলুন`)** — no `target`, no `window.open`, no `intent://`. The browser Back button is the return path, which is why `prepareSameTabOpen()` reserves one Orbit history entry before the click is allowed to navigate when the open screen itself is the caller.
- **New tab (`নতুন ট্যাবে খুলুন`)** — `target="_blank" rel="noopener noreferrer"`, so Orbit stays open behind it. This is also the recommended path when Orbit runs as an installed PWA, where no Back button exists.

Orbit never proxies a provider, never strips `X-Frame-Options` or CSP `frame-ancestors`, never reproduces a login page, and never asks for or stores a social password. A visit is never treated as an API connection: `status` in the registry is static and only a verified provider callback could ever change it.

## Current service registry

| Service | Official web destination | Official integration method | Scope and boundary |
| --- | --- | --- | --- |
| Facebook | [facebook.com](https://www.facebook.com/) | [Facebook Login for the Web](https://developers.facebook.com/documentation/facebook-login/web) (Meta SDK/OAuth) | Sign-in and only the Graph API data permitted by the granted/reviewed permissions. This is not an embedded Facebook site or a personal-feed mirror. |
| WhatsApp | [web.whatsapp.com](https://web.whatsapp.com/) | [WhatsApp Business Platform Embedded Signup](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview) and Cloud API | Business asset onboarding and supported business messaging. Do not present this as consumer WhatsApp Web or personal-inbox synchronization. Embedded Signup requires a configured Meta app and server-side post-flow/token handling. |
| Messenger | [messenger.com](https://www.messenger.com/) | [Messenger Platform](https://developers.facebook.com/documentation/business-messaging/messenger-platform) | Official business/Page messaging and related API workflows subject to Page access and permissions—not a personal Messenger inbox mirror. |
| TikTok | [tiktok.com](https://www.tiktok.com/) | [Login Kit](https://developers.tiktok.com/docs/en/login-kit-overview) (OAuth 2.0) and approved [Display API](https://developers.tiktok.com/docs/en/display-api-overview) capabilities | Consented/approved profile and video data only. This is not an embedded TikTok website. Web authorization code exchange belongs on a backend. |
| YouTube | [youtube.com](https://www.youtube.com/) | [YouTube Data API v3](https://developers.google.com/youtube/v3/docs) with [OAuth 2.0](https://developers.google.com/youtube/v3/guides/authentication) via Google Identity Services; [YouTube Analytics and Reporting APIs](https://developers.google.com/youtube/reporting/v1/introduction) need extra scopes | Channel, playlist and video resources limited to granted scopes, under a Google Cloud project with an approved consent screen and quota. Sign-in is a Google account, not a YouTube password. `youtube.com` will not frame; the only supported embed is the official player (`youtube-nocookie.com`), which is a video player, not the site or a login page. |

Docs and API approvals change. Re-check each provider’s current terms, product configuration, permissions, review requirements, and API version before shipping a connector. In particular, use the currently supported version of any Meta Embedded Signup flow.

## Integration adapter contract

`src/integrations/types.ts` and `src/integrations/registry.ts` are the reusable catalog used by the dashboard, detail dialog, settings, and activity view. New services can be added as registry entries; real connections should be separate adapters with explicit states (`not-connected`, `connected`, `needs-reauthorization`, `error`).

A production adapter should:

1. Start an official provider-hosted OAuth/login flow using an exact HTTPS redirect allowlist and an unpredictable state/CSRF value.
2. Validate state and exchange authorization codes on a trusted backend (use PKCE wherever the provider supports it). Never expose client secrets in frontend bundles.
3. Request only the scopes needed for a clearly described feature and handle partial/denied permissions.
4. Store and refresh tokens only server-side with encryption, access controls, and safe redaction in logs. Do not put tokens in `localStorage` or `sessionStorage`.
5. Mark an integration connected only after validating the callback and provider response. Implement revoke/disconnect, expiry, reauthorization, deletion, and error states.
6. Use a provider-approved SDK/embed only where documentation explicitly permits it. Otherwise link to the provider website and retain a visible path back to the dashboard.
7. Keep an open control a real anchor. A `<button onClick>` that calls `window.open` is blocked as a "fake popup", and `location.assign()` inside a handler loses user-gesture status on some Android in-app browsers, so the tap looks dead. Anchors survive all of that and keep long-press, copy-link and Back behaving normally.

## Adding a platform

A new service is one registry entry: `id`, `name`, `description`, `descriptionBn`, `providerUrl`, accents, official method/features/limits, `openNoteBn`, `returnNoteBn`, `officialDocsUrl`, and `status: 'not-connected'`. Then add its `BrandIcon` glyph plus `.mark-<id>`/`.float-<id>` styles. Everything else — cards, open screen, dialog, settings list, activity, auth art, counts — reads from the registry, which is why YouTube needed no new UI code.

`npm run verify:links` (`scripts/verify-open-links.tsx`) asserts the rules for every registry entry: exact official `href`, primary link with no `target`, no iframe, no password input, no `intent://` outside an in-app browser, and no "inside Orbit" wording. Add the new address to its `expected` map so a typo in `providerUrl` fails the build.

## Third-party service accounts are never website passwords

Orbit does not ask for Facebook, WhatsApp, Messenger, TikTok or YouTube/Google passwords. The only account sign-in shown by Orbit itself is the optional Supabase passwordless email-link flow for the Orbit workspace.
