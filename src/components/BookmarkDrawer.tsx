import { useEffect, useRef } from 'react';
import { ArrowRight, Bookmark, Trash2, X } from 'lucide-react';
import type { DirectorySite } from '../directory/catalog';
import { DirectorySiteLink } from './DirectorySiteLink';
import { SiteMark } from './SiteMark';

export function BookmarkDrawer({
  open,
  sites,
  onClose,
  onRemove,
  onClear,
  onVisit,
  onExplore,
}: {
  open: boolean;
  sites: DirectorySite[];
  onClose: () => void;
  onRemove: (siteId: string) => void;
  onClear: () => void;
  onVisit: (site: DirectorySite) => void;
  onExplore: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="bookmark-layer">
      <button type="button" className="bookmark-backdrop" onClick={onClose} aria-label="Close saved sites" />
      <aside className="bookmark-drawer" role="dialog" aria-modal="true" aria-labelledby="bookmark-drawer-title">
        <div className="bookmark-drawer-header">
          <div className="bookmark-drawer-title-wrap">
            <span className="bookmark-drawer-icon"><Bookmark size={19} fill="currentColor" /></span>
            <div>
              <h2 id="bookmark-drawer-title">My saved sites</h2>
              <p>{sites.length} {sites.length === 1 ? 'site' : 'sites'} kept close</p>
            </div>
          </div>
          <button ref={closeButtonRef} type="button" className="bookmark-drawer-close" onClick={onClose} aria-label="Close saved sites">
            <X size={18} />
          </button>
        </div>

        <div className="bookmark-drawer-body">
          {sites.length > 0 ? (
            <div className="bookmark-list">
              {sites.map((site) => (
                <article className="bookmark-item" key={site.id}>
                  <SiteMark site={site} size="small" />
                  <div className="bookmark-item-copy">
                    <strong>{site.name}</strong>
                    <span>{site.category} <span aria-hidden="true">·</span> {site.domain}</span>
                  </div>
                  <div className="bookmark-item-actions">
                    <DirectorySiteLink site={site} onVisit={onVisit} label="Open" mode="new-tab" withIcon={false} className="bookmark-open-link" />
                    <button type="button" className="bookmark-remove-button" onClick={() => onRemove(site.id)} aria-label={`Remove ${site.name} from saved sites`} title="Remove saved site">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bookmark-empty-state">
              <span className="bookmark-empty-art"><Bookmark size={27} /></span>
              <span className="bookmark-empty-overline">A LITTLE SPACE FOR YOUR FAVORITES</span>
              <h3>Nothing saved just yet.</h3>
              <p>Use the bookmark on any site card and it will be waiting here next time.</p>
              <button type="button" className="bookmark-empty-close" onClick={() => { onClose(); onExplore(); }}>Explore the directory <ArrowRight size={14} /></button>
            </div>
          )}
        </div>

        <div className="bookmark-drawer-footer">
          <button type="button" className="bookmark-clear-button" onClick={onClear} disabled={sites.length === 0}>
            <Trash2 size={14} /> Clear all
          </button>
          <button type="button" className="bookmark-done-button" onClick={onClose}>Done</button>
        </div>
      </aside>
    </div>
  );
}
