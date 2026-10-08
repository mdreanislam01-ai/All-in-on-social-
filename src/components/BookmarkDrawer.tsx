import { ExternalLink, Trash2, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { DirectorySite } from '../directory/catalog';
import { SiteLogo } from './SiteLogo';

interface BookmarkDrawerProps {
  open: boolean;
  sites: DirectorySite[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function BookmarkDrawer({ open, sites, onClose, onRemove, onClear }: BookmarkDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  return (
    <>
      <div className={`drawer-backdrop${open ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`drawer${open ? ' is-open' : ''}`} aria-label="Saved sites" aria-hidden={!open}>
        <header className="drawer__head">
          <div>
            <h2>Bookmarks</h2>
            <p>{sites.length} saved {sites.length === 1 ? 'site' : 'sites'}</p>
          </div>
          <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label="Close bookmarks">
            <X size={18} />
          </button>
        </header>

        {sites.length === 0 ? (
          <div className="drawer__empty">
            <h3>No bookmarks yet</h3>
            <p>Tap the bookmark icon on any site to save it here.</p>
          </div>
        ) : (
          <>
            <ul className="drawer__list">
              {sites.map((site) => (
                <li key={site.id} className="drawer__item">
                  <SiteLogo site={site} size={40} />
                  <div className="drawer__info">
                    <strong>{site.name}</strong>
                    <span>{site.category}</span>
                  </div>
                  <button type="button" className="text-btn" onClick={() => onRemove(site.id)} aria-label={`Remove ${site.name}`}>
                    <Trash2 size={15} /> Remove
                  </button>
                  <a className="open-link open-link--small" href={site.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${site.name} in a new tab`}>
                    Open <ExternalLink size={13} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="drawer__foot">
              <button type="button" className="text-btn text-btn--danger" onClick={onClear}>Clear all</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
