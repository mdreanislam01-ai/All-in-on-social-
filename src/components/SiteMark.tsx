import type { CSSProperties } from 'react';
import { getIntegration } from '../integrations/registry';
import type { DirectorySite } from '../directory/catalog';
import { BrandIcon } from './BrandIcon';

export function SiteMark({ site, size = 'regular' }: { site: DirectorySite; size?: 'small' | 'regular' }) {
  const integration = site.integrationId ? getIntegration(site.integrationId) : undefined;
  if (integration) return <BrandIcon integration={integration} size={size === 'small' ? 'mini' : 'regular'} />;

  return (
    <span
      className={`site-mark site-mark-${size}`}
      style={{ '--site-accent': site.accent } as CSSProperties}
      aria-hidden="true"
    >
      <span>{site.monogram}</span>
    </span>
  );
}
