import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { BrandIcon } from '../components/BrandIcon';
import { IntegrationCard } from '../components/IntegrationCard';
import { integrations } from '../integrations/registry';
import type { AppIntegration } from '../integrations/types';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatToday() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

export function OverviewPage({
  name,
  apps,
  connectedCount,
  onVisit,
  onOpen,
  onDetails,
  onNavigate,
  search,
}: {
  name: string;
  apps: AppIntegration[];
  connectedCount: number;
  onVisit: (integration: AppIntegration) => void;
  onOpen: (integration: AppIntegration) => void;
  onDetails: (integration: AppIntegration) => void;
  onNavigate: (view: 'integrations') => void;
  search: string;
}) {
  const firstName = name.split(' ')[0] || 'there';

  return (
    <div className="page-content overview-page">
      <div className="page-heading overview-heading">
        <div>
          <span className="eyebrow">{formatToday()}</span>
          <h1>{getGreeting()}, {firstName}<span className="heading-period">.</span></h1>
          <p>Your favorite social spaces, right where you need them.</p>
        </div>
        <div className="connection-summary">
          <span className="connection-summary-icon"><Check size={15} /></span>
          <span><strong>{connectedCount} connected</strong><small>{integrations.length - connectedCount} ready to open</small></span>
        </div>
      </div>

      <section className="welcome-hero" aria-labelledby="welcome-title">
        <div className="welcome-hero-content">
          <div className="hero-eyebrow"><span><Sparkles size={13} /></span> YOUR SOCIALS, IN ONE ORBIT</div>
          <h2 id="welcome-title">Move between your<br className="hero-break" /> socials, <em>seamlessly.</em></h2>
          <p>Every card is a real link to the official site — no frames, no proxies, no copied login pages. Open in this tab and press Back to return, or open in a new tab and Orbit stays right here.</p>
          <p className="hero-note-bn" lang="bn">Orbit কোনো পাসওয়ার্ড চায় না; লগইন সবসময় প্রতিটি প্ল্যাটফর্মের নিজের সাইটেই হয়।</p>
          <button
            type="button"
            className="hero-cta"
            onClick={() => document.getElementById('your-apps')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            Explore your apps <ArrowDown size={15} />
          </button>
        </div>
        <div className="hero-illustration" aria-hidden="true">
          <div className="hero-orbit-ring hero-ring-one" />
          <div className="hero-orbit-ring hero-ring-two" />
          <div className="hero-orbit-ring hero-ring-three" />
          <div className="hero-orbit-center"><span className="hero-orbit-core"><Sparkles size={25} /></span></div>
          <span className="hero-star hero-star-one">✦</span>
          <span className="hero-star hero-star-two">✦</span>
          <span className="hero-star hero-star-three">·</span>
          {apps.map((app) => <span key={app.id} className={`hero-app-float float-${app.id}`}><BrandIcon integration={app} size="mini" /></span>)}
          <div className="orbit-caption"><span className="orbit-caption-dot" />{integrations.length} PLATFORMS READY</div>
        </div>
        <span className="hero-decor hero-decor-one" aria-hidden="true" />
        <span className="hero-decor hero-decor-two" aria-hidden="true" />
      </section>

      <div className="privacy-strip">
        <span className="privacy-strip-icon"><ShieldCheck size={19} /></span>
        <div className="privacy-strip-copy">
          <strong>Privacy comes first</strong>
          <span>Your passwords stay with each platform. Orbit never copies a login page, and opening a site never marks that account as connected.</span>
        </div>
        <button type="button" className="privacy-learn-more" onClick={() => onNavigate('integrations')}>
          How it works <ArrowRight size={15} />
        </button>
      </div>

      <section className="apps-section" id="your-apps" aria-labelledby="apps-heading">
        <div className="section-heading-row">
          <div>
            <span className="section-overline">YOUR SOCIAL SPACE</span>
            <h2 id="apps-heading">Your apps</h2>
            <p>বোতামে চাপলেই অফিসিয়াল সাইট খুলবে — লগইন শেষে ব্যাক বাটনে এই পেজে ফিরে আসবেন।</p>
          </div>
          <button type="button" className="text-button manage-integrations" onClick={() => onNavigate('integrations')}>
            Manage integrations <ArrowRight size={15} />
          </button>
        </div>

        {apps.length > 0 ? (
          <div className="integration-grid">
            {apps.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} onVisit={onVisit} onOpen={onOpen} onDetails={onDetails} />
            ))}
          </div>
        ) : (
          <div className="search-empty-state">
            <span className="search-empty-icon"><ExternalLink size={19} /></span>
            <strong>No apps match “{search}”</strong>
            <p>Try searching Facebook, WhatsApp, Messenger, TikTok, or YouTube.</p>
            <button type="button" className="text-button" onClick={() => onNavigate('integrations')}>View all integrations <ArrowUpRight size={15} /></button>
          </div>
        )}
      </section>

      <footer className="page-footer">
        <span>Made for a calmer internet.</span>
        <span><span className="footer-green-dot" /> Official destinations only</span>
      </footer>
    </div>
  );
}
