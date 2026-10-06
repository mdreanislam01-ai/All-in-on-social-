import type { AppIntegration } from './types';

export type LaunchMode = 'popup' | 'blocked';

export interface LaunchHandle {
  mode: LaunchMode;
  windowName: string;
  popup: Window | null;
}

const POPUP_FEATURES = 'popup=yes,width=1120,height=780,left=72,top=36';

export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

export function isIos(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Installed home-screen mode has no browser back button, so return has to stay inside Orbit. */
export function isStandaloneDisplay(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
    || nav.standalone === true;
}

/**
 * In-app browsers (Messenger, WhatsApp, TikTok, Instagram) often swallow
 * facebook.com and tiktok.com instead of navigating. WhatsApp Web and
 * Messenger can still open, which matches the reported split.
 */
export function isInAppBrowser(): boolean {
  return /FBAN|FBAV|Instagram|TikTok|Bytedance|Musical_ly|WhatsApp|Line\/|MicroMessenger/i.test(navigator.userAgent);
}

export function windowNameFor(id: AppIntegration['id']): string {
  return `orbit-${id}`;
}

/**
 * Open the official site from a click handler.
 * Orbit keeps the window reference so it can focus or close that window and
 * bring the person back. This does not read the other site, proxy it, or
 * remove its framing protections.
 */
export function openOfficialWindow(url: string, name: string): LaunchHandle {
  // Sized popups are fine on desktop. On phones they are often blocked or
  // swallowed by app links, so use a plain window.open from the click instead.
  const mobile = window.matchMedia('(max-width: 760px)').matches || isAndroid() || isIos();
  const popup = window.open(url, mobile ? '_blank' : name, mobile ? undefined : POPUP_FEATURES);
  if (!popup) {
    return { mode: 'blocked', windowName: name, popup: null };
  }
  try {
    popup.opener = null;
  } catch {
    // The local reference is still enough to focus or close the window.
  }
  return { mode: 'popup', windowName: name, popup };
}

export function focusOfficialWindow(handle: LaunchHandle | null): boolean {
  if (!handle?.popup || handle.popup.closed) return false;
  handle.popup.focus();
  return true;
}

export function closeOfficialWindow(handle: LaunchHandle | null): void {
  if (!handle?.popup || handle.popup.closed) return;
  handle.popup.close();
}

/** Force Chrome on Android so Facebook/TikTok app links do not swallow the click. */
export function androidChromeIntent(url: string): string {
  const stripped = url.replace(/^https?:\/\//, '');
  return `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
}

export function rememberDeparture(id: AppIntegration['id']): void {
  try {
    sessionStorage.setItem('orbit-awaiting-return', JSON.stringify({ id, at: Date.now() }));
  } catch {
    // Storage can be blocked; the in-page return button still works.
  }
}

export function peekReturn(): { id: AppIntegration['id']; at: number } | null {
  try {
    const raw = sessionStorage.getItem('orbit-awaiting-return');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: AppIntegration['id']; at?: number };
    if (!parsed.id || !parsed.at) return null;
    if (Date.now() - parsed.at > 1000 * 60 * 60 * 12) return null;
    return { id: parsed.id, at: parsed.at };
  } catch {
    return null;
  }
}

export function consumeReturn(): AppIntegration['id'] | null {
  const pending = peekReturn();
  try {
    sessionStorage.removeItem('orbit-awaiting-return');
  } catch {
    // Ignore.
  }
  return pending?.id ?? null;
}

export function assignWithReturn(id: AppIntegration['id'], url: string): void {
  const returnUrl = new URL(window.location.href);
  returnUrl.searchParams.set('space', id);
  returnUrl.searchParams.set('returned', '1');
  window.history.pushState(
    { orbitSpace: id, orbitReturn: true },
    '',
    `${returnUrl.pathname}${returnUrl.search}${returnUrl.hash}`,
  );
  rememberDeparture(id);
  window.location.assign(url);
}
