import { ArrowUpRight, Check, CircleHelp, ShieldCheck } from 'lucide-react';
import { IntegrationCard } from '../components/IntegrationCard';
import type { AppIntegration } from '../integrations/types';

export function IntegrationsPage({
  apps,
  connectedCount,
  onOpen,
  onDetails,
  search,
}: {
  apps: AppIntegration[];
  connectedCount: number;
  onOpen: (integration: AppIntegration) => void;
  onDetails: (integration: AppIntegration) => void;
  search: string;
}) {
  return (
    <div className="page-content integrations-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR SERVICE DIRECTORY</span>
          <h1>Integrations<span className="heading-period">.</span></h1>
          <p>One reusable registry, four official ways into the apps you use.</p>
        </div>
        <div className="page-heading-badge"><span className="heading-badge-icon"><Check size={14} /></span> {apps.length} official destinations</div>
      </div>

      <div className="integration-overview-banner">
        <div className="integration-banner-icon"><ShieldCheck size={21} /></div>
        <div className="integration-banner-copy">
          <strong>{connectedCount === 0 ? 'No social accounts are linked to this dashboard yet.' : `${connectedCount} social account${connectedCount === 1 ? '' : 's'} linked.`}</strong>
          <span>Sign-in stays on the official website. Facebook and TikTok block in-page frames, so Orbit keeps this page open and gives you a way back. An external visit never marks an API as connected.</span>
        </div>
        <div className="integration-banner-count"><strong>{connectedCount}<span> / {4}</span></strong><small>connected</small></div>
      </div>

      <div className="integration-info-row">
        <span><CircleHelp size={15} /> Supported features vary by platform and approval.</span>
        <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer">Meta developer portal <ArrowUpRight size={13} /></a>
      </div>

      {apps.length > 0 ? (
        <div className="integration-grid integration-grid-manage">
          {apps.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} onOpen={onOpen} onDetails={onDetails} />
          ))}
        </div>
      ) : (
        <div className="search-empty-state integrations-empty">
          <span className="search-empty-icon"><CircleHelp size={19} /></span>
          <strong>No integrations match “{search}”</strong>
          <p>Try a different search or clear the search field.</p>
        </div>
      )}

      <div className="integration-registry-note">
        <div className="registry-note-symbol">+</div>
        <div><strong>Designed to grow with you</strong><span>Instagram, YouTube, Telegram, X, LinkedIn and Gmail can be added as new registry entries when their official methods are configured.</span></div>
      </div>
    </div>
  );
}
