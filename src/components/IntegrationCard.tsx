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
        <a
          className="button button-open"
          href={integration.providerUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onOpen(integration)}
          aria-label={`Open official ${integration.name} website in a new tab`}
        >
          Open {integration.name}
          <ArrowUpRight size={16} strokeWidth={2.2} />
        </a>
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
