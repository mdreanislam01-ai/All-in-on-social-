import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ExternalLink,
  Globe,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import {
  androidChromeIntent,
  focusOfficialWindow,
  isAndroid,
  isInAppBrowser,
  isIos,
  isStandaloneDisplay,
  rememberDeparture,
  type LaunchHandle,
} from '../integrations/launch';
import type { AppIntegration } from '../integrations/types';

type FrameState = 'trying' | 'embedded' | 'blocked';

function probeFrame(iframe: HTMLIFrameElement): FrameState {
  try {
    const href = iframe.contentWindow?.location.href ?? '';
    if (!href || href === 'about:blank') return 'blocked';
    return 'blocked';
  } catch {
    // A cross-origin document loaded, so the provider allowed this frame.
    return 'embedded';
  }
}

export function AppWorkspace({
  integration,
  session,
  returned,
  onLaunchPopup,
  onLaunchSameTab,
  onReturn,
  onClose,
}: {
  integration: AppIntegration;
  session: LaunchHandle | null;
  returned: boolean;
  onLaunchPopup: () => void;
  onLaunchSameTab: () => void;
  onReturn: () => void;
  onClose: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameState, setFrameState] = useState<FrameState>('trying');
  const [swallowed, setSwallowed] = useState(false);
  const [copied, setCopied] = useState(false);
  const android = isAndroid();
  const ios = isIos();
  const inApp = isInAppBrowser();
  const standalone = isStandaloneDisplay();
  const popupOpen = Boolean(session?.popup && !session.popup.closed);
  const openFailed = session?.mode === 'blocked' || swallowed;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      setFrameState(probeFrame(iframe));
    };
    setFrameState('trying');
    iframe.addEventListener('load', finish);
    const timer = window.setTimeout(finish, 1600);
    iframe.src = integration.providerUrl;
    return () => {
      settled = true;
      iframe.removeEventListener('load', finish);
      window.clearTimeout(timer);
      iframe.src = 'about:blank';
    };
  }, [integration.id, integration.providerUrl]);

  useEffect(() => {
    if (!session?.popup) return;
    const timer = window.setTimeout(() => {
      if (session.popup?.closed) setSwallowed(true);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [session]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(integration.providerUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  const status = returned
    ? 'ফিরে এসেছেন'
    : frameState === 'embedded'
      ? 'ওয়েবসাইটের ভিতরে চলছে'
      : popupOpen
        ? 'অফিসিয়াল উইন্ডো খোলা'
        : openFailed
          ? 'ওপেন হয়নি'
          : 'Orbit-এর ভিতরে প্রস্তুত';

  return (
    <div className="page-content app-workspace" style={{ '--card-accent': integration.accent, '--card-soft': integration.softAccent } as CSSProperties}>
      <div className="workspace-top">
        <button type="button" className="text-button workspace-back" onClick={onClose}>
          <ArrowLeft size={15} /> ড্যাশবোর্ড
        </button>
        <span className={`connection-chip workspace-status${returned ? ' status-connected' : ''}`}>
          <span className="status-dot" />
          {status}
        </span>
      </div>

      <header className="workspace-heading">
        <BrandIcon integration={integration} size="regular" />
        <div>
          <span className="eyebrow">{integration.name} · INSIDE ORBIT</span>
          <h1>{integration.name}<span className="heading-period">.</span></h1>
          <p lang="bn">এই পেজ আপনার ওয়েবসাইটেই আছে। লগইন শেষে এখান থেকেই ফিরে আসবেন।</p>
        </div>
      </header>

      <ol className="workspace-steps" lang="bn">
        <li><span>১</span> Orbit-এর ভিতরে এই ঘর খোলে</li>
        <li><span>২</span> লগইন শুধু অফিসিয়াল সাইটে হয়</li>
        <li><span>৩</span> শেষে “Orbit-এ ফিরুন” চাপুন</li>
      </ol>

      <div className="workspace-actions">
        {android && (integration.id === 'facebook' || integration.id === 'tiktok') ? (
          <a className="button button-primary" href={androidChromeIntent(integration.providerUrl)} onClick={() => rememberDeparture(integration.id)}>
            <Globe size={15} /> Chrome-এ {integration.name} খুলুন
          </a>
        ) : integration.id === 'whatsapp' || integration.id === 'messenger' ? (
          <button type="button" className="button button-primary" onClick={standalone ? onLaunchPopup : onLaunchSameTab}>
            {standalone ? 'লগইন করুন — তারপর Orbit-এ ফিরুন' : 'লগইন করুন — ব্যাক বাটনে ফিরবেন'} <ArrowUpRight size={15} />
          </button>
        ) : (
          <button type="button" className="button button-primary" onClick={onLaunchPopup}>
            {integration.name} খুলুন <ArrowUpRight size={15} />
          </button>
        )}
        <button type="button" className="button button-subtle" onClick={onReturn}>
          <RotateCcw size={15} /> Orbit-এ ফিরুন
        </button>
        {(integration.id === 'whatsapp' || integration.id === 'messenger') && (
          <button type="button" className="button button-quiet" onClick={onLaunchPopup}>
            আলাদা উইন্ডোতে খুলুন
          </button>
        )}
        {!(android && (integration.id === 'facebook' || integration.id === 'tiktok')) && android && (
          <a className="button button-quiet" href={androidChromeIntent(integration.providerUrl)} onClick={() => rememberDeparture(integration.id)}>
            <Globe size={15} /> Chrome-এ খুলুন
          </a>
        )}
        {android && (integration.id === 'facebook' || integration.id === 'tiktok') && !standalone && (
          <button type="button" className="button button-quiet" onClick={onLaunchSameTab}>
            এই ট্যাবে খুলুন
          </button>
        )}
      </div>

      <section className={`workspace-stage${frameState === 'embedded' ? '' : ' workspace-fallback'}`} aria-live="polite">
        {frameState === 'embedded' ? (
          <div className="workspace-stage-bar">
            <BrandIcon integration={integration} size="mini" />
            <strong>{integration.name} is running inside Orbit</strong>
            <span>Official page allowed this frame</span>
          </div>
        ) : (
          <>
          <div className="workspace-fallback-icon" style={{ background: integration.softAccent, color: integration.accent }}>
            <BrandIcon integration={integration} size="large" />
          </div>
          <h2 lang="bn">
            {integration.id === 'facebook' || integration.id === 'tiktok'
              ? `${integration.name} অন্য ওয়েবসাইটের ফ্রেমে চলতে দেয় না`
              : `${integration.name} লগইনের পর নিজের সাইটেই থেকে যায়`}
          </h2>
          <p lang="bn">
            {integration.id === 'facebook' || integration.id === 'tiktok'
              ? 'তাই ভিতরে খালি পেজ আসে, অথবা ফোনের অ্যাপ লিংক ক্লিকটা গিলে ফেলে — মনে হয় কিছুই ওপেন হয়নি। Orbit এই পেজ খোলা রাখে। “খুলুন” চাপলে অফিসিয়াল সাইট আলাদা উইন্ডোতে যাবে। না খুললে Android-এ “Chrome-এ খুলুন” চাপুন।'
              : 'হোয়াটসঅ্যাপ ও মেসেঞ্জার লগইন শেষে আপনার সাইটে অটো ফেরত পাঠায় না। লগইন ওখানেই করতে হয়। শেষ হলে এই পেজের “Orbit-এ ফিরুন” চাপুন, অথবা “এই ট্যাবে খুলুন” বেছে ব্রাউজারের ব্যাক বাটন চাপুন।'}
          </p>
          <p className="workspace-en">
            {frameState === 'trying'
              ? 'Trying to open it inside this page…'
              : `${integration.name} blocks embedding (frame protection). Orbit cannot copy that login page, and it never asks for the social password.`}
          </p>

          {openFailed && (
            <div className="workspace-alert" lang="bn">
              <strong>এই ক্লিকে {integration.name} ওপেন হয়নি।</strong>
              <span>
                {inApp
                  ? 'সাইটটা এখন ইন-অ্যাপ ব্রাউজারে খোলা। Facebook ও TikTok সেখানে প্রায়ই ব্লক হয়। Chrome বা Safari-তে এই ওয়েবসাইট খুলে আবার চেষ্টা করুন।'
                  : android
                    ? 'ফোন অ্যাপটা লিংক নিয়ে নিয়েছে, বা পপআপ ব্লক হয়েছে। “Chrome-এ খুলুন” চাপুন।'
                    : ios
                      ? 'iPhone অ্যাপ লিংক ক্লিক গিলে ফেলতে পারে। Safari-তে লিংক কপি করে খুলুন, তারপর ব্যাক বাটনে এই সাইটে ফিরুন।'
                      : 'পপআপ ব্লক হয়ে থাকতে পারে। আবার “খুলুন” চাপুন, অথবা “এই ট্যাবে খুলুন” ব্যবহার করুন।'}
              </span>
            </div>
          )}

          {returned && (
            <div className="workspace-welcome" lang="bn">
              <span><Check size={16} /></span>
              <div>
                <strong>আপনি আপনার ওয়েবসাইটে ফিরে এসেছেন।</strong>
                <p>লগইন অফিসিয়াল সাইটেই থাকে। Orbit পাসওয়ার্ড দেখে না, সেভও করে না।</p>
              </div>
            </div>
          )}

          {popupOpen && !returned && (
            <div className="workspace-welcome workspace-waiting" lang="bn">
              <span><ExternalLink size={16} /></span>
              <div>
                <strong>{integration.name} আলাদা উইন্ডোতে খোলা।</strong>
                <p>লগইন সেখানে শেষ করে “Orbit-এ ফিরুন” চাপুন। এই পেজ বন্ধ হবে না।</p>
                <button type="button" className="text-button" onClick={() => focusOfficialWindow(session)}>
                  ওই উইন্ডোতে যান
                </button>
              </div>
            </div>
          )}

          <div className="workspace-note">
            <ShieldCheck size={16} />
            <span>Sign-in stays on {integration.providerUrl.replace(/^https:\/\//, '')}. Closing the official window does not give Orbit that account.</span>
          </div>
          <button type="button" className="text-button workspace-copy" onClick={() => void copyLink()}>
            {copied ? 'লিংক কপি হয়েছে' : 'অফিসিয়াল লিংক কপি করুন'}
          </button>
          </>
        )}
        <iframe
          ref={iframeRef}
          className={frameState === 'embedded' ? 'workspace-frame' : 'workspace-probe'}
          title={frameState === 'embedded' ? `${integration.name} official site` : ''}
          tabIndex={frameState === 'embedded' ? undefined : -1}
          aria-hidden={frameState === 'embedded' ? undefined : true}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </section>
    </div>
  );
}


