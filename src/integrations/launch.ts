import type { AppIntegration } from './types';

export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

export function isIos(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Installed / home-screen mode: outbound links open in a custom tab. */
export function isStandaloneDisplay(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: minimal-ui)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
    || nav.standalone === true;
}

/**
 * True only when Orbit itself is being displayed inside another app's browser
 * (WhatsApp, Facebook, Instagram, TikTok, Line, WeChat, or an Android WebView).
 *
 * The `intent://` escape hatch is offered there and nowhere else. When a person
 * is already in Chrome, every open button stays a plain https:// link.
 */
export function isInAppBrowser(): boolean {
  const ua = navigator.userAgent;
  if (/FBAN|FBAV|FB4A|Instagram|TikTok|Bytedance|Musical_ly|Snapchat|WhatsApp|Line\/|MicroMessenger/i.test(ua)) {
    return true;
  }
  // Android app WebViews add "; wv" to the UA. Chrome for Android does not.
  return /Android/i.test(ua) && /;\s*wv\)/i.test(ua);
}

/**
 * Android Chrome intent, used only as a secondary button inside another app's
 * browser. It always carries the https URL as `S.browser_fallback_url`, so a
 * device without Chrome still lands on the official site.
 */
export function androidChromeIntent(url: string): string {
  const stripped = url.replace(/^https?:\/\//, '');
  return `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
}

const RETURN_KEY = 'orbit-awaiting-return';
const RETURN_TTL_MS = 1000 * 60 * 60 * 12;

/**
 * Remember that this tab left for an official site, so the workspace can greet
 * the person when the browser back button brings them here. It is a local
 * shortcut marker only — it is never treated as an account connection.
 */
export function rememberDeparture(id: AppIntegration['id']): void {
  try {
    sessionStorage.setItem(RETURN_KEY, JSON.stringify({ id, at: Date.now() }));
  } catch {
    // Storage can be blocked; the page still works, just without the greeting.
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
