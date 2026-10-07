import { useState, type CSSProperties } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  Globe,
  Info,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { OpenSiteLink } from './OpenSiteLink';
import {
  androidChromeIntent,
  destinationHost,
  isAndroid,
  isInAppBrowser,
  isIos,
  isStandaloneDisplay,
} from '../integrations/launch';
import type { AppIntegration } from '../integrations/types';

/**
 * The screen behind every card: Bengali instructions plus real links to the
 * official site. There is deliberately no iframe here — these providers refuse
 * framing, and Orbit neither proxies them nor strips their security headers.
 */
export function OpenSpaceScreen({
  integration,
  returned,
  onVisit,
  onClose,
}: {
  integration: AppIntegration;
  returned: boolean;
  onVisit: (integration: AppIntegration) => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const android = isAndroid();
  const ios = isIos();
  const inApp = isInAppBrowser();
  const standalone = isStandaloneDisplay();
  const showIntentLink = android && inApp;

  const status = returned ? 'ফিরে এসেছেন' : 'খোলার জন্য প্রস্তুত';

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(integration.providerUrl);
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
        <span className="open-destination-label" lang="bn">যে ঠিকানায় যাবে</span>
        <code dir="ltr">{integration.providerUrl}</code>
        <button type="button" className="text-button open-destination-copy" onClick={() => void copyLink()}>
          <Copy size={13} /> {copied ? 'কপি হয়েছে' : 'লিংক কপি করুন'}
        </button>
      </div>

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
            href={androidChromeIntent(integration.providerUrl)}
            onClick={() => onVisit(integration)}
          >
            <Globe size={15} /> Android Chrome-এ খুলুন
          </a>
        )}
        <button type="button" className="button button-quiet open-action" onClick={onClose}>
          <LayoutDashboard size={15} /> Orbit-এ ফিরুন
        </button>
      </div>

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
          <Info size={16} />
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
          শুধু সাইট খুললে অ্যাকাউন্ট connected হয় না। API কানেকশন তখনই হবে, যখন অফিসিয়াল OAuth
          ফ্লো শেষ হয়ে Orbit-এর সার্ভার টোকেন যাচাই করবে — সেটা এখনো বানানো হয়নি।
        </p>
      </div>
    </div>
  );
}
