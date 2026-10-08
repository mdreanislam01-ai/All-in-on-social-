import { ArrowUpRight } from 'lucide-react';
import { getIntegration } from '../integrations/registry';
import type { DirectorySite } from '../directory/catalog';
import { OpenSiteLink } from './OpenSiteLink';

export function DirectorySiteLink({
  site,
  onVisit,
  className,
  label = 'Open site',
  mode = 'default',
  withIcon = true,
}: {
  site: DirectorySite;
  onVisit?: (site: DirectorySite) => void;
  className?: string;
  label?: string;
  /** Integrated services default to Orbit's safe same-tab flow; other sites use a new tab. */
  mode?: 'default' | 'new-tab';
  withIcon?: boolean;
}) {
  const integration = site.integrationId ? getIntegration(site.integrationId) : undefined;

  if (integration) {
    return (
      <OpenSiteLink
        integration={integration}
        mode={mode === 'new-tab' ? 'new-tab' : 'same-tab'}
        className={className}
        label={label}
        withIcon={withIcon}
        onVisit={() => onVisit?.(site)}
      />
    );
  }

  return (
    <a
      href={site.url}
      className={className ?? 'button button-primary'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onVisit?.(site)}
      aria-label={`${label} — ${site.domain}`}
      title={`${site.name} · ${site.domain}`}
    >
      {label}
      {withIcon && <ArrowUpRight size={15} strokeWidth={2.2} />}
    </a>
  );
}
