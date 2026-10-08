import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './auth/AuthProvider';
import { IntegrationDialog } from './components/IntegrationDialog';
import { MobileNavigation, Sidebar, type ViewName } from './components/Sidebar';
import { OpenSpaceScreen } from './components/OpenSpaceScreen';
import { Toast, type ToastMessage } from './components/Toast';
import { TopBar } from './components/TopBar';
import { getIntegration, integrations } from './integrations/registry';
import { consumeReturn, SWALLOWED_TAP_MS } from './integrations/launch';
import type { ActivityEntry, AppIntegration, IntegrationId } from './integrations/types';
import { usePwaInstall } from './hooks/usePwaInstall';
import { ActivityPage } from './pages/ActivityPage';
import { AuthPage } from './pages/AuthPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { OverviewPage } from './pages/OverviewPage';
import { SettingsPage } from './pages/SettingsPage';

type ColorTheme = 'light' | 'dark';
type SpaceId = IntegrationId;

/**
 * Orbit owns exactly one piece of state per provider visit: which instruction
 * screen is open, and whether the person just came back. Connection status
 * lives in the registry and is never written from here, so a visit can never
 * mark an account as connected.
 */
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
    return localStorage.getItem('orbit-theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function App() {
  const { user, loading, authConfigured, signInWithEmail, continueAsDemo, signOut } = useAuth();
  const [view, setView] = useState<ViewName>('overview');
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState<ColorTheme>(readSavedTheme);
  const [selectedIntegration, setSelectedIntegration] = useState<AppIntegration | null>(null);
  const [spaceId, setSpaceId] = useState<SpaceId | null>(null);
  const [returned, setReturned] = useState(false);
  /** True when the open screen should start with its help panel expanded. */
  const [helpAutoOpen, setHelpAutoOpen] = useState(false);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);
  const { canInstall, install } = usePwaInstall();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111521' : '#f6f7fb');
    try {
      localStorage.setItem('orbit-theme', theme);
    } catch {
      // A blocked storage API should not prevent the interface from working.
    }
  }, [theme]);

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [view]);

  const showToast = useCallback((message: ToastMessage) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 6200);
  }, []);

  const rememberActivity = useCallback((integration: AppIntegration, action: ActivityEntry['action']) => {
    setActivity((current) => [
      {
        id: `${integration.id}-${action}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        integrationId: integration.id,
        action,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ].slice(0, 30));
  }, []);

  /**
   * Landing back on Orbit after an official-site visit. Two signals, because
   * phones do both: the history entry the open screen reserved (popstate with
   * ?space&id&returned=1) and, after a real reload, the short-lived
   * sessionStorage marker (pageshow). The first visit detection is also what
   * fires when a card link is used — then there is no screen to reopen, just
   * a quiet note on the dashboard. Neither path touches connection status.
   */
  const settleReturn = useCallback(() => {
    const pending = consumeReturn();
    if (!pending) return;
    const integration = getIntegration(pending.id);
    if (!integration) return;
    rememberActivity(integration, 'returned');
    if (pending.awayMs < SWALLOWED_TAP_MS) {
      // Back within seconds of a same-tab tap means the site never opened: an
      // app link or the in-app browser swallowed it. Not a visit — so no
      // "welcome back"; instead the guide screen opens itself at the fix steps.
      setHelpAutoOpen(true);
      setSpaceId(pending.id);
      setReturned(false);
      // Always replace: this normalizes any `?returned=1` the reserved history
      // entry left behind, since this was no visit.
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
      overview: 'Overview',
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

  /** A clicked open link is only a local shortcut record — never a login event. */
  const markVisited = useCallback((integration: AppIntegration) => {
    rememberActivity(integration, 'opened');
  }, [rememberActivity]);

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
    <div className="app-shell">
      <Sidebar
        view={view}
        onNavigate={navigate}
        user={user}
        onSignOut={() => void handleSignOut()}
        onClose={() => setSidebarOpen(false)}
        open={sidebarOpen}
        integrationCount={integrations.length}
      />
      <main className="main-column">
        <TopBar
          view={view}
          user={user}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          search={search}
          onSearchChange={setSearch}
          onNavigate={navigate}
          onSignOut={() => void handleSignOut()}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        <div className="main-scroll-area">
          {activeIntegration ? (
            <OpenSpaceScreen
              key={`${activeIntegration.id}${helpAutoOpen ? ':help' : ''}`}
              integration={activeIntegration}
              returned={returned}
              helpInitiallyOpen={helpAutoOpen}
              onVisit={markVisited}
              onClose={closeSpace}
            />
          ) : view === 'overview' && (
            <OverviewPage
              name={user.name}
              apps={filteredIntegrations}
              connectedCount={connectedCount}
              onVisit={markVisited}
              onOpen={openSpace}
              onDetails={setSelectedIntegration}
              onNavigate={() => setView('integrations')}
              search={search.trim()}
            />
          )}
          {!spaceId && view === 'integrations' && (
            <IntegrationsPage
              apps={filteredIntegrations}
              connectedCount={connectedCount}
              onVisit={markVisited}
              onOpen={openSpace}
              onDetails={setSelectedIntegration}
              search={search.trim()}
            />
          )}
          {!spaceId && view === 'activity' && (
            <ActivityPage
              activity={activity}
              onClear={clearActivity}
              onVisit={markVisited}
            />
          )}
          {!spaceId && view === 'settings' && (
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
        <MobileNavigation view={view} onNavigate={setView} />
      </main>
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
