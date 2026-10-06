# Orbit — All-in-one social dashboard

A responsive, PWA-ready browser dashboard for opening Facebook, WhatsApp, Messenger and TikTok from one calm workspace. Orbit always sends users to the official platform for sign-in; it does not embed, scrape, or imitate social websites.

## Run locally

```bash
npm install
cp .env.example .env.local # optional: configure first-party sign-in
npm run dev
```

Without Supabase values, the app opens in a clearly labelled **preview workspace** with no password or account data stored. Before using real accounts or deploying for users, configure Supabase Auth as described below. Build with `npm run build`.

## Security and integration boundaries

- Social cards open the official websites in a new, isolated browser tab. The dashboard stays open so users can return when finished.
- An external visit is **not** treated as an OAuth connection. Connection status stays “Not connected” until a real, verified provider callback is implemented.
- No third-party password forms, hidden iframes, scraped pages, or attempts to bypass provider security are present.
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
  sw.js                 Small same-origin offline app-shell cache
```

## Before turning on provider APIs

Register each app with its official developer program, configure HTTPS redirect URIs, request the minimum scopes, and complete any required review. Implement state/CSRF validation and OAuth code exchange on a server or trusted function. Store provider tokens server-side with access controls and encryption; keep them out of browser storage and logs. Do not claim an account is connected until the callback has been verified and the provider API confirms the granted access.
