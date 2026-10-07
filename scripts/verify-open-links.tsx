/*
 * Regression guard for the one thing that broke on a phone: every open
 * control must stay a real `<a href>` to the official site, with no iframe,
 * no window.open, no password field, and no `intent://` outside an in-app
 * browser. Rendered through react-dom/server, so it needs no browser.
 *   npm run verify:links
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { OpenSpaceScreen } from '../src/components/OpenSpaceScreen';
import { IntegrationCard } from '../src/components/IntegrationCard';
import { IntegrationDialog } from '../src/components/IntegrationDialog';
import { integrations } from '../src/integrations/registry';

const CHROME_ANDROID = 'Mozilla/5.0 (Linux; Android 13; SM-A135F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36';
const CHROME_DESKTOP = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const IN_APP_ANDROID = 'Mozilla/5.0 (Linux; Android 13; SM-A135F) AppleWebKit/537.36 [FB_IAB/FB4A;FBAV/400.0.0.1;]';

type Writable = Record<string, unknown>;

function define(name: string, value: unknown) {
  const g = globalThis as unknown as Writable;
  const previous = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  return () => {
    if (previous) Object.defineProperty(globalThis, name, previous);
    else delete g[name];
  };
}

function withEnv(userAgent: string, render: () => string): string {
  const restore = [
    define('navigator', { userAgent }),
    define('window', {
      matchMedia: () => ({ matches: false }),
      location: new URL('https://web-social-kappa.vercel.app/'),
      history: { pushState: () => undefined, state: null },
    }),
    define('sessionStorage', { getItem: () => null, setItem: () => undefined, removeItem: () => undefined }),
  ];
  try {
    return render();
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

const expected: Record<string, string> = {
  facebook: 'https://www.facebook.com/',
  whatsapp: 'https://web.whatsapp.com/',
  messenger: 'https://www.messenger.com/',
  tiktok: 'https://www.tiktok.com/',
  youtube: 'https://www.youtube.com/',
};

check('registry ships 5 services including YouTube', integrations.length === 5 && integrations.some((i) => i.id === 'youtube'));

const renderScreen = (id: string, returned = false) => {
  const integration = integrations.find((i) => i.id === id)!;
  return withEnv(CHROME_ANDROID, () => renderToStaticMarkup(
    <OpenSpaceScreen integration={integration} returned={returned} onVisit={() => undefined} onClose={() => undefined} />,
  ));
};

for (const integration of integrations) {
  const url = expected[integration.id];
  check(`${integration.id}: providerUrl is the official address`, integration.providerUrl === url);
  check(`${integration.id}: status is not-connected`, integration.status === 'not-connected');

  const screen = renderScreen(integration.id);
  const card = withEnv(CHROME_DESKTOP, () => renderToStaticMarkup(
    <IntegrationCard integration={integration} onVisit={() => undefined} onOpen={() => undefined} onDetails={() => undefined} />,
  ));
  const dialog = withEnv(CHROME_DESKTOP, () => renderToStaticMarkup(
    <IntegrationDialog integration={integration} onClose={() => undefined} onVisit={() => undefined} onGuide={() => undefined} />,
  ));
  const list = withEnv(CHROME_DESKTOP, () => renderToStaticMarkup(
    <div>{integrations.map((entry) => <IntegrationCard key={entry.id} integration={entry} onVisit={() => undefined} onOpen={() => undefined} onDetails={() => undefined} />)}</div>,
  ));

  check(`${integration.id}: no iframe element anywhere`, !`${screen}${card}${dialog}`.includes('<iframe'));
  check(`${integration.id}: no password input`, !`${screen}${card}${dialog}`.includes('type="password"'));
  check(`${integration.id}: no intent link in plain Chrome`, !`${screen}${card}${dialog}`.includes('intent://'));

  const screenLinks = anchors(screen);
  check(`${integration.id}: open screen primary is a real href to ${url}`,
    screenLinks.some((a) => a.href === url && !a.target));
  check(`${integration.id}: open screen secondary opens a new tab safely`,
    screenLinks.some((a) => a.href === url && a.target === '_blank' && Boolean(a.rel?.includes('noopener'))));
  check(`${integration.id}: card primary is a real same-tab link`,
    anchors(card).some((a) => a.href === url && !a.target));
  check(`${integration.id}: dialog offers the same real links`,
    anchors(dialog).some((a) => a.href === url && !a.target)
    && anchors(dialog).some((a) => a.href === url && a.target === '_blank'));
  check(`${integration.id}: Bengali button labels`, screen.includes(`${integration.name} খুলুন`) && screen.includes('নতুন ট্যাবে খুলুন'));
  check(`${integration.id}: Bengali instructions on the open screen`, /[ঀ-৿]/.test(screen));
  check(`${integration.id}: never claims the site runs inside Orbit`,
    !/running inside Orbit|allowed this frame|INSIDE ORBIT|ওয়েবসাইটের ভিতরে চলছে/i.test(`${screen}${dialog}${card}`));
  check(`${integration.id}: visit never claims connected`,
    !/>\s*Connected\s*</.test(`${screen}${card}`));
  check(`${integration.id}: appears in the card grid`, list.includes(integration.name));
}

const inAppScreen = withEnv(IN_APP_ANDROID, () => renderToStaticMarkup(
  <OpenSpaceScreen integration={integrations[0]} returned={false} onVisit={() => undefined} onClose={() => undefined} />,
));
check('in-app browser on Android gets the Chrome intent fallback',
  anchors(inAppScreen).some((a) => a.href.startsWith('intent://www.facebook.com/') && a.href.includes('com.android.chrome')));
check('intent fallback is extra, the real links are still there',
  anchors(inAppScreen).some((a) => a.href === 'https://www.facebook.com/' && !a.target));
check('in-app state is explained in Bengali', inAppScreen.includes('ভিতরের ব্রাউজারে'));

const returnedScreen = renderScreen('facebook', true);
check('return state is shown after Back', returnedScreen.includes('ফিরে এসেছেন'));

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exitCode = 1;
} else {
  console.log('\nall checks passed');
}
