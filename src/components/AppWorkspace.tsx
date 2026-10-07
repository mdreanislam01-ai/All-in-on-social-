import { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import { BrandIcon } from './BrandIcon';
import {
  androidChromeIntent,
  isAndroid,
  isInAppBrowser,
  isIos,
  isStandaloneDisplay,
} from '../integrations/launch';
import type { AppIntegration } from '../integrations/types';

/**
 * The open screen for one platform.
 *
 * There is no iframe here on purpose: Facebook, WhatsApp, Messenger and TikTok
 * all refuse to be framed (`X-Frame-Options` / CSP `frame-ancestors`), so a
 * frame would only ever show a broken page. Orbit also does not proxy those
 * sites, does not strip their security headers, and never asks for or stores a
 * social password. What it does instead is hand over two real https links:
 * one in this tab (browser back returns here) and one in a new tab.
 */
export function AppWorkspace({
  integration,
  returned,
  onOpen,
  onClose,
}: {
  integration: AppIntegration;
  returned: boolean;
  onOpen: (integration: AppIntegration) => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const inApp = isInAppBrowser();
  const android = isAndroid();
  const ios = isIos();
  const standalone = isStandaloneDisplay();

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
      className="page-content app-workspace"
      lang="bn"
      style={{ '--card-accent': integration.accent, '--card-soft': integration.softAccent } as CSSProperties}
    >
      <div className="workspace-top">
        <button type="button" className="text-button workspace-back" onClick={onClose}>
          <ArrowLeft size={15} /> ড্যাশবোর্ড
        </button>
        <span className="connection-chip workspace-status">
          <span className="status-dot" />
          {returned ? 'আপনি ফিরে এসেছেন' : 'Orbit দিয়ে সংযুক্ত নয়'}
        </span>
      </div>

      <header className="workspace-heading">
        <BrandIcon integration={integration} size="regular" />
        <div className="workspace-heading-copy">
          <span className="eyebrow">{integration.name} · OFFICIAL LINK</span>
          <h1>{integration.name}</h1>
          <p>
            {integration.name} অন্য কোনো সাইটের ভিতরে চলতে দেয় না। তাই Orbit এখানে কোনো ফ্রেম দেখায় না —
            বাটনে চাপলে সরাসরি অফিসিয়াল ওয়েবসাইট খুলবে। লগইন ও পাসওয়ার্ড সব ওখানেই থাকে।
          </p>
        </div>
      </header>

      <ol className="workspace-steps">
        <li><span>১</span> “{integration.name} খুলুন” চাপুন — অফিসিয়াল সাইট এই ট্যাবেই খুলবে</li>
        <li><span>২</span> লগইন বা কাজ সেখানেই করুন। Orbit কোনো পাসওয়ার্ড চায় না, সেভও করে না</li>
        <li><span>৩</span> ব্রাউজারের Back বাটনে চাপলে আবার এই পেজেই ফিরে আসবেন</li>
      </ol>

      <div className="workspace-actions">
        <a
          className="button button-primary workspace-open"
          href={integration.providerUrl}
          rel="noopener noreferrer"
          onClick={() => onOpen(integration)}
        >
          {integration.name} খুলুন
        </a>
        <a
          className="button button-subtle workspace-new-tab"
          href={integration.providerUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={15} /> নতুন ট্যাবে খুলুন
        </a>
      </div>

      {returned && (
        <div className="workspace-welcome" aria-live="polite">
          <span><Check size={16} /></span>
          <div>
            <strong>আপনি আবার এই ওয়েবসাইটে ফিরে এসেছেন।</strong>
            <p>
              লগইন অফিসিয়াল সাইটেই থেকে গেছে। Orbit সেখানে কী করেছেন তা দেখতে পায় না, এবং পাসওয়ার্ড কখনোই
              এখানে আসে না। ভিজিট করার অর্থ এই অ্যাকাউন্ট “connected” হয়ে গেছে — তা নয়।
            </p>
            <button type="button" className="text-button" onClick={onClose}>
              ড্যাশবোর্ডে যান
            </button>
          </div>
        </div>
      )}

      {standalone && !returned && (
        <p className="workspace-hint">
          আপনি Orbit-কে ইনস্টল করা অ্যাপ হিসেবে ব্যবহার করছেন। লিংক Chrome ট্যাবে খুলবে; ব্যাক বাটনে এই পেজে
          ফিরে আসবেন।
        </p>
      )}

      {inApp && (
        <div className="workspace-alert">
          <strong>এই ওয়েবসাইটটি এখন একটি ইন-অ্যাপ ব্রাউজারে খোলা।</strong>
          <span>
            WhatsApp, Facebook, Instagram বা TikTok-এর ভিতরের ব্রাউজারে অনেক সময় বাইরের লিংক কাজ করে না।
            {' '}
            {android
              ? 'তখন নিচের “Chrome-এ খুলুন” বাটন ব্যবহার করুন।'
              : ios
                ? 'Safari-এ খুলতে উপরের/নিচের শেয়ার মেনু (⋯) থেকে “Open in Safari/Chrome” বেছে নিন।'
                : 'ব্রাউজারে খুলতে শেয়ার মেনু ব্যবহার করুন।'}
          </span>
          {android && (
            <a
              className="button button-quiet workspace-escape"
              href={androidChromeIntent(integration.providerUrl)}
              onClick={() => onOpen(integration)}
            >
              <Globe size={15} /> Chrome-এ খুলুন
            </a>
          )}
        </div>
      )}

      <section className="workspace-stage">
        <div className="workspace-url-row">
          <Globe size={15} className="workspace-url-icon" />
          <code>{integration.providerUrl}</code>
          <button type="button" className="workspace-copy" onClick={() => void copyLink()}>
            <Copy size={13} /> {copied ? 'কপি হয়েছে' : 'কপি'}
          </button>
        </div>

        <div className="workspace-note">
          <ShieldCheck size={16} />
          <span>
            Orbit এই সাইটটি প্রক্সি করে না, ফ্রেমে লোড করে না, এবং কারো নিরাপত্তা হেডার সরায় না। এখান থেকে
            ভিজিট করলেই অ্যাকাউন্ট সংযুক্ত (connected) হয় না — তা হতে হলে অফিসিয়াল OAuth/API অনুমোদন লাগবে।
          </span>
        </div>

        <p className="workspace-note-english">
          Sign-in stays on {integration.providerUrl.replace(/^https:\/\//, '')}. Visiting it never marks this
          integration as connected.
        </p>
      </section>
    </div>
  );
}
