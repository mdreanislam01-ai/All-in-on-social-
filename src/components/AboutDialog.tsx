import { useEffect, useRef } from 'react';
import { ArrowUpRight, Check, Compass, ShieldCheck, X } from 'lucide-react';
import { OrbitMark } from './AppLogo';

export function AboutDialog({
  open,
  siteCount,
  integrationCount,
  onClose,
  onNavigate,
}: {
  open: boolean;
  siteCount: number;
  integrationCount: number;
  onClose: () => void;
  onNavigate: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="orbit-about-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="orbit-about-dialog" role="dialog" aria-modal="true" aria-labelledby="orbit-about-title">
        <button ref={closeButtonRef} type="button" className="orbit-about-close" onClick={onClose} aria-label="Close about Orbit">
          <X size={18} />
        </button>
        <span className="orbit-about-mark"><OrbitMark /></span>
        <span className="orbit-about-eyebrow">A SOCIAL SPACE, MADE SIMPLE</span>
        <h2 id="orbit-about-title">A little more room<br />for <em>your social life.</em></h2>
        <p className="orbit-about-description">Orbit brings the social sites and creator tools you use into one thoughtfully organized directory. Save the places you return to and keep your workspace close at hand.</p>

        <div className="orbit-about-stats">
          <div><strong>{siteCount}</strong><span>curated destinations</span></div>
          <span className="orbit-about-stat-divider" />
          <div><strong>{integrationCount}</strong><span>guided integrations</span></div>
        </div>

        <div className="orbit-about-principles">
          <div><span><Compass size={15} /></span><p><strong>Useful, not overwhelming</strong><small>A focused selection across social, messaging, community, and creator tools.</small></p></div>
          <div><span><ShieldCheck size={15} /></span><p><strong>Your accounts stay yours</strong><small>Sign in only on the real provider website. Orbit never asks for social passwords.</small></p></div>
          <div><span><Check size={15} /></span><p><strong>Shortcuts, with clarity</strong><small>Visits open the destination itself and do not imply an API connection.</small></p></div>
        </div>

        <div className="orbit-about-actions">
          <button type="button" className="orbit-about-primary" onClick={() => { onClose(); onNavigate(); }}>Explore the directory <ArrowUpRight size={15} /></button>
          <button type="button" className="orbit-about-secondary" onClick={onClose}>Close</button>
        </div>
        <div className="orbit-about-footnote">Built with care for a calmer internet.</div>
      </section>
    </div>
  );
}
