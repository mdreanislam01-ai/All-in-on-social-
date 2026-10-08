/*
 * Regression guard for the one thing that broke on a phone: every open
 * control must stay a real `<a href>` to the official site, with no iframe,
 * no window.open and no password field. On top of that it now asserts the
 * phone fixes:
 *  - the primary href of every service is its official open address (TikTok
 *    opens its browser-friendly official /explore page by default),
 *  - an Android `intent://` Chrome wrapper exists only, and only ever, for
 *    services whose own app hijacks links (Facebook, TikTok) — never on
 *    desktop or iOS, and a plain-HTTPS new-tab link always sits next to it,
 *  - every rendered anchor is an official open URL, that URL's Chrome intent
 *    wrapper, or an official docs host,
 *  - with both per-device switches off, TikTok opens exactly
 *    https://www.tiktok.com/ again.
 * Rendered through react-dom/server, so it needs no browser.
 *   npm run verify:links
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { OpenSpaceScreen } from '../src/components/OpenSpaceScreen';
import { IntegrationCard } from '../src/components/IntegrationCard';
import { IntegrationDialog } from '../src/components/IntegrationDialog';
import { integrations } from '../src/integrations/registry';
import {
  androidChromeIntent,
  consumeReturn,
  isChromeForcingEnabled,
  isWebModeEnabled,
  openUrlFor,
  rememberDeparture,
  sameTabHref,
  setChromeForcing,
  setWebMode,
  SWALLOWED_TAP_MS,
} from '../src/integrations/launch';

const CHROME_ANDROID = 'Mozilla/5.0 (Linux; Android 13; SM-A135F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36';
const CHROME_DESKTOP = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const SAFARI_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const IN_APP_ANDROID = 'Mozilla/5.0 (Linux; Android 13; SM-A135F) AppleWebKit/537.36 [FB_IAB/FB4A;FBAV/400.0.0.1;]';

const BENGALI = /[ঀ-৿]/;

type Writable = Record<string, unknown>;

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => (map.has(key) ? (map.get(key) as string) : null),
    setItem: (key: string, value: string) => { map.set(key, String(value)); },
    removeItem: (key: string) => { map.delete(key); },
    clear: () => map.clear(),
  };
}

function define(name: string, value: unknown) {
  const g = globalThis as unknown as Writable;
  const previous = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  return () => {
    if (previous) Object.defineProperty(globalThis, name, previous);
    else delete g[name];
  };
}

function withEnv<T>(userAgent: string, run: () => T): T {
  const restore = [
    define('navigator', { userAgent }),
    define('window', {
      matchMedia: () => ({ matches: false }),
      location: new URL('https://web-social-kappa.vercel.app/'),
      history: { pushState: () => undefined, replaceState: () => undefined, state: null },
    }),
    define('sessionStorage', memoryStorage()),
    define('localStorage', memoryStorage()),
  ];
  try {
    return run();
  } finally {
    restore.forEach((fn) => fn());
  }
}

interface Anchor {
  href: string;
  target?: string;
  rel?: string;
  className: string;
}

function anchors(html: string): Anchor[] {
  return [...html.matchAll(/<a\b[^>]*>/g)].map((match) => {
    const attrs: Record<string, string> = {};
    for (const pair of match[0].matchAll(/([\w:-]+)="([^"]*)"/g)) attrs[pair[1]] = pair[2];
    return { href: attrs.href ?? '', target: attrs.target, rel: attrs.rel, className: attrs.class ?? '' };
  });
}

const failures: string[] = [];
function check(name: string, ok: boolean) {
  if (!ok) failures.push(name);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
}

/** The official HTTPS home each service must keep pointing at. */
const expected: Record<string, string> = {
  facebook: 'https://www.facebook.com/',
  whatsapp: 'https://web.whatsapp.com/',
  messenger: 'https://www.messenger.com/',
  tiktok: 'https://www.tiktok.com/',
  youtube: 'https://www.youtube.com/',
};

function renderScreen(id: string, userAgent: string, returned = false): string {
  const integration = integrations.find((i) => i.id === id)!;
  return withEnv(userAgent, () => renderToStaticMarkup(
    <OpenSpaceScreen integration={integration} returned={returned} onVisit={() => undefined} onClose={() => undefined} />,
  ));
}

function renderCard(id: string, userAgent: string): string {
  const integration = integrations.find((i) => i.id === id)!;
  return withEnv(userAgent, () => renderToStaticMarkup(
    <IntegrationCard integration={integration} onVisit={() => undefined} onOpen={() => undefined} onDetails={() => undefined} />,
  ));
}

function renderDialog(id: string, userAgent: string): string {
  const integration = integrations.find((i) => i.id === id)!;
  return withEnv(userAgent, () => renderToStaticMarkup(
    <IntegrationDialog integration={integration} onClose={() => undefined} onVisit={() => undefined} onGuide={() => undefined} />,
  ));
}

/** An anchor may only ever be an official open URL, its Chrome intent, or official docs. */
function isAllowedAnchor(anchor: Anchor, integration: (typeof integrations)[number]): boolean {
  const openUrls = [integration.providerUrl, ...(integration.browserUrl ? [integration.browserUrl] : [])];
  if (openUrls.includes(anchor.href)) return true;
  if (openUrls.map(androidChromeIntent).includes(anchor.href)) return true;
  try {
    const url = new URL(anchor.href);
    return url.protocol === 'https:' && url.hostname === new URL(integration.officialDocsUrl).hostname;
  } catch {
    return false;
  }
}

check('registry ships 5 services including YouTube', integrations.length === 5 && integrations.some((i) => i.id === 'youtube'));
check('swallowed-tap window is exported as 12s', SWALLOWED_TAP_MS === 12_000);
check('phone fixes default ON (chrome forcing + web mode)',
  withEnv(CHROME_ANDROID, () => isChromeForcingEnabled() && isWebModeEnabled()));

for (const integration of integrations) {
  const id = integration.id;
  const url = expected[id];
  // TikTok's default open address is its browser-friendly official page.
  const openUrl = integration.browserUrl ?? integration.providerUrl;
  const hijacks = id === 'facebook' || id === 'tiktok';

  check(`${id}: providerUrl is the official address`, integration.providerUrl === url);
  check(`${id}: status is not-connected`, integration.status === 'not-connected');
  check(`${id}: appHijacksLinks is ${hijacks}`, Boolean(integration.appHijacksLinks) === hijacks);
  check(`${id}: phone issue + fix steps in Bengali`, BENGALI.test(integration.phoneIssueBn)
    && integration.phoneFixBn.length >= 2 && integration.phoneFixBn.every((step) => BENGALI.test(step)));
  if (id === 'tiktok') {
    check('tiktok: browserUrl is the official /explore page on tiktok.com', integration.browserUrl === 'https://www.tiktok.com/explore');
  } else {
    check(`${id}: no browserUrl override`, integration.browserUrl === undefined);
  }

  // Desktop and iOS: plain official HTTPS everywhere, never an intent.
  const desktopScreen = renderScreen(id, CHROME_DESKTOP);
  const desktopCard = renderCard(id, CHROME_DESKTOP);
  const desktopDialog = renderDialog(id, CHROME_DESKTOP);
  const iosAll = `${renderScreen(id, SAFARI_IPHONE)}${renderCard(id, SAFARI_IPHONE)}${renderDialog(id, SAFARI_IPHONE)}`;
  const desktopAll = `${desktopScreen}${desktopCard}${desktopDialog}`;

  check(`${id}: no iframe element anywhere`, !`${desktopAll}${iosAll}`.includes('<iframe'));
  check(`${id}: no password input anywhere`, !`${desktopAll}${iosAll}`.includes('type="password"'));
  check(`${id}: desktop never renders an intent link`, !desktopAll.includes('intent://'));
  check(`${id}: iOS never renders an intent link`, !iosAll.includes('intent://'));

  const screenLinks = anchors(desktopScreen);
  const cardLinks = anchors(desktopCard);
  const dialogLinks = anchors(desktopDialog);
  check(`${id}: desktop screen primary is the official open address`, screenLinks.some((a) => a.href === openUrl && !a.target));
  check(`${id}: desktop screen secondary opens the same address in a new tab safely`,
    screenLinks.some((a) => a.href === openUrl && a.target === '_blank' && Boolean(a.rel?.includes('noopener'))));
  check(`${id}: desktop card primary is a real same-tab link to the official address`,
    cardLinks.some((a) => a.href === openUrl && !a.target));
  check(`${id}: card keeps a plain "নতুন ট্যাবে" HTTPS link next to the primary`,
    desktopCard.includes('নতুন ট্যাবে')
    && cardLinks.some((a) => a.href === openUrl && a.target === '_blank' && (a.rel ?? '') === 'noopener noreferrer'));
  check(`${id}: dialog offers the same real links`,
    dialogLinks.some((a) => a.href === openUrl && !a.target)
    && dialogLinks.some((a) => a.href === openUrl && a.target === '_blank'));
  check(`${id}: primary button label stays "${integration.name} খুলুন"`,
    desktopScreen.includes(`${integration.name} খুলুন`) && desktopCard.includes(`${integration.name} খুলুন`));
  check(`${id}: Bengali instructions and a "খুলতে সমস্যা হচ্ছে?" help panel on the open screen`,
    BENGALI.test(desktopScreen) && desktopScreen.includes('খুলতে সমস্যা হচ্ছে?')
    && desktopScreen.includes(integration.phoneIssueBn) && desktopScreen.includes('নতুন ট্যাবে আবার চেষ্টা করুন'));
  check(`${id}: open screen shows the URL it will open and offers to copy it`,
    desktopScreen.includes(openUrl) && desktopScreen.includes('যে ঠিকানায় খুলবে'));
  check(`${id}: never claims the site runs inside Orbit`,
    !/running inside Orbit|allowed this frame|INSIDE ORBIT|ওয়েবসাইটের ভিতরে চলছে/i.test(`${desktopScreen}${desktopDialog}${desktopCard}`));
  check(`${id}: visit never claims connected`, !/>\s*Connected\s*</.test(`${desktopScreen}${desktopCard}`));

  // Android: the Chrome intent is the same-tab wrapper ONLY for hijacking apps.
  const androidScreen = renderScreen(id, CHROME_ANDROID);
  const androidCard = renderCard(id, CHROME_ANDROID);
  const androidScreenLinks = anchors(androidScreen);
  const androidPrimary = androidScreenLinks.find((a) => !a.target);
  const androidCardPrimary = anchors(androidCard).find((a) => !a.target);
  if (hijacks) {
    const intent = androidChromeIntent(openUrl);
    check(`${id}: Android same-tab href is the Chrome intent wrapper`, androidPrimary?.href === intent && androidCardPrimary?.href === intent);
    check(`${id}: Android intent carries scheme/package/HTTPS fallback`,
      Boolean(androidPrimary?.href.startsWith(`intent://${openUrl.replace(/^https:\/\//, '')}`))
      && Boolean(androidPrimary?.href.includes('scheme=https;package=com.android.chrome'))
      && Boolean(androidPrimary?.href.includes(`S.browser_fallback_url=${encodeURIComponent(openUrl)}`)));
    check(`${id}: Android still shows a plain HTTPS "নতুন ট্যাবে" link to copy`,
      androidScreenLinks.some((a) => a.href === openUrl && a.target === '_blank')
      && anchors(androidCard).some((a) => a.href === openUrl && a.target === '_blank'));
  } else {
    check(`${id}: Android keeps plain HTTPS (this app does not hijack links)`,
      androidPrimary?.href === openUrl && androidCardPrimary?.href === openUrl
      && !`${androidScreen}${androidCard}`.includes('intent://'));
  }
  check(`${id}: every anchor is an official URL, its intent wrapper, or official docs`,
    [...androidScreenLinks, ...anchors(androidCard), ...anchors(desktopDialog), ...screenLinks, ...cardLinks, ...dialogLinks]
      .every((a) => isAllowedAnchor(a, integration)));

  const list = withEnv(CHROME_DESKTOP, () => renderToStaticMarkup(
    <div>{integrations.map((entry) => <IntegrationCard key={entry.id} integration={entry} onVisit={() => undefined} onOpen={() => undefined} onDetails={() => undefined} />)}</div>,
  ));
  check(`${id}: appears in the card grid`, list.includes(integration.name));
}

// The per-device switches resolve hrefs exactly as promised.
const tiktok = integrations.find((i) => i.id === 'tiktok')!;
check('webUrl falls back to providerUrl when the browser URL is off-origin',
  withEnv(CHROME_DESKTOP, () => openUrlFor({ ...tiktok, browserUrl: 'https://evil-viewer.example/' }) === 'https://www.tiktok.com/'));
check('webUrl accepts an official same-origin path',
  withEnv(CHROME_DESKTOP, () => openUrlFor({ ...tiktok, browserUrl: 'https://www.tiktok.com/foryou' }) === 'https://www.tiktok.com/foryou'));

check('turning chrome forcing off leaves plain HTTPS on Android',
  withEnv(CHROME_ANDROID, () => {
    setChromeForcing(false);
    const fb = integrations.find((i) => i.id === 'facebook')!;
    const plain = !sameTabHref(fb).startsWith('intent://') && sameTabHref(fb) === fb.providerUrl;
    const screen = renderToStaticMarkup(
      <IntegrationCard integration={tiktok} onVisit={() => undefined} onOpen={() => undefined} onDetails={() => undefined} />,
    );
    return plain && !screen.includes('intent://');
  }));

check('both switches off: TikTok opens exactly https://www.tiktok.com/',
  withEnv(CHROME_ANDROID, () => {
    setChromeForcing(false);
    setWebMode(false);
    if (sameTabHref(tiktok) !== 'https://www.tiktok.com/') return false;
    const integration = integrations.find((i) => i.id === 'tiktok')!;
    const screen = renderToStaticMarkup(
      <OpenSpaceScreen integration={integration} returned={false} onVisit={() => undefined} onClose={() => undefined} />,
    );
    const primary = anchors(screen).find((a) => !a.target);
    return primary?.href === 'https://www.tiktok.com/' && !screen.includes('intent://');
  }));

// In-app browsers: the extra Chrome escape hatch is kept where the primary is
// not already a Chrome intent, and never duplicates it.
const whatsapp = integrations.find((i) => i.id === 'whatsapp')!;
const facebook = integrations.find((i) => i.id === 'facebook')!;
const whatsappInApp = withEnv(IN_APP_ANDROID, () => renderToStaticMarkup(
  <OpenSpaceScreen integration={whatsapp} returned={false} onVisit={() => undefined} onClose={() => undefined} />,
));
check('in-app browser on Android keeps the Chrome intent escape hatch (WhatsApp)',
  anchors(whatsappInApp).some((a) => a.href === androidChromeIntent(whatsapp.providerUrl)));
check('intent escape is extra — the real WhatsApp links are still there',
  anchors(whatsappInApp).some((a) => a.href === whatsapp.providerUrl && !a.target)
  && anchors(whatsappInApp).some((a) => a.href === whatsapp.providerUrl && a.target === '_blank'));
check('in-app state is explained in Bengali', whatsappInApp.includes('ভিতরের ব্রাউজারে'));
const facebookInApp = withEnv(IN_APP_ANDROID, () => renderToStaticMarkup(
  <OpenSpaceScreen integration={facebook} returned={false} onVisit={() => undefined} onClose={() => undefined} />,
));
check('in-app Facebook: the primary itself is the Chrome intent, with no duplicated hatch',
  anchors(facebookInApp).filter((a) => a.href.startsWith('intent://')).length === 1
  && anchors(facebookInApp).some((a) => a.href === facebook.providerUrl && a.target === '_blank'));

// Return bookkeeping: consumeReturn reports how long Orbit was away.
check('consumeReturn reports { id, awayMs } and clears the marker',
  withEnv(CHROME_ANDROID, () => {
    rememberDeparture('tiktok');
    const first = consumeReturn();
    return first?.id === 'tiktok'
      && typeof first.awayMs === 'number' && first.awayMs >= 0 && first.awayMs < SWALLOWED_TAP_MS
      && consumeReturn() === null;
  }));

const returnedScreen = renderScreen('facebook', CHROME_ANDROID, true);
check('return state is shown after Back', returnedScreen.includes('ফিরে এসেছেন'));

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exitCode = 1;
} else {
  console.log('\nall checks passed');
}
