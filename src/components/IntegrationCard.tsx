import { ArrowUpRight, Info } from 'lucide-react';
import type { CSSProperties } from 'react';
import { BrandIcon } from './BrandIcon';
import type { AppIntegration } from '../integrations/types';

export function IntegrationCard({
  integration,
  onOpen,
  onDetails,
}: {
  integration: AppIntegration;
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
        <p>{integration.description}</p>
      </div>
      <div className="integration-card-footer">
        <button
          type="button"
          className="button button-open"
          onClick={() => onOpen(integration)}
          aria-label={`Open ${integration.name} inside Orbit`}
        >
          Open inside
          <ArrowUpRight size={16} strokeWidth={2.2} />
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
