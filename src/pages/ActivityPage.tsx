import { useMemo } from 'react';
import { Clock3, History, Trash2 } from 'lucide-react';
import { DirectorySiteLink } from '../components/DirectorySiteLink';
import { SiteMark } from '../components/SiteMark';
import { directorySites, getDirectorySite, type DirectorySite } from '../directory/catalog';
import type { ActivityEntry } from '../integrations/types';

export function ActivityPage({
  activity,
  onClear,
  onVisit,
}: {
  activity: ActivityEntry[];
  onClear: () => void;
  onVisit: (site: DirectorySite) => void;
}) {
  const orderedActivity = useMemo(
    () => [...activity].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [activity],
  );
  const quickLinks = directorySites.filter((site) => site.integrationId);

  return (
    <div className="page-content activity-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR RECENT JOURNEY</span>
          <h1>Activity<span className="heading-period">.</span></h1>
          <p>A lightweight, on-device record of links you opened from Orbit. It is not proof of a login, and it never marks an account as connected.</p>
        </div>
        {orderedActivity.length > 0 && (
          <button type="button" className="button button-quiet clear-activity" onClick={onClear}><Trash2 size={15} /> Clear history</button>
        )}
      </div>

      {orderedActivity.length > 0 ? (
        <section className="activity-list" aria-label="Recent activity">
          <div className="activity-list-heading"><span className="section-overline">RECENT</span><span>{orderedActivity.length} {orderedActivity.length === 1 ? 'event' : 'events'}</span></div>
          {orderedActivity.map((entry) => {
            const site = getDirectorySite(entry.siteId);
            if (!site) return null;
            const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(entry.createdAt));
            const date = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(entry.createdAt));
            return (
              <article className="activity-row" key={entry.id}>
                <span className="activity-timeline"><span /></span>
                <SiteMark site={site} size="small" />
                <div className="activity-row-copy">
                  <strong>{entry.action === 'returned' ? `${site.name} থেকে ফিরে এসেছেন` : `${site.name} খোলা হয়েছে`}</strong>
                  <span>{entry.action === 'returned' ? 'ব্যাক বাটনে এই পেজে ফেরা। লগইনের কোনো কপি এখানে আসেনি।' : 'অফিসিয়াল সাইটের শর্টকাট খোলা হয়েছে; সেখানে কী করেছেন Orbit তা দেখে না।'}</span>
                </div>
                <span className="activity-time"><strong>{time}</strong><small>{date}</small></span>
                <DirectorySiteLink site={site} className="activity-open-again" withIcon={false} onVisit={onVisit} label="আবার" />
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
          <p lang="bn">Orbit থেকে কোনো সাইট খুললে এখানে একটি ছোট রেকর্ড থাকবে। এটি শুধু এই ব্রাউজার সেশনের — অন্য অ্যাপের ভিতরে আপনি কী করছেন Orbit তা দেখে না।</p>
          <div className="activity-quick-links">
            {quickLinks.map((site) => (
              <DirectorySiteLink key={site.id} site={site} className="quick-open" withIcon={false} onVisit={onVisit} />
            ))}
          </div>
        </section>
      )}

      <div className="activity-privacy-footnote"><History size={15} /> এটি শুধু লোকাল শর্টকাট হিস্ট্রি — অফিসিয়াল সাইটে চলে গেলে সেখানে আপনি কী করবেন তা Orbit জানে না।</div>
    </div>
  );
}
