import { useState, type CSSProperties } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Globe,
  Info,
  LayoutDashboard,
  ShieldCheck,
  Smartphone,
  Wrench,
} from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { OpenSiteLink } from './OpenSiteLink';
import {
  androidChromeIntent,
  destinationHost,
  isAndroid,
  isChromeForcingEnabled,
  isInAppBrowser,
  isIos,
  isStandaloneDisplay,
  isWebModeEnabled,
  openUrlFor,
  setChromeForcing,
  setWebMode,
  shouldForceChrome,
} from '../integrations/launch';
import type { AppIntegration } from '../integrations/types';

/** A labelled per-device on/off row backed by a launch.ts localStorage flag. */
function DeviceSwitch({
  checked,
  onChange,
  title,
  note,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  title: string;
  note: string;
}) {
  return (
    <label className="open-switch" lang="bn">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="open-switch-track" aria-hidden="true" />
      <span className="open-switch-copy">
        <strong>{title}</strong>
        <span>{note}</span>
      </span>
    </label>
  );
}

/**
 * The screen behind every card: Bengali instructions plus real links to the
 * official site. There is deliberately no iframe here — these providers refuse
 * framing, and Orbit neither proxies them nor strips their security headers.
 * Per-device switches only choose *which official address* the buttons open
 * (browser-friendly URL, or Chrome-pinned vs app); they never change status.
 */
export function OpenSpaceScreen({
  integration,
  returned,
  helpInitiallyOpen = false,
  onVisit,
  onClose,
}: {
  integration: AppIntegration;
  returned: boolean;
  /** App.tsx sets this after a swallowed tap so the fix steps are already open. */
  helpInitiallyOpen?: boolean;
  onVisit: (integration: AppIntegration) => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [helpOpen, setHelpOpen] = useState(helpInitiallyOpen);
  const android = isAndroid();
  const ios = isIos();
  const inApp = isInAppBrowser();
  const standalone = isStandaloneDisplay();

  // Per-device switches. `wantApp` undoes Chrome forcing; `useOriginal` undoes
  // the browser-friendly URL. Both default off, meaning the fixes are ON.
  const canForce = android && integration.appHijacksLinks === true;
  const [wantApp, setWantApp] = useState(() => !isChromeForcingEnabled());
  const [useOriginal, setUseOriginal] = useState(() => !isWebModeEnabled());

  const openUrl = openUrlFor(integration);
  const forcing = shouldForceChrome(integration);
  // The in-app-browser escape hatch only adds something when the primary
  // button is not already a Chrome intent on this device.
  const showIntentLink = android && inApp && !forcing;

  const status = returned ? 'ফিরে এসেছেন' : 'খোলার জন্য প্রস্তুত';

  function toggleWantApp(next: boolean) {
    setChromeForcing(!next);
    setWantApp(next);
  }

  function toggleUseOriginal(next: boolean) {
    setWebMode(!next);
    setUseOriginal(next);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(openUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className="page-content open-screen"
      style={{ '--card-accent': integration.accent, '--card-soft': integration.softAccent } as CSSProperties}
    >
      <div className="open-screen-top">
        <button type="button" className="text-button open-screen-back" onClick={onClose}>
          <ArrowLeft size={15} /> ড্যাশবোর্ড
        </button>
        <span className={`connection-chip${returned ? ' status-connected' : ''}`}>
          <span className="status-dot" />
          {status}
        </span>
      </div>

      <header className="open-screen-heading">
        <BrandIcon integration={integration} size="regular" />
        <div>
          <span className="eyebrow">{integration.name} · অফিসিয়াল সাইট</span>
          <h1 lang="bn">{integration.name} খুলুন</h1>
          <p lang="bn">
            নিচের বোতামগুলো আসল লিংক — Orbit-এর ভিতরে ফ্রেম বা নকল লগইন পেজ কিছুই নেই।
            লগইন শুধু <strong dir="ltr">{destinationHost(integration.providerUrl)}</strong> ঠিকানাতেই হয়।
          </p>
        </div>
      </header>

      <div className="open-destination">
        <span className="open-destination-label" lang="bn">যে ঠিকানায় খুলবে</span>
        <code dir="ltr">{openUrl}</code>
        <button type="button" className="text-button open-destination-copy" onClick={() => void copyLink()}>
          <Copy size={13} /> {copied ? 'কপি হয়েছে' : 'লিংক কপি করুন'}
        </button>
      </div>

      {(canForce || integration.browserUrl) && (
        <div className="open-switches">
          {canForce && (
            <DeviceSwitch
              checked={wantApp}
              onChange={toggleWantApp}
              title="আমি অ্যাপেই খুলতে চাই"
              note={wantApp
                ? 'চালু আছে — লিংক ফোনের অ্যাপেই যাবে (অ্যাপ না থাকলে ব্রাউজারে খুলবে)।'
                : 'বন্ধ আছে — এই ডিভাইসে লিংকটা Android Chrome-এই খোলে, অ্যাপ ছিনিয়ে নিতে পারে না।'}
            />
          )}
          {integration.browserUrl && (
            <DeviceSwitch
              checked={useOriginal}
              onChange={toggleUseOriginal}
              title="মূল ঠিকানা ব্যবহার করুন"
              note={useOriginal
                ? `চালু আছে — ${integration.providerUrl} ঠিকানাটাই খুলবে।`
                : `বন্ধ আছে — ব্রাউজারে ভালো চলা অফিসিয়াল ঠিকানা ${integration.browserUrl} খুলবে।`}
            />
          )}
        </div>
      )}

      <ol className="open-steps" lang="bn">
        <li><span>১</span> “{integration.name} খুলুন” চাপুন — অফিসিয়াল সাইট এই ট্যাবেই খুলবে</li>
        <li><span>২</span> সেখানে লগইন বা কাজ সেরে নিন</li>
        <li><span>৩</span> ব্রাউজারের ব্যাক বাটন চাপলে আবার এই পেজ</li>
      </ol>

      <div className="open-actions">
        <OpenSiteLink
          integration={integration}
          mode="same-tab"
          className="button button-primary open-action"
          returnToThisPage
          onVisit={onVisit}
          onStuck={() => setHelpOpen(true)}
        />
        <OpenSiteLink
          integration={integration}
          mode="new-tab"
          className="button button-subtle open-action"
          onVisit={onVisit}
        />
        {showIntentLink && (
          <a
            className="button button-quiet open-action"
            href={androidChromeIntent(openUrl)}
            onClick={() => onVisit(integration)}
          >
            <Globe size={15} /> Android Chrome-এ খুলুন
          </a>
        )}
        <button type="button" className="button button-quiet open-action" onClick={onClose}>
          <LayoutDashboard size={15} /> Orbit-এ ফিরুন
        </button>
      </div>

      <details
        className="open-help"
        lang="bn"
        open={helpOpen}
        onToggle={(event) => setHelpOpen(event.currentTarget.open)}
      >
        <summary>
          <span className="open-help-icon"><Wrench size={14} /></span>
          খুলতে সমস্যা হচ্ছে?
          <ChevronDown className="open-help-caret" size={16} />
        </summary>
        <div className="open-help-body">
          <p lang="bn"><strong>কেন হচ্ছে:</strong> {integration.phoneIssueBn}</p>
          <ol className="open-help-steps">
            {integration.phoneFixBn.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <OpenSiteLink
            integration={integration}
            mode="new-tab"
            label="নতুন ট্যাবে আবার চেষ্টা করুন"
            className="button button-subtle open-help-retry"
            withIcon={false}
            onVisit={onVisit}
          />
        </div>
      </details>

      <ul className="open-tips" lang="bn">
        <li>{integration.openNoteBn}</li>
        <li>{integration.returnNoteBn}</li>
      </ul>

      {standalone && (
        <div className="open-alert" lang="bn">
          <Info size={16} />
          <span>
            এটি হোম-স্ক্রিনে ইনস্টল করা অ্যাপ মোড — এখানে ব্রাউজারের ব্যাক বাটন নেই।
            তাই “নতুন ট্যাবে খুলুন” চাপাই ভালো, তাহলে Orbit পেছনে খোলা থাকবে।
          </span>
        </div>
      )}

      {!standalone && inApp && (
        <div className="open-alert" lang="bn">
          <Smartphone size={16} />
          <span>
            আপনি এখন কোনো অ্যাপের ভিতরের ব্রাউজারে আছেন, যেখানে এই লিংকগুলো প্রায়ই গিলে ফেলা হয়।
            {showIntentLink
              ? ' চলছে না “Android Chrome-এ খুলুন” বোতামটা ব্যবহার করুন।'
              : ios
                ? ' লিংক কপি করে Safari-তে খুলুন, অথবা এই সাইটটা সরাসরি Chrome-এ খুলে নিন।'
                : ' লিংক কপি করে Chrome বা Firefox-এ খুলুন।'}
          </span>
        </div>
      )}

      {returned && (
        <div className="open-welcome" lang="bn">
          <span><Check size={16} /></span>
          <div>
            <strong>আপনি আপনার সাইটে ফিরে এসেছেন।</strong>
            <p>
              লগইন অফিসিয়াল সাইটেই থেকে গেছে। Orbit আপনার {integration.name} পাসওয়ার্ড দেখেনি,
              চায়নি, কোনো জায়গায় রাখে না।
            </p>
          </div>
        </div>
      )}

      <section className="open-explain" lang="bn">
        <div className="open-explain-icon"><ShieldCheck size={18} /></div>
        <div>
          <strong>কেন সাইটটা Orbit-এর ভিতরে দেখানো হয় না</strong>
          <p>
            Facebook, WhatsApp, Messenger, TikTok ও YouTube — কোনোটিই অন্য ওয়েবসাইটের iframe-এ
            চলতে দেয় না (X-Frame-Options এবং CSP <code dir="ltr">frame-ancestors</code>)। সেই
            সুরক্ষা কেটে ফেলা বা সাইট প্রক্সি করা Orbit করে না, তাই ভাঙা ফ্রেমের বদলে আসল লিংক দেয় —
            এটা নিরাপদও বেশি।
          </p>
        </div>
      </section>

      <div className="open-status" lang="bn">
        <span className="connection-chip status-not-connected">
          <span className="status-dot" />
          {integration.name}: Not connected
        </span>
        <p>
          শুধু সাইট খুললে অ্যাকাউন্ট connected হয় না — লিংকে ক্লিক করা, ডিভাইসের সুইচ বদলানো বা
          খোলা ঠিকানা বদলানো, কোনোটাই connection নয়। API কানেকশন তখনই হবে, যখন অফিসিয়াল OAuth
          ফ্লো শেষ হয়ে Orbit-এর সার্ভার টোকেন যাচাই করবে — সেটা এখনো বানানো হয়নি।
        </p>
      </div>
    </div>
  );
}
