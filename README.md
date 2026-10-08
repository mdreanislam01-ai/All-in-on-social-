# Orbit — Social directory and workspace

A responsive, PWA-ready directory for social networks, messaging, video, communities, and creator tools. Orbit keeps a focused catalog of 45 destinations together with searchable categories, pagination, local bookmarks, recent activity, and five guided social integrations.

Every open control is a real `<a href>` to the destination’s HTTPS website. Orbit does not frame or proxy third-party sites and never collects social passwords. The five guided integrations retain their Bengali phone-opening help, safe same-tab behavior, and optional new-tab links; other directory destinations open in a protected new tab so Orbit stays available.

## Run locally

```bash
npm install
cp .env.example .env.local # optional: configure first-party sign-in
npm run dev
```

Without Supabase values, the app opens in a clearly labelled **preview workspace** with no password or account data stored. Before using real accounts or deploying for users, configure Supabase Auth as described below. Build with `npm run build`.

`npm run verify:links` renders the integration cards, dialogs, open screens, and directory links with `react-dom/server`. It checks the official HTTPS destinations, the same-tab/new-tab rules, Android Chrome intents, the TikTok `/explore` default, and the absence of iframes or provider-password fields. It also simulates the per-device switches (with both off, TikTok opens exactly `https://www.tiktok.com/`). It needs no browser, so it is cheap to run in CI.

## Security and integration boundaries

- **No iframe, anywhere.** Facebook, WhatsApp, Messenger, TikTok and YouTube all refuse framing (`X-Frame-Options`, CSP `frame-ancestors`), so an embedded view can only ever be a broken grey box. Orbit does not proxy those sites, does not strip those headers, and never claims a provider "runs inside Orbit".
- Primary button: `<a href="https://www.facebook.com/">` styled **`{name} খুলুন`**, same tab, no `target`, no `window.open`. After login, one press of the browser Back button returns to this site. (Its label and behaviour are identical everywhere; only on Android and only for the two app-hijacking services is that same-tab href the Chrome-pinned `intent://` described below.)
- Second button: **`নতুন ট্যাবে খুলুন`** with `target="_blank" rel="noopener noreferrer"`, so Orbit stays open. Every guided integration card also keeps a plain **নতুন ট্যাবে** HTTPS link next to the primary, so long-press / copy-link / share can never pick up an intent string. The open screen additionally keeps an in-page **`Orbit-এ ফিরুন`** control, which matters when Orbit is installed to a home screen and there is no Back button.
- **App-link hijacking (Facebook, TikTok):** on Android, those apps steal taps on their own web addresses, so the same-tab link is wrapped in an `intent://…;scheme=https;package=com.android.chrome` URL that pins the open to Chrome. This is per-device and reversible: the open screen's **আমি অ্যাপেই খুলতে চাই** switch restores the plain app behavior (localStorage `orbit-force-chrome`). Desktop, iOS and every other service keep plain HTTPS — no intent anywhere. An extra `intent://` escape hatch is still shown when Orbit itself runs inside another app's browser and the primary is not already an intent.
- **TikTok opens `/explore` by default:** tiktok.com's root insists on the app on phones, so Orbit opens the official `https://www.tiktok.com/explore` (same origin, guaranteed by `openUrlFor()` — anything off-origin falls back to `providerUrl`; no third-party viewers/scrapers). The **মূল ঠিকানা ব্যবহার করুন** switch restores `https://www.tiktok.com/` (localStorage `orbit-web-browser-mode`). The “যে ঠিকানায় খুলবে” box always shows, and copies, the exact URL the buttons will open.
- **খুলতে সমস্যা হলে:** each registry entry carries `appHijacksLinks`, `phoneIssueBn` and `phoneFixBn`, rendered on the open screen as a Bengali "খুলতে সমস্যা হচ্ছে?" panel with the real cause (e.g. Messenger's "অ্যাপ নামাও" wall is Meta's own behavior) and real fixes (Android *Open by default → Don't open*; Chrome *⋮ → Desktop site*). If an intent tap goes nowhere the button flags **খোলে না?** after 1.4s and opens that panel; and any same-tab tap returned from within `SWALLOWED_TAP_MS` (12s) is treated as a swallowed tap, not a visit — the guide screen reopens itself with a toast.
- The five guided integrations stay fixed to their official destinations: `facebook.com`, `web.whatsapp.com`, `messenger.com`, `tiktok.com`, and `youtube.com`. The broader 45-site directory uses hand-written summaries and original monogram marks; non-guided cards open their HTTPS destinations in a protected new tab.
- Search, category counts, featured/A–Z sorting, pagination, and the saved-sites drawer work locally. Saved sites persist on this device, while activity is session-only.
- WhatsApp and Messenger never redirect back after login, so Orbit leaves its own history entry before a same-tab open from the open screen; a card link leaves Back exactly where it was.
- An external visit is **not** treated as an OAuth connection. Connection status stays “Not connected” until a real, verified provider callback is implemented, and Activity records only that a local shortcut was clicked.
- No password field for any provider exists. The only sign-in in the app is Orbit's own optional Supabase email-link flow.
- No third-party password forms, scraped pages, or attempts to bypass provider security are present.
- The registry records each provider’s supported official authorization method, documentation, supported features, and limits. Current integrations are safe external shortcuts plus implementation guidance—not live OAuth/API connections.
- See [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md) before adding a provider API. Each integration needs its own reviewed provider app and a backend for token exchange and storage.

## First-party authentication (optional for preview; required for production users)

The project includes Supabase Auth passwordless email links using the PKCE flow. It never asks for a password. Add these values to `.env.local` and the matching Vercel project environment:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

Then configure the Supabase Auth site URL and the exact allowed redirect URL for each environment. Only use the public/publishable anon key in the browser. Never put a Supabase service-role key, provider client secret, or provider access/refresh token in a `VITE_` variable. Protect any database tables with Row Level Security. See [Supabase passwordless email sign-in](https://supabase.com/docs/guides/auth/auth-email-passwordless).

The default preview account is in-memory only. Theme and saved-site preferences are stored locally on this device; shortcut activity is session-only. Nothing in the demo represents a provider-authenticated account.

## Vercel deployment and free URL

This is a static Vite app with a Vercel SPA rewrite already included in `vercel.json`:

1. Push the repository to your Git provider and import it from the Vercel dashboard.
2. Keep the build command as `npm run build` and output directory as `dist` (Vercel detects Vite automatically).
3. Vercel automatically assigns a deployment URL on its `vercel.app` domain; you do not need to buy a `.com` domain for that URL. See [Vercel’s generated domains](https://vercel.com/docs/domains/working-with-domains).
4. If you enable Supabase Auth, add the production URL to the Supabase redirect allowlist and configure the environment variables in Vercel before redeploying.

Vercel’s free **Hobby** tier is intended for personal, non-commercial use and has usage limits. Check Vercel’s current [Hobby plan details](https://vercel.com/docs/plans/hobby) before using it for a commercial product.

## Project layout

```text
scripts/              verify-open-links.tsx — SSR checks for integrations and directory links
src/
  auth/                 First-party Supabase/email-link auth with preview fallback
  components/           Directory header, cards, bookmarks, provider details, dialogs, toast
  directory/            Original curated catalog and category metadata
  hooks/                PWA install prompt
  integrations/         Typed integration registry, provider metadata, link/return helpers
  pages/                Directory, integrations, activity, settings, sign-in
  App.tsx               App state and responsive shell
  styles.css            Theme tokens, responsive layouts, motion/accessibility
public/
  icons/                App icon
  manifest.webmanifest  Optional installable PWA manifest
  sw.js                 Small same-origin offline app-shell cache (orbit-shell-v4)
```

## Offline cache and releases

`public/sw.js` caches only the app shell and is versioned (`orbit-shell-v4`). Bump `CACHE_NAME` on every release that changes the shell or the open behaviour: `activate` deletes every other cache, which is how a phone holding an older shell throws it away instead of serving it again. `src/main.tsx` also calls `registration.update()` after load so installs check for the new worker immediately instead of waiting for the browser's own polling.

Bengali text uses Noto Sans Bengali (`@fontsource/noto-sans-bengali`) because DM Sans and Manrope have no Bengali glyphs; Bengali blocks are marked `lang="bn"` so line metrics and screen readers stay correct.

## Before turning on provider APIs

Register each app with its official developer program, configure HTTPS redirect URIs, request the minimum scopes, and complete any required review. Implement state/CSRF validation and OAuth code exchange on a server or trusted function. Store provider tokens server-side with access controls and encryption; keep them out of browser storage and logs. Do not claim an account is connected until the callback has been verified and the provider API confirms the granted access.
