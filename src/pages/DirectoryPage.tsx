import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react';
import {
  Activity,
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Compass,
  Globe2,
  Layers3,
  MessageCircle,
  Play,
  Search,
  Share2,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react';
import type { AppIntegration, ActivityEntry } from '../integrations/types';
import { getIntegration } from '../integrations/registry';
import { DirectorySiteLink } from '../components/DirectorySiteLink';
import { SiteMark } from '../components/SiteMark';
import { directoryCategories, directorySites, type DirectorySite, type SiteCategory } from '../directory/catalog';

const PAGE_SIZE = 12;
const categoryIcons: Record<'All sites' | SiteCategory, typeof Compass> = {
  'All sites': Layers3,
  Social: Share2,
  Messaging: MessageCircle,
  'Video & audio': Play,
  'Creator tools': Sparkles,
  'Community & publishing': UsersRound,
  'Social management': Activity,
};

function getOpenCount(siteId: string, activity: ActivityEntry[]) {
  return activity.filter((entry) => entry.siteId === siteId && entry.action === 'opened').length;
}

function DirectoryCard({
  site,
  saved,
  openCount,
  onVisit,
  onToggleBookmark,
  onGuide,
  onDetails,
}: {
  site: DirectorySite;
  saved: boolean;
  openCount: number;
  onVisit: (site: DirectorySite) => void;
  onToggleBookmark: (siteId: string) => void;
  onGuide: (integration: AppIntegration) => void;
  onDetails: (integration: AppIntegration) => void;
}) {
  const integration = site.integrationId ? getIntegration(site.integrationId) : undefined;

  return (
    <article className="directory-card" style={{ '--site-accent': site.accent } as CSSProperties}>
      <div className="directory-card-head">
        <SiteMark site={site} />
        <div className="directory-card-heading">
          <span className="directory-card-category">{site.category}</span>
          <h2>{site.name}</h2>
          <span className="directory-card-domain">{site.domain}</span>
        </div>
        <button
          type="button"
          className={`directory-save-button${saved ? ' directory-save-button-saved' : ''}`}
          onClick={() => onToggleBookmark(site.id)}
          aria-label={saved ? `Remove ${site.name} from saved sites` : `Save ${site.name}`}
          aria-pressed={saved}
          title={saved ? 'Remove from saved sites' : 'Save this site'}
        >
          {saved ? <Bookmark size={17} fill="currentColor" /> : <Bookmark size={17} />}
        </button>
      </div>

      <p className="directory-card-description">{site.description}</p>

      <div className="directory-card-meta">
        <span><span className="directory-verified-dot"><Check size={9} /></span> Official destination</span>
        {openCount > 0 && <span className="directory-open-count"><Activity size={12} /> Opened {openCount} {openCount === 1 ? 'time' : 'times'}</span>}
      </div>

      <div className="directory-card-actions">
        <DirectorySiteLink
          site={site}
          onVisit={onVisit}
          label="Open site"
          className="directory-open-button"
        />
        {integration && (
          <>
            <button type="button" className="directory-guide-button" onClick={() => onGuide(integration)} title={`How to open ${site.name}`}>
              <CircleHelp size={15} />
              <span>Guide</span>
            </button>
            <button type="button" className="directory-details-button" onClick={() => onDetails(integration)} aria-label={`View ${site.name} details`} title="Integration details">
              <ArrowUpRight size={16} />
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export function DirectoryPage({
  search,
  onSearchChange,
  savedSiteIds,
  activity,
  onVisit,
  onToggleBookmark,
  onGuide,
  onDetails,
  onNavigate,
}: {
  search: string;
  onSearchChange: (search: string) => void;
  savedSiteIds: string[];
  activity: ActivityEntry[];
  onVisit: (site: DirectorySite) => void;
  onToggleBookmark: (siteId: string) => void;
  onGuide: (integration: AppIntegration) => void;
  onDetails: (integration: AppIntegration) => void;
  onNavigate: (view: 'integrations') => void;
}) {
  const [activeCategory, setActiveCategory] = useState<'All sites' | SiteCategory>('All sites');
  const [sortMode, setSortMode] = useState<'featured' | 'alphabetical'>('featured');
  const [page, setPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);
  const saved = useMemo(() => new Set(savedSiteIds), [savedSiteIds]);
  const normalizedSearch = search.trim().toLocaleLowerCase();

  useEffect(() => {
    setPage(1);
  }, [normalizedSearch, activeCategory, sortMode]);

  const filteredSites = useMemo(() => {
    const filtered = directorySites.filter((site) => {
      const categoryMatches = activeCategory === 'All sites' || site.category === activeCategory;
      const searchMatches = !normalizedSearch || `${site.name} ${site.description} ${site.category} ${site.domain}`
        .toLocaleLowerCase()
        .includes(normalizedSearch);
      return categoryMatches && searchMatches;
    });

    if (sortMode === 'alphabetical') return filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [activeCategory, normalizedSearch, sortMode]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<SiteCategory, number>();
    for (const site of directorySites) counts.set(site.category, (counts.get(site.category) ?? 0) + 1);
    return counts;
  }, []);

  const totalPages = Math.ceil(filteredSites.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(1, totalPages));
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageSites = filteredSites.slice(start, start + PAGE_SIZE);
  const resultStart = filteredSites.length === 0 ? 0 : start + 1;
  const resultEnd = Math.min(start + PAGE_SIZE, filteredSites.length);

  function changePage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
    document.getElementById('directory-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape' && search) {
      onSearchChange('');
      searchRef.current?.focus();
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  const pageNumbers: (number | 'ellipsis')[] = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);
    const values: (number | 'ellipsis')[] = [];
    if (currentPage <= 3) return [1, 2, 3, 4, 'ellipsis', totalPages];
    if (currentPage >= totalPages - 2) return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    values.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
    return values;
  }, [currentPage, totalPages]);

  return (
    <div className="directory-page">
      <section className="directory-intro" aria-labelledby="directory-title">
        <div className="directory-intro-copy">
          <span className="directory-eyebrow"><span /> THE SOCIAL WEB, SORTED</span>
          <h1 id="directory-title">Your people.<br className="directory-title-break" /> Your <em>places.</em></h1>
          <p>Find the communities, conversations, and creator tools you use every day — all from one calm workspace.</p>
        </div>
        <div className="directory-intro-art" aria-hidden="true">
          <span className="directory-art-orbit directory-art-orbit-one" />
          <span className="directory-art-orbit directory-art-orbit-two" />
          <span className="directory-art-core"><Compass size={28} strokeWidth={1.6} /></span>
          <span className="directory-art-spark directory-art-spark-one">✦</span>
          <span className="directory-art-spark directory-art-spark-two">✧</span>
          <span className="directory-art-pill directory-art-pill-one">share</span>
          <span className="directory-art-pill directory-art-pill-two">create</span>
        </div>
      </section>

      <form className="directory-search" role="search" aria-label="Search the social directory" onSubmit={submitSearch}>
        <Search size={19} strokeWidth={1.9} aria-hidden="true" />
        <input
          ref={searchRef}
          id="directory-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search sites, communities, and tools..."
          autoComplete="off"
          aria-label="Search sites, communities, and tools"
        />
        {search ? (
          <button type="button" className="directory-search-clear" onClick={() => { onSearchChange(''); searchRef.current?.focus(); }} aria-label="Clear search">
            <X size={16} />
          </button>
        ) : (
          <span className="directory-search-shortcut"><kbd>⌘</kbd><kbd>K</kbd></span>
        )}
      </form>

      <section className="directory-category-section" aria-label="Filter by category">
        <div className="directory-category-head">
          <span className="directory-section-label">BROWSE BY CATEGORY</span>
          <span className="directory-category-hint">Scroll to see more <ArrowRight size={12} /></span>
        </div>
        <div className="directory-category-row">
          {(['All sites', ...directoryCategories] as ('All sites' | SiteCategory)[]).map((category) => {
            const Icon = categoryIcons[category];
            const count = category === 'All sites' ? directorySites.length : categoryCounts.get(category) ?? 0;
            const active = activeCategory === category;
            return (
              <button
                type="button"
                key={category}
                className={`directory-category-chip${active ? ' directory-category-chip-active' : ''}`}
                onClick={() => setActiveCategory(category)}
                aria-pressed={active}
              >
                <Icon size={14} strokeWidth={active ? 2.2 : 1.8} />
                <span>{category}</span>
                <span className="directory-category-count">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="directory-results-bar" id="directory-results">
        <div className="directory-results-copy">
          <span className="directory-results-icon"><Globe2 size={15} /></span>
          <span>
            {filteredSites.length > 0 ? (
              <>Showing <strong>{resultStart}–{resultEnd}</strong> of <strong>{filteredSites.length}</strong> {filteredSites.length === 1 ? 'site' : 'sites'}</>
            ) : (
              <>No sites found{search ? <> for <strong>“{search}”</strong></> : null}</>
            )}
            {activeCategory !== 'All sites' && <span className="directory-results-filter"> in {activeCategory}</span>}
          </span>
        </div>
        <label className="directory-sort-control">
          <ArrowDownUp size={14} />
          <span className="directory-sort-label">Sort</span>
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value as 'featured' | 'alphabetical')} aria-label="Sort sites">
            <option value="featured">Featured</option>
            <option value="alphabetical">A to Z</option>
          </select>
        </label>
      </div>

      {pageSites.length > 0 ? (
        <div className="directory-grid">
          {pageSites.map((site) => (
            <DirectoryCard
              key={site.id}
              site={site}
              saved={saved.has(site.id)}
              openCount={getOpenCount(site.id, activity)}
              onVisit={onVisit}
              onToggleBookmark={onToggleBookmark}
              onGuide={(integration) => onGuide(integration)}
              onDetails={(integration) => onDetails(integration)}
            />
          ))}
        </div>
      ) : (
        <div className="directory-empty-state">
          <span className="directory-empty-icon"><Search size={23} /></span>
          <h2>Nothing here yet.</h2>
          <p>Try a different search or browse another category.</p>
          <div className="directory-empty-actions">
            {search && <button type="button" className="directory-secondary-action" onClick={() => onSearchChange('')}>Clear search</button>}
            {activeCategory !== 'All sites' && <button type="button" className="directory-primary-action" onClick={() => setActiveCategory('All sites')}>Browse all sites <ArrowRight size={15} /></button>}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="directory-pagination" aria-label="Directory pages">
          <button type="button" className="directory-page-control" onClick={() => changePage(currentPage - 1)} disabled={currentPage <= 1} aria-label="Previous page">
            <ChevronLeft size={17} /><span>Previous</span>
          </button>
          <div className="directory-page-numbers">
            {pageNumbers.map((number, index) => number === 'ellipsis' ? (
              <span className="directory-pagination-ellipsis" key={`ellipsis-${index}`}>…</span>
            ) : (
              <button
                type="button"
                className={`directory-page-number${number === currentPage ? ' directory-page-number-active' : ''}`}
                key={number}
                onClick={() => changePage(number)}
                aria-label={`Page ${number}`}
                aria-current={number === currentPage ? 'page' : undefined}
              >{number}</button>
            ))}
          </div>
          <button type="button" className="directory-page-control" onClick={() => changePage(currentPage + 1)} disabled={currentPage >= totalPages} aria-label="Next page">
            <span>Next</span><ChevronRight size={17} />
          </button>
        </nav>
      )}

      <section className="directory-privacy-note">
        <span className="directory-privacy-icon"><Check size={15} /></span>
        <div>
          <strong>Always the real destination.</strong>
          <p>Social sign-in stays on each provider’s own website. Orbit does not host copied login pages or collect social passwords.</p>
        </div>
        <button type="button" onClick={() => onNavigate('integrations')}>How it works <ArrowUpRight size={14} /></button>
      </section>

      <footer className="directory-footer">
        <span>Made for a more considered social web.</span>
        <span><span className="directory-footer-status" /> {directorySites.length} curated destinations <span className="directory-footer-separator">·</span> Your accounts stay yours</span>
      </footer>
    </div>
  );
}
