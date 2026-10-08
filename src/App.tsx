import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';
import { AboutDialog } from './components/AboutDialog';
import { BookmarkDrawer } from './components/BookmarkDrawer';
import { DirectoryHeader } from './components/DirectoryHeader';
import { IntegrationDialog } from './components/IntegrationDialog';
import { OpenSpaceScreen } from './components/OpenSpaceScreen';
import { Toast, type ToastMessage } from './components/Toast';
import { consumeReturn, SWALLOWED_TAP_MS } from './integrations/launch';
import { getIntegration, integrations } from './integrations/registry';
import type { ActivityEntry, AppIntegration, IntegrationId } from './integrations/types';
import { usePwaInstall } from './hooks/usePwaInstall';
import { directorySites, getDirectorySite, type DirectorySite } from './directory/catalog';
import type { ViewName } from './components/Sidebar';
import { ActivityPage } from './pages/ActivityPage';
import { AuthPage } from './pages/AuthPage';
import { DirectoryPage } from './pages/DirectoryPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { SettingsPage } from './pages/SettingsPage';

type ColorTheme = 'light' | 'dark';
type SpaceId = IntegrationId;

function readSpaceFromUrl(): SpaceId | null {
  const value = new URLSearchParams(window.location.search).get('space');
  return value && integrations.some((integration) => integration.id === value) ? (value as SpaceId) : null;
}

function writeSpace(id: SpaceId | null, mode: 'push' | 'replace') {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set('space', id);
  else url.searchParams.delete('space');
  url.searchParams.delete('returned');
  const next = `${url.pathname}${url.search}${url.hash}`;
  const state = id ? { orbitSpace: id } : {};
  if (mode === 'push') window.history.pushState(state, '', next);
  else window.history.replaceState(state, '', next);
}

function readSavedTheme(): ColorTheme {
  try {
    return localStorage.getItem('orbit-theme') === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function readSavedSiteIds(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('orbit-saved-sites') ?? '[]');
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((id): id is string =>
      typeof id === 'string' && directorySites.some((site) => site.id === id),
    ))];
  } catch {
    return [];
  }
}

export function App() {
  const { user, loading, authConfigured, signInWithEmail, continueAsDemo, signOut } = useAuth();
  const [view, setView] = useState<ViewName>('overview');
  const [search, setSearch] = useState('');
  const [directoryReset, setDirectoryReset] = useState(0);
  const [theme, setTheme] = useState<ColorTheme>(readSavedTheme);
  const [selectedIntegration, setSelectedIntegration] = useState<AppIntegration | null>(null);
  const [spaceId, setSpaceId] = useState<SpaceId | null>(null);
  const [returned, setReturned] = useState(false);
  const [helpAutoOpen, setHelpAutoOpen] = useState(false);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [savedSiteIds, setSavedSiteIds] = useState<string[]>(readSavedSiteIds);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const { canInstall, install } = usePwaInstall();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b0a1b' : '#f6f7fb');
    try {
      localStorage.setItem('orbit-theme', theme);
    } catch {
      // A blocked storage API should not prevent the interface from working.
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('orbit-saved-sites', JSON.stringify(savedSiteIds));
    } catch {
      // Bookmarks remain usable for this session if storage is unavailable.
    }
  }, [savedSiteIds]);

  useEffect(() => {
    const syncSavedSites = (event: StorageEvent) => {
      if (event.key === 'orbit-saved-sites') setSavedSiteIds(readSavedSiteIds());
    };
    window.addEventListener('storage', syncSavedSites);
    return () => window.removeEventListener('storage', syncSavedSites);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = useCallback((message: ToastMessage) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 6200);
  }, []);

  const rememberActivity = useCallback((siteId: string, action: ActivityEntry['action']) => {
    const site = getDirectorySite(siteId);
    if (!site) return;
    setActivity((current) => [
      {
        id: `${siteId}-${action}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        siteId,
        action,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ].slice(0, 30));
  }, []);

  /** A provider visit is not an OAuth callback and never changes connection status. */
  const markVisited = useCallback((integration: AppIntegration) => {
    rememberActivity(integration.id, 'opened');
  }, [rememberActivity]);

  const markSiteVisited = useCallback((site: DirectorySite) => {
    rememberActivity(site.id, 'opened');
  }, [rememberActivity]);

  const settleReturn = useCallback(() => {
    const pending = consumeReturn();
    if (!pending) return;
    const integration = getIntegration(pending.id);
    if (!integration) return;
    rememberActivity(pending.id, 'returned');
    if (pending.awayMs < SWALLOWED_TAP_MS) {
      setHelpAutoOpen(true);
      setSpaceId(pending.id);
      setReturned(false);
      writeSpace(pending.id, 'replace');
      showToast({
        title: `${integration.name} খোলেনি বলে মনে হচ্ছে`,
        description: 'সাইটে যাওয়ার আগেই ফিরে এসেছেন — ফোন সম্ভবত লিংকটা গিলে ফেলেছে। নিচের “খুলতে সমস্যা হচ্ছে?” ধাপগুলো দেখুন।',
      });
    } else if (readSpaceFromUrl() === pending.id) {
      setSpaceId(pending.id);
      setReturned(true);
      writeSpace(pending.id, 'replace');
    } else {
      showToast({
        title: `${integration.name} থেকে ফিরে এসেছেন`,
        description: 'লগইন অফিসিয়াল সাইটেই আছে। Orbit কোনো পাসওয়ার্ড বা টোকেন পায়নি, তাই অ্যাকাউন্ট এখনো Not connected।',
      });
    }
  }, [rememberActivity, showToast]);

  useEffect(() => {
    const fromUrl = readSpaceFromUrl();
    const returnedFlag = new URLSearchParams(window.location.search).get('returned') === '1';
    if (fromUrl) {
      setSpaceId(fromUrl);
      setReturned(returnedFlag);
    }
    settleReturn();

    const onPopState = () => {
      setSpaceId(readSpaceFromUrl());
      setReturned(new URLSearchParams(window.location.search).get('returned') === '1');
      settleReturn();
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('pageshow', settleReturn);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('pageshow', settleReturn);
    };
  }, [settleReturn]);

  useEffect(() => {
    const labels: Record<ViewName, string> = {
      overview: 'Discover',
      integrations: 'Integrations',
      activity: 'Activity',
      settings: 'Settings',
    };
    const openName = spaceId ? getIntegration(spaceId)?.name : null;
    document.title = openName ? `${openName} · Orbit` : `${labels[view]} · Orbit`;
  }, [view, spaceId]);

  const connectedCount = useMemo(
    () => integrations.filter((integration) => integration.status === 'connected').length,
    [],
  );

  const filteredIntegrations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return integrations;
    return integrations.filter((integration) =>
      `${integration.name} ${integration.description} ${integration.descriptionBn} ${integration.authorizationMethod}`
        .toLowerCase()
        .includes(query),
    );
  }, [search]);

  const savedSites = useMemo(
    () => savedSiteIds.map((id) => getDirectorySite(id)).filter((site): site is DirectorySite => Boolean(site)),
    [savedSiteIds],
  );

  const openSpace = useCallback((integration: AppIntegration) => {
    setSelectedIntegration(null);
    setReturned(false);
    setHelpAutoOpen(false);
    setSpaceId(integration.id);
    if (readSpaceFromUrl() !== integration.id) writeSpace(integration.id, 'push');
  }, []);

  const closeSpace = useCallback(() => {
    if (window.history.state && 'orbitSpace' in window.history.state) {
      window.history.back();
      setHelpAutoOpen(false);
      return;
    }
    writeSpace(null, 'replace');
    setSpaceId(null);
    setReturned(false);
    setHelpAutoOpen(false);
  }, []);

  const navigate = useCallback((next: ViewName) => {
    setView(next);
    if (readSpaceFromUrl() || spaceId) {
      writeSpace(null, 'replace');
      setSpaceId(null);
      setReturned(false);
      setHelpAutoOpen(false);
    }
  }, [spaceId]);

  const resetDirectory = useCallback(() => {
    setSearch('');
    setDirectoryReset((current) => current + 1);
    navigate('overview');
  }, [navigate]);

  const focusDirectorySearch = useCallback(() => {
    navigate('overview');
    window.setTimeout(() => document.getElementById('directory-search')?.focus(), 0);
  }, [navigate]);

  const openBookmarks = useCallback(() => setBookmarksOpen(true), []);
  const closeBookmarks = useCallback(() => setBookmarksOpen(false), []);
  const openAbout = useCallback(() => setAboutOpen(true), []);
  const closeAbout = useCallback(() => setAboutOpen(false), []);
  const navigateToOverview = useCallback(() => navigate('overview'), [navigate]);

  const toggleBookmark = useCallback((siteId: string) => {
    const site = getDirectorySite(siteId);
    if (!site) return;
    const isSaved = savedSiteIds.includes(siteId);
    setSavedSiteIds(isSaved ? savedSiteIds.filter((id) => id !== siteId) : [...savedSiteIds, siteId]);
    showToast(isSaved
      ? { title: `${site.name} removed`, description: 'The site was removed from your saved list.' }
      : { title: `${site.name} saved`, description: 'You can find it in My saved sites.' });
  }, [savedSiteIds, showToast]);

  const clearBookmarks = useCallback(() => {
    if (savedSiteIds.length === 0) return;
    setSavedSiteIds([]);
    showToast({ title: 'Saved sites cleared', description: 'Your bookmark list is now empty on this device.' });
  }, [savedSiteIds.length, showToast]);

  const handleToggleTheme = useCallback(() => {
    setTheme((current) => current === 'light' ? 'dark' : 'light');
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setSelectedIntegration(null);
      setView('overview');
    } catch (error) {
      showToast({
        title: 'Could not sign out',
        description: error instanceof Error ? error.message : 'Please try again in a moment.',
      });
    }
  }, [showToast, signOut]);

  const clearActivity = useCallback(() => {
    setActivity([]);
    showToast({ title: 'Local history cleared', description: 'Your shortcut activity is removed from this session.' });
  }, [showToast]);

  const closeDialog = useCallback(() => setSelectedIntegration(null), []);

  if (loading || !user) {
    return (
      <AuthPage
        authConfigured={authConfigured}
        loading={loading}
        onSendMagicLink={signInWithEmail}
        onContinueDemo={continueAsDemo}
      />
    );
  }

  const activeIntegration = getIntegration(spaceId);

  return (
    <div className="app-shell directory-app-shell">
      <main className="main-column directory-main-column">
        <DirectoryHeader
          view={view}
          user={user}
          theme={theme}
          siteCount={directorySites.length}
          savedCount={savedSites.length}
          onNavigate={navigate}
          onHome={resetDirectory}
          onToggleTheme={handleToggleTheme}
          onOpenBookmarks={openBookmarks}
          onOpenAbout={openAbout}
          onFocusSearch={focusDirectorySearch}
          onScrollTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          onSignOut={() => void handleSignOut()}
        />
        <div className={`main-scroll-area${view === 'overview' && !activeIntegration ? ' directory-overview-scroll' : ''}`}>
          {activeIntegration ? (
            <OpenSpaceScreen
              key={`${activeIntegration.id}${helpAutoOpen ? ':help' : ''}`}
              integration={activeIntegration}
              returned={returned}
              helpInitiallyOpen={helpAutoOpen}
              onVisit={markVisited}
              onClose={closeSpace}
            />
          ) : view === 'overview' ? (
            <DirectoryPage
              key={directoryReset}
              search={search}
              onSearchChange={setSearch}
              savedSiteIds={savedSiteIds}
              activity={activity}
              onVisit={markSiteVisited}
              onToggleBookmark={toggleBookmark}
              onGuide={openSpace}
              onDetails={setSelectedIntegration}
              onNavigate={() => navigate('integrations')}
            />
          ) : view === 'integrations' ? (
            <IntegrationsPage
              apps={filteredIntegrations}
              connectedCount={connectedCount}
              onVisit={markVisited}
              onOpen={openSpace}
              onDetails={setSelectedIntegration}
              search={search.trim()}
            />
          ) : view === 'activity' ? (
            <ActivityPage activity={activity} onClear={clearActivity} onVisit={markSiteVisited} />
          ) : (
            <SettingsPage
              user={user}
              authConfigured={authConfigured}
              theme={theme}
              onThemeChange={setTheme}
              onSignOut={() => void handleSignOut()}
              onDetails={setSelectedIntegration}
              onClearActivity={clearActivity}
              activityCount={activity.length}
              canInstall={canInstall}
              onInstall={() => void install()}
            />
          )}
        </div>
      </main>

      <button
        type="button"
        className="directory-floating-bookmark"
        onClick={openBookmarks}
        aria-label={`Open saved sites, ${savedSites.length} saved`}
        title="My saved sites"
      >
        <Bookmark size={18} fill="currentColor" />
        <span>{savedSites.length}</span>
        <small>Saved</small>
      </button>

      <BookmarkDrawer
        open={bookmarksOpen}
        sites={savedSites}
        onClose={closeBookmarks}
        onRemove={toggleBookmark}
        onClear={clearBookmarks}
        onVisit={markSiteVisited}
        onExplore={navigateToOverview}
      />
      <AboutDialog
        open={aboutOpen}
        siteCount={directorySites.length}
        integrationCount={integrations.length}
        onClose={closeAbout}
        onNavigate={navigateToOverview}
      />
      <IntegrationDialog
        integration={selectedIntegration}
        onClose={closeDialog}
        onVisit={markVisited}
        onGuide={openSpace}
      />
      <Toast
        message={toast}
        onDismiss={() => setToast(null)}
        {...(spaceId
          ? { onBack: () => { setToast(null); navigate('overview'); }, backLabel: 'ড্যাশবোর্ডে যান' }
          : {})}
      />
    </div>
  );
}
