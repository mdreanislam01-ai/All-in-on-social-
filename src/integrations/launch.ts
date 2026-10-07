import type { AppIntegration } from './types';

const RETURN_KEY = 'orbit-awaiting-return';
const RETURN_TTL_MS = 1000 * 60 * 60 * 12;

export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

export function isIos(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** A home-screen install has no browser Back button, so the new tab is the safer open. */
export function isStandaloneDisplay(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
    || nav.standalone === true;
}

/**
 * True when this page itself was opened inside another app's built-in browser
 * (WhatsApp, Facebook, Instagram, TikTok, …). Those webviews routinely swallow
 * a navigation to the very service they belong to, which is the only case in
 * which an Android `intent://` link is offered.
 */
export function isInAppBrowser(): boolean {
  return /FBAN|FBAV|Instagram|TikTok|Bytedance|Musical_ly|WhatsApp|Line\/|MicroMessenger/i.test(navigator.userAgent);
}

export function destinationHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url.replace(/^https:\/\//, '').replace(/\/$/, '');
  }
}

/**
 * An `intent://` link that pins the destination to Chrome on Android. It is a
 * last resort for in-app browsers only — never the primary button, because a
 * user already in Chrome gets nothing at all from it.
 */
export function androidChromeIntent(url: string): string {
  const stripped = url.replace(/^https?:\/\//, '');
  return `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
}

export function rememberDeparture(id: AppIntegration['id']): void {
  try {
    sessionStorage.setItem(RETURN_KEY, JSON.stringify({ id, at: Date.now() }));
  } catch {
    // Blocked storage still leaves the browser Back button working.
  }
}

export function peekReturn(): { id: AppIntegration['id']; at: number } | null {
  try {
    const raw = sessionStorage.getItem(RETURN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: AppIntegration['id']; at?: number };
    if (!parsed.id || !parsed.at) return null;
    if (Date.now() - parsed.at > RETURN_TTL_MS) return null;
    return { id: parsed.id, at: parsed.at };
  } catch {
    return null;
  }
}

export function consumeReturn(): AppIntegration['id'] | null {
  const pending = peekReturn();
  try {
    sessionStorage.removeItem(RETURN_KEY);
  } catch {
    // Ignore.
  }
  return pending?.id ?? null;
}

export function clearReturn(): void {
  try {
    sessionStorage.removeItem(RETURN_KEY);
  } catch {
    // Ignore.
  }
}

/**
 * Called from the same-tab anchor, just before the browser follows the real
 * `href`. It leaves one extra history entry pointing at this page so the Back
 * button after login lands here again. Nothing about the destination is
 * touched: this only edits Orbit's own history entry.
 */
export function prepareSameTabOpen(integration: AppIntegration): void {
  try {
    const returnUrl = new URL(window.location.href);
    returnUrl.searchParams.set('space', integration.id);
    returnUrl.searchParams.set('returned', '1');
    window.history.pushState(
      { orbitSpace: integration.id, orbitReturn: true },
      '',
      `${returnUrl.pathname}${returnUrl.search}${returnUrl.hash}`,
    );
  } catch {
    // A rejected pushState must not block the navigation itself.
  }
  rememberDeparture(integration.id);
}
