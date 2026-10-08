import { ExternalLink } from 'lucide-react';
import type { DirectorySite } from '../directory/catalog';
import { BookmarkButton } from './BookmarkButton';
import { SiteLogo } from './SiteLogo';

interface SiteCardProps {
  site: DirectorySite;
  saved: boolean;
  onToggleBookmark: (id: string) => void;
}

export function SiteCard({ site, saved, onToggleBookmark }: SiteCardProps) {
  return (
    <article className="site-card">
      <div className="site-card__top">
        <SiteLogo site={site} />
        <div className="site-card__title">
          <h3>{site.name}</h3>
          <span className="site-card__category">{site.category}</span>
        </div>
        <BookmarkButton saved={saved} name={site.name} onToggle={() => onToggleBookmark(site.id)} />
      </div>
      <p className="site-card__desc">{site.description}</p>
      <div className="site-card__foot">
        <span className="site-card__domain">{site.domain}</span>
        <a
          className="open-link"
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${site.name} in a new tab`}
        >
          Open <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
