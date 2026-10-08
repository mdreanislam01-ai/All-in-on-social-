import type { AppIntegration } from './types';

const RETURN_KEY = 'orbit-awaiting-return';
const RETURN_TTL_MS = 1000 * 60 * 60 * 12;

/**
 * A same-tab visit that brings you back to Orbit within this window never
 * actually opened: the phone swallowed the tap (an app link went nowhere, or
 * an in-app browser ate the navigation). App.tsx treats such a fast return as
 * a stuck open, not as a visit, and reopens the guide screen with help.
 */
export const SWALLOWED_TAP_MS = 12_000;

/** Per-device preferences, kept in localStorage so they survive sessions. */
const FORCE_CHROME_KEY = 'orbit-force-chrome';
const WEB_MODE_KEY = 'orbit-web-browser-mode';

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
 * which an Android `intent://` link is offered for non-hijacking services.
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
 * Whether this device should pin hijacking links (Facebook, TikTok) to Chrome
 * via an `intent://` URL instead of letting the installed app steal the tap.
 * Default ON — that is the fix, off means "I want to open in the app".
 */
export function isChromeForcingEnabled(): boolean {
  try {
    return localStorage.getItem(FORCE_CHROME_KEY) !== '0';
  } catch {
    return true;
  }
}

export function setChromeForcing(enabled: boolean): void {
  try {
    localStorage.setItem(FORCE_CHROME_KEY, enabled ? '1' : '0');
  } catch {
    // Blocked storage only means the preference is forgotten next session.
  }
}

/**
 * Whether the browser-friendly official address (`browserUrl`) is used where a
 * service provides one (TikTok). Default ON. Turning it off is the
 * "মূল ঠিকানা ব্যবহার করুন" switch and restores `providerUrl`.
 */
export function isWebModeEnabled(): boolean {
  try {
    return localStorage.getItem(WEB_MODE_KEY) !== '0';
  } catch {
    return true;
  }
}

export function setWebMode(enabled: boolean): void {
  try {
    localStorage.setItem(WEB_MODE_KEY, enabled ? '1' : '0');
  } catch {
    // Blocked storage only means the preference is forgotten next session.
  }
}

/**
 * The official address that an open control should actually navigate to on
 * this device: `browserUrl` when the service ships one *and* it sits on the
 * exact same origin as `providerUrl` *and* web mode is enabled — otherwise
 * `providerUrl`. The origin guard is what guarantees no third-party
 * viewer/scraper URL can ever sneak in through the registry.
 */
export function openUrlFor(integration: AppIntegration): string {
  const { providerUrl, browserUrl } = integration;
  if (!browserUrl || !isWebModeEnabled()) return providerUrl;
  try {
    return new URL(browserUrl).origin === new URL(providerUrl).origin
      ? browserUrl
      : providerUrl;
  } catch {
    return providerUrl;
  }
}

/**
 * True only for the combination that justifies an `intent://` wrapper: the
 * provider's app is known to hijack its web links (registry flag), this device
 * is Android (iOS and desktop never get an intent), and the user has not
 * switched Chrome forcing off.
 */
export function shouldForceChrome(integration: AppIntegration): boolean {
  return integration.appHijacksLinks === true && isAndroid() && isChromeForcingEnabled();
}

/**
 * An `intent://` link that pins the destination to Chrome on Android. Used as
 * the same-tab href for hijacking services (Facebook, TikTok) and as the
 * in-app-browser escape hatch — never rendered on desktop or iOS.
 */
export function androidChromeIntent(url: string): string {
  const stripped = url.replace(/^https?:\/\//, '');
  return `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
}

/**
 * The href of a same-tab open on this device: the official open URL, wrapped
 * in a Chrome `intent://` only where `shouldForceChrome()` says so. New-tab
 * links never use this — they must stay plain HTTPS so long-press and
 * copy-link can never hand over an intent string.
 */
export function sameTabHref(integration: AppIntegration): string {
  const url = openUrlFor(integration);
  return shouldForceChrome(integration) ? androidChromeIntent(url) : url;
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

/**
 * Reads and clears the pending return marker. `awayMs` is how long Orbit was
 * left for; App.tsx compares it with `SWALLOWED_TAP_MS` to tell a real visit
 * apart from a tap the phone swallowed without ever opening the site.
 */
export function consumeReturn(): { id: AppIntegration['id']; awayMs: number } | null {
  const pending = peekReturn();
  try {
    sessionStorage.removeItem(RETURN_KEY);
  } catch {
    // Ignore.
  }
  return pending ? { id: pending.id, awayMs: Date.now() - pending.at } : null;
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
