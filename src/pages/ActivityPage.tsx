import { useMemo } from 'react';
import {
  Clock3,
  History,
  Trash2,
} from 'lucide-react';
import { BrandIcon } from '../components/BrandIcon';
import { OpenSiteLink } from '../components/OpenSiteLink';
import { getIntegration, integrations } from '../integrations/registry';

import type { ActivityEntry, AppIntegration } from '../integrations/types';

export function ActivityPage({
  activity,
  onClear,
  onVisit,
}: {
  activity: ActivityEntry[];
  onClear: () => void;
  onVisit: (integration: AppIntegration) => void;
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
          <p>A lightweight, on-device record of the links you opened from Orbit. It is not proof of a login, and it never marks an account as connected.</p>
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
                <div className="activity-row-copy"><strong>{entry.action === 'returned' ? `${integration.name} থেকে ফিরে এসেছেন` : `${integration.name} খোলা হয়েছে`}</strong><span>{entry.action === 'returned' ? 'ব্যাক বাটনে এই পেজে ফেরা। লগইনের কোনো কপি এখানে আসেনি।' : 'অফিসিয়াল সাইটে আসল লিংক খোলা হয়েছে; লগইন সেখানেই হয়।'}</span></div>
                <span className="activity-time"><strong>{time}</strong><small>{date}</small></span>
                <OpenSiteLink integration={integration} mode="same-tab" className="activity-open-again" withIcon={false} onVisit={onVisit} label="আবার" />
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
          <h2>এখনো কিছু খোলা হয়নি।</h2>
          <p lang="bn">Orbit থেকে কোনো প্ল্যাটফর্ম খুললে এখানে একটা ছোট রেকর্ড থাকবে। এটি শুধু এই ব্রাউজার সেশনেই — অন্য অ্যাপের ভিতরে আপনি কী করছেন তা Orbit দেখে না।</p>
          <div className="activity-quick-links">
            {integrations.map((integration) => (
              <OpenSiteLink key={integration.id} integration={integration} mode="same-tab" className="quick-open" withIcon={false} onVisit={onVisit} />
            ))}
          </div>
        </section>
      )}

      <div className="activity-privacy-footnote"><History size={15} /> এটি শুধু লোকাল শর্টকাট হিস্ট্রি — অফিসিয়াল সাইটে চলে গেলে সেখানে আপনি কী করবেন তা Orbit জানে না।</div>
    </div>
  );
}
