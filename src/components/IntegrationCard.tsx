import type { CSSProperties } from 'react';
import { Info } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { OpenSiteLink } from './OpenSiteLink';
import type { AppIntegration } from '../integrations/types';

export function IntegrationCard({
  integration,
  onVisit,
  onOpen,
  onDetails,
}: {
  integration: AppIntegration;
  /** Fires when the real link is activated; Orbit never touches the session. */
  onVisit: (integration: AppIntegration) => void;
  /** Opens Orbit's own instruction screen — the only screen Orbit owns. */
  onOpen: (integration: AppIntegration) => void;
  onDetails: (integration: AppIntegration) => void;
}) {
  return (
    <article
      className={`integration-card card-${integration.id}`}
      style={{ '--card-accent': integration.accent, '--card-soft': integration.softAccent } as CSSProperties}
    >
      <div className="integration-card-top">
        <BrandIcon integration={integration} size="large" />
        <span className={`connection-chip status-${integration.status}`}>
          <span className="status-dot" />
          {integration.status === 'connected' ? 'Connected' : 'Not connected'}
        </span>
      </div>
      <div className="integration-copy">
        <h3>{integration.name}</h3>
        <p lang="bn">{integration.descriptionBn}</p>
      </div>
      <div className="integration-card-footer">
        <OpenSiteLink
          integration={integration}
          mode="same-tab"
          className="button button-open"
          onVisit={onVisit}
        />
        {/* Always plain HTTPS: on Android the primary may be a Chrome intent,
            so this neighbour is what long-press/copy-link/share can trust. */}
        <OpenSiteLink
          integration={integration}
          mode="new-tab"
          label="নতুন ট্যাবে"
          className="text-button card-newtab"
          withIcon={false}
          onVisit={onVisit}
        />
        <button
          type="button"
          className="button button-quiet button-guides"
          onClick={() => onOpen(integration)}
          lang="bn"
          title="কীভাবে খুলব ও ফিরব — নির্দেশনা"
        >
          নির্দেশনা
        </button>
        <button
          type="button"
          className="icon-button details-button"
          onClick={() => onDetails(integration)}
          aria-label={`View ${integration.name} integration details`}
          title="Integration details"
        >
          <Info size={18} strokeWidth={1.8} />
        </button>
      </div>
      <span className="card-glow" aria-hidden="true" />
    </article>
  );
}
