# Orbit — All-in-one social dashboard

A responsive, PWA-ready browser dashboard for opening Facebook, WhatsApp, Messenger and TikTok from one calm workspace. Every open button is a real `https://` link to the official site. Orbit does not frame, proxy, or mirror those platforms, does not copy login pages, and does not bypass their framing protections.

## Run locally

```bash
npm install
cp .env.example .env.local # optional: configure first-party sign-in
npm run dev
```

Without Supabase values, the app opens in a clearly labelled **preview workspace** with no password or account data stored. Before using real accounts or deploying for users, configure Supabase Auth as described below. Build with `npm run build`.

## How opening a platform works

Each card opens Orbit’s own open screen for that platform. There is no iframe anywhere in the app: Facebook, WhatsApp, Messenger and TikTok all send `X-Frame-Options` / CSP `frame-ancestors`, so a frame could only ever show “Your request couldn't be processed” or a blank page. The open screen instead shows two real links and Bengali instructions:

| Button | Behaviour |
| --- | --- |
| **{name} খুলুন** | Plain `https://` link, same tab, no `target="_blank"`. Finish your work on the official site, then press the browser **Back** button to land back on this page. |
| **নতুন ট্যাবে খুলুন** | Same `https://` link with `target="_blank" rel="noopener noreferrer"`, so Orbit stays open in its own tab. |
| **Chrome-এ খুলুন** | Android Chrome `intent://` link, shown **only** when Orbit itself is opened inside another app’s browser (WhatsApp, Facebook, Instagram, TikTok, or an Android WebView). It always carries the `https://` URL as `S.browser_fallback_url`, so a device without Chrome still reaches the official site. |

## Security and integration boundaries

- Orbit never frames, proxies, mirrors, or re-hosts a provider page, and it never strips `X-Frame-Options` or CSP `frame-ancestors`.
- There are no third-party password forms and Orbit never asks for, reads, or stores a Facebook, WhatsApp, Messenger or TikTok password. Sign-in always happens on the official site.
- An external visit is **not** treated as an OAuth connection. Connection status stays “Not connected” until a real, verified provider callback is implemented, and the open screen says so in Bengali as well.
- No scraped pages, mirrored feeds, or attempts to bypass provider security are present.
- The registry records each provider’s supported official authorization method, documentation, supported features, and limits. Current integrations are safe external shortcuts plus implementation guidance—not live OAuth/API connections.
- See [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md) before adding a provider API. Each integration needs its own reviewed provider app and a backend for token exchange and storage.

## First-party authentication (optional for preview; required for production users)

The project includes Supabase Auth passwordless email links using the PKCE flow. It never asks for a password. Add these values to `.env.local` and the matching Vercel project environment:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

Then configure the Supabase Auth site URL and the exact allowed redirect URL for each environment. Only use the public/publishable anon key in the browser. Never put a Supabase service-role key, provider client secret, or provider access/refresh token in a `VITE_` variable. Protect any database tables with Row Level Security. See [Supabase passwordless email sign-in](https://supabase.com/docs/guides/auth/auth-email-passwordless).

The default preview account is in-memory only. Theme preference is stored locally, and shortcut activity is session-only. Nothing in the demo represents a provider-authenticated account.

## Vercel deployment and free URL

This is a static Vite app with a Vercel SPA rewrite already included in `vercel.json`:

1. Push the repository to your Git provider and import it from the Vercel dashboard.
2. Keep the build command as `npm run build` and output directory as `dist` (Vercel detects Vite automatically).
3. Vercel automatically assigns a deployment URL on its `vercel.app` domain; you do not need to buy a `.com` domain for that URL. See [Vercel’s generated domains](https://vercel.com/docs/domains/working-with-domains).
4. If you enable Supabase Auth, add the production URL to the Supabase redirect allowlist and configure the environment variables in Vercel before redeploying.

Vercel’s free **Hobby** tier is intended for personal, non-commercial use and has usage limits. Check Vercel’s current [Hobby plan details](https://vercel.com/docs/plans/hobby) before using it for a commercial product.

## Project layout

```text
src/
  auth/                 First-party Supabase/email-link auth with preview fallback
  components/           Reusable app cards, provider marks, dialogs, nav, toast
  hooks/                PWA install prompt
  integrations/         Typed integration registry and provider metadata
  pages/                Overview, integrations, activity, settings, sign-in
  App.tsx               App state and responsive shell
  styles.css            Theme tokens, responsive layouts, motion/accessibility
public/
  icons/                App icon
  manifest.webmanifest  Optional installable PWA manifest
  sw.js                 Small same-origin offline app-shell cache (bump CACHE_NAME when deploying)
```

## Before turning on provider APIs

Register each app with its official developer program, configure HTTPS redirect URIs, request the minimum scopes, and complete any required review. Implement state/CSRF validation and OAuth code exchange on a server or trusted function. Store provider tokens server-side with access controls and encryption; keep them out of browser storage and logs. Do not claim an account is connected until the callback has been verified and the provider API confirms the granted access.
