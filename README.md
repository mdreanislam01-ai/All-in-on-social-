# Orbit — Social directory

Orbit is a single-page directory of social networks, messaging apps, video platforms, creator tools, and community sites. Each entry opens the service's official website in a new tab.

## Features

- Search by name, description, or category
- Category filter chips with live counts
- 48 sites per page with numbered pagination
- Bookmarks saved on this device (localStorage), with a drawer to open or remove them
- Single-page behaviour: no sign-in, no iframes, no proxying of third-party sites
- Installable as a PWA with a small offline app-shell cache (`public/sw.js`)

## Run locally

```bash
npm install
npm run dev
```

Build for production with `npm run build`, then preview with `npm run preview`.

## Project layout

```text
src/
  App.tsx                 search, categories, pagination, bookmarks, menu
  components/             site card, logo, pagination, bookmark drawer, about dialog
  directory/catalog.ts    curated site list and category names
  directory/filter.ts     filtering, counts, and pagination helpers
  lib/storage.ts          localStorage helpers for bookmarks
  styles.css              theme tokens and responsive layout
public/
  icons/                  app icons
  manifest.webmanifest    PWA manifest
  sw.js                   app-shell cache (bump CACHE_NAME when the shell changes)
```

## Deployment

The project is a static Vite app. `vercel.json` contains the SPA rewrite and basic security headers. Deploy with the build command `npm run build` and output directory `dist`.
