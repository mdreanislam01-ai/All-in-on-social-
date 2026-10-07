import { useEffect, useRef } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ExternalLink,
  LockKeyhole,
  ShieldCheck,
  X,
} from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { OpenSiteLink } from './OpenSiteLink';
import type { AppIntegration } from '../integrations/types';

export function IntegrationDialog({
  integration,
  onClose,
  onVisit,
  onGuide,
}: {
  integration: AppIntegration | null;
  onClose: () => void;
  onVisit: (integration: AppIntegration) => void;
  onGuide: (integration: AppIntegration) => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!integration) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [integration, onClose]);

  if (!integration) return null;

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        className="integration-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="integration-dialog-title"
      >
        <div className="dialog-header">
          <div className="dialog-app-heading">
            <BrandIcon integration={integration} size="regular" />
            <div>
              <span className="dialog-kicker">OFFICIAL SITE SHORTCUT</span>
              <h2 id="integration-dialog-title">{integration.name}</h2>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="icon-button dialog-close"
            onClick={onClose}
            aria-label="Close integration details"
          >
            <X size={19} />
          </button>
        </div>

        <div className="dialog-body">
          <div className="dialog-status-row">
            <span className={`connection-chip status-${integration.status}`}>
              <span className="status-dot" />
              {integration.status === 'connected' ? 'Connected' : 'Not connected to Orbit'}
            </span>
            <span className="external-only-label"><ExternalLink size={13} /> Real link, official sign-in</span>
          </div>

          <p className="dialog-intro">{integration.authorizationDetails}</p>

          <div className="official-method-card">
            <div className="method-icon"><LockKeyhole size={18} /></div>
            <div>
              <span>Official authorization method</span>
              <strong>{integration.authorizationMethod}</strong>
            </div>
            <ShieldCheck className="method-shield" size={19} />
          </div>

          <div className="dialog-features">
            <h3>Supported by the official platform</h3>
            <ul>
              {integration.supportedFeatures.map((feature) => (
                <li key={feature}><span className="feature-check"><Check size={12} /></span>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="dialog-boundary-note">
            <strong>What this means for your account</strong>
            <p>{integration.limitations}</p>
          </div>

          <div className="dialog-setup-note">
            <div className="setup-note-icon"><ShieldCheck size={18} /></div>
            <div>
              <strong lang="bn">লগইন শুধু {integration.name}-এর নিজের সাইটে</strong>
              <p lang="bn">Orbit কখনো আপনার {integration.name} পাসওয়ার্ড চায় না, দেখে না বা সেভ করে না। ফ্রেম বা নকল লগইন পেজও এখানে নেই — শুধু {integration.providerUrl} ঠিকানার আসল লিংক।</p>
            </div>
          </div>

          <button type="button" className="text-button dialog-guide-link" onClick={() => onGuide(integration)}>
            খোলার নিয়ম ও ফেরার উপায় দেখুন <ArrowRight size={14} />
          </button>
        </div>

        <div className="dialog-footer">
          <a href={integration.officialDocsUrl} target="_blank" rel="noopener noreferrer" className="button button-subtle">
            Official docs <ArrowUpRight size={15} />
          </a>
          <OpenSiteLink
            integration={integration}
            mode="new-tab"
            className="button button-subtle"
            onVisit={onVisit}
          />
          <OpenSiteLink
            integration={integration}
            mode="same-tab"
            className="button button-primary"
            onVisit={onVisit}
          />
        </div>
      </section>
    </div>
  );
}
