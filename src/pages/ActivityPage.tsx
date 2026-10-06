import { useMemo } from 'react';
import {
  ArrowUpRight,
  Clock3,
  ExternalLink,
  History,
  Trash2,
} from 'lucide-react';
import { BrandIcon } from '../components/BrandIcon';
import { getIntegration } from '../integrations/registry';
import type { ActivityEntry, AppIntegration } from '../integrations/types';

export function ActivityPage({
  activity,
  onClear,
  onOpen,
}: {
  activity: ActivityEntry[];
  onClear: () => void;
  onOpen: (integration: AppIntegration) => void;
}) {
  const orderedActivity = useMemo(
    () => [...activity].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [activity],
  );

  return (
    <div className="page-content activity-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR RECENT JOURNEY</span>
          <h1>Activity<span className="heading-period">.</span></h1>
          <p>A lightweight, on-device record of platforms you opened from Orbit.</p>
        </div>
        {orderedActivity.length > 0 && (
          <button type="button" className="button button-quiet clear-activity" onClick={onClear}><Trash2 size={15} /> Clear history</button>
        )}
      </div>

      {orderedActivity.length > 0 ? (
        <section className="activity-list" aria-label="Recent activity">
          <div className="activity-list-heading"><span className="section-overline">RECENT</span><span>{orderedActivity.length} {orderedActivity.length === 1 ? 'event' : 'events'}</span></div>
          {orderedActivity.map((entry) => {
            const integration = getIntegration(entry.integrationId);
            if (!integration) return null;
            const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(entry.createdAt));
            const date = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(entry.createdAt));
            return (
              <article className="activity-row" key={entry.id}>
                <span className="activity-timeline"><span /></span>
                <BrandIcon integration={integration} size="mini" />
                <div className="activity-row-copy"><strong>Opened {integration.name}</strong><span>Official website opened in a new tab · No account was linked to Orbit.</span></div>
                <span className="activity-time"><strong>{time}</strong><small>{date}</small></span>
                <a href={integration.providerUrl} target="_blank" rel="noopener noreferrer" className="activity-open-again" onClick={() => onOpen(integration)} aria-label={`Open ${integration.name} again`}><ArrowUpRight size={16} /></a>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="activity-empty-card">
          <div className="activity-empty-art" aria-hidden="true">
            <span className="activity-art-ring" />
            <span className="activity-art-dot activity-art-dot-one" />
            <span className="activity-art-dot activity-art-dot-two" />
            <span className="activity-art-paper"><History size={31} strokeWidth={1.5} /></span>
          </div>
          <span className="empty-overline"><Clock3 size={13} /> YOUR SPACE IS ALL CAUGHT UP</span>
          <h2>Nothing here just yet.</h2>
          <p>When you open a platform from Orbit, you’ll see a small reminder here. This history stays in this browser session and never tracks activity inside another app.</p>
          <div className="activity-quick-links">
            {['facebook', 'whatsapp', 'messenger', 'tiktok'].map((id) => {
              const integration = getIntegration(id as AppIntegration['id']);
              if (!integration) return null;
              return <a key={id} href={integration.providerUrl} target="_blank" rel="noopener noreferrer" onClick={() => onOpen(integration)}><span>{integration.name}</span><ExternalLink size={13} /></a>;
            })}
          </div>
        </section>
      )}

      <div className="activity-privacy-footnote"><History size={15} /> This is a local shortcut history only — Orbit cannot see what you do after you leave for a platform.</div>
    </div>
  );
}
