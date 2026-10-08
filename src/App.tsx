import { ArrowUp, Bookmark, Info, Menu, RotateCcw, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AboutDialog } from './components/AboutDialog';
import { BookmarkDrawer } from './components/BookmarkDrawer';
import { Pagination } from './components/Pagination';
import { SiteCard } from './components/SiteCard';
import { countByCategory, filterSites, PAGE_SIZE, ALL_CATEGORIES, type CategoryFilter } from './directory/filter';
import { directoryCategories, directorySites, type SiteCategory } from './directory/catalog';
import { readBookmarks, writeBookmarks } from './lib/storage';

const ALL_IDS = new Set(directorySites.map((site) => site.id));
const COUNTS = countByCategory();

export function App() {
  const [category, setCategory] = useState<CategoryFilter>(ALL_CATEGORIES);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [bookmarkIds, setBookmarkIds] = useState<string[]>(() => readBookmarks(ALL_IDS));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    writeBookmarks(bookmarkIds);
  }, [bookmarkIds]);

  useEffect(() => {
    document.title = 'Orbit — Social directory';
  }, []);

  // Escape closes whichever layer is open; the browser Back button is left alone.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      setDrawerOpen(false);
      setAboutOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen || aboutOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen, aboutOpen]);

  const filtered = useMemo(() => filterSites(category, query), [category, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);
  const savedSet = useMemo(() => new Set(bookmarkIds), [bookmarkIds]);
  const savedSites = useMemo(
    () => bookmarkIds.map((id) => directorySites.find((site) => site.id === id)).filter((site) => site !== undefined),
    [bookmarkIds],
  );

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: 'auto' }), []);

  const chooseCategory = (next: CategoryFilter) => {
    setCategory(next);
    setPage(1);
    scrollToTop();
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const changePage = (next: number) => {
    setPage(Math.min(Math.max(1, next), totalPages));
    scrollToTop();
  };

  const resetAll = () => {
    setCategory(ALL_CATEGORIES);
    setQuery('');
    setPage(1);
    setMenuOpen(false);
    scrollToTop();
  };

  const toggleBookmark = (id: string) => {
    setBookmarkIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const removeBookmark = (id: string) => setBookmarkIds((current) => current.filter((item) => item !== id));

  const clearBookmarks = () => setBookmarkIds([]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <a className="brand" href="/" onClick={(event) => { event.preventDefault(); resetAll(); }} aria-label="Orbit home">
            <span className="brand__mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="28" height="28">
                <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2.4" />
                <circle cx="16" cy="16" r="4.5" fill="currentColor" />
                <circle cx="27" cy="11" r="2.6" fill="currentColor" />
              </svg>
            </span>
            <span className="brand__name">Orbit</span>
          </a>

          <div className="search" role="search">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => changeQuery(event.target.value)}
              placeholder="Search sites"
              aria-label="Search sites"
            />
            {query && (
              <button type="button" className="search__clear" onClick={() => changeQuery('')} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>

          <div className="topbar__actions">
            <button type="button" className="icon-btn bookmark-trigger" onClick={() => setDrawerOpen(true)} aria-label={`Bookmarks (${bookmarkIds.length})`}>
              <Bookmark size={18} />
              {bookmarkIds.length > 0 && <span className="badge" aria-hidden="true">{bookmarkIds.length}</span>}
            </button>

            <div className="menu" ref={menuRef}>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Menu"
              >
                <Menu size={18} />
              </button>
              {menuOpen && (
                <div className="menu__panel" role="menu">
                  <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); scrollToTop(); }}>
                    <ArrowUp size={16} /> Back to top
                  </button>
                  <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); setDrawerOpen(true); }}>
                    <Bookmark size={16} /> Bookmarks
                  </button>
                  <button type="button" role="menuitem" onClick={resetAll}>
                    <RotateCcw size={16} /> Reset filters
                  </button>
                  <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); setAboutOpen(true); }}>
                    <Info size={16} /> About
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="intro">
          <h1>Social directory</h1>
          <p>{directorySites.length} official websites, grouped by category. Open any site in a new tab.</p>
        </section>

        <nav className="categories" aria-label="Categories">
          {(['All', ...directoryCategories] as const).map((item) => {
            const isAll = item === ALL_CATEGORIES;
            const count = isAll ? directorySites.length : COUNTS.get(item as SiteCategory) ?? 0;
            const active = category === item;
            return (
              <button
                key={item}
                type="button"
                className={`category-chip${active ? ' is-active' : ''}`}
                onClick={() => chooseCategory(item)}
                aria-pressed={active}
              >
                {item}
                <span className="category-chip__count">{count}</span>
              </button>
            );
          })}
        </nav>

        <div className="results-bar">
          <p>
            {filtered.length === 0
              ? 'No matching websites'
              : <>Showing <strong>{start + 1}–{start + visible.length}</strong> of <strong>{filtered.length}</strong> websites</>}
          </p>
          {bookmarkIds.length > 0 && (
            <button type="button" className="text-btn" onClick={() => setDrawerOpen(true)}>
              View bookmarks ({bookmarkIds.length})
            </button>
          )}
        </div>

        {visible.length > 0 ? (
          <div className="grid">
            {visible.map((site) => (
              <SiteCard key={site.id} site={site} saved={savedSet.has(site.id)} onToggleBookmark={toggleBookmark} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <Search size={28} aria-hidden="true" />
            <h2>No websites found</h2>
            <p>Try another word or choose a different category.</p>
            <button type="button" className="primary-btn" onClick={resetAll}>Show all websites</button>
          </div>
        )}

        <Pagination page={currentPage} total={totalPages} onChange={changePage} />
      </main>

      <footer className="footer">
        <span>Orbit</span>
        <span>Saved sites stay on this device.</span>
      </footer>

      <BookmarkDrawer
        open={drawerOpen}
        sites={savedSites}
        onClose={() => setDrawerOpen(false)}
        onRemove={removeBookmark}
        onClear={clearBookmarks}
      />
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
