import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './auth/AuthProvider';
import { AppWorkspace } from './components/AppWorkspace';
import { IntegrationDialog } from './components/IntegrationDialog';
import { MobileNavigation, Sidebar, type ViewName } from './components/Sidebar';
import { Toast, type ToastMessage } from './components/Toast';
import { TopBar } from './components/TopBar';
import { getIntegration, integrations } from './integrations/registry';
import {
  consumeReturn,
  peekReturn,
  rememberDeparture,
} from './integrations/launch';
import type { ActivityEntry, AppIntegration } from './integrations/types';
import { usePwaInstall } from './hooks/usePwaInstall';
import { ActivityPage } from './pages/ActivityPage';
import { AuthPage } from './pages/AuthPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { OverviewPage } from './pages/OverviewPage';
import { SettingsPage } from './pages/SettingsPage';

type ColorTheme = 'light' | 'dark';
type SpaceId = AppIntegration['id'];

function isSpaceId(value: string | null): value is SpaceId {
  return value === 'facebook' || value === 'whatsapp' || value === 'messenger' || value === 'tiktok';
}

function readSpaceFromUrl(): SpaceId | null {
  const value = new URLSearchParams(window.location.search).get('space');
  return isSpaceId(value) ? value : null;
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

  useEffect(() => {
    // Coming back with the browser back button: the tab left for an official
    // site and sessionStorage still remembers which one.
    const welcomeBack = (pendingId: SpaceId) => {
      setSpaceId(pendingId);
      setReturned(true);
      const integration = getIntegration(pendingId);
      if (integration) rememberActivity(integration, 'returned');
      showToast({
        title: 'আপনি Orbit-এ ফিরে এসেছেন',
        description: 'লগইন অফিসিয়াল সাইটেই থাকে। ভিজিট করলে অ্যাকাউন্ট connected হয় না।',
      });
    };

    const pending = peekReturn();
    const fromUrl = readSpaceFromUrl();
    if (pending && (!fromUrl || fromUrl === pending.id)) {
      consumeReturn();
      welcomeBack(pending.id);
    } else if (fromUrl) {
      setSpaceId(fromUrl);
    }

    const onPopState = () => {
      const next = readSpaceFromUrl();
      setSpaceId(next);
      if (!next) setReturned(false);
    };
    // bfcache restores the page without a fresh mount, so listen for it too.
    const onPageShow = () => {
      const restored = peekReturn();
      if (!restored) return;
      consumeReturn();
      welcomeBack(restored.id);
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('pageshow', onPageShow);
    };
    // Mount only: this decides what to show when the tab comes back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const labels: Record<ViewName, string> = {
      overview: 'Overview',
      integrations: 'Integrations',
      activity: 'Activity',
      settings: 'Settings',
    };
    document.title = `${labels[view]} · Orbit`;
  }, [view]);

  const connectedCount = useMemo(
    () => integrations.filter((integration) => integration.status === 'connected').length,
    [],
  );

  const filteredIntegrations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return integrations;
    return integrations.filter((integration) =>
      `${integration.name} ${integration.description} ${integration.authorizationMethod}`.toLowerCase().includes(query),
    );
  }, [search]);

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

  /** Cards open Orbit's own open screen, which carries the real https links. */
  const openSpace = useCallback((integration: AppIntegration) => {
    setSelectedIntegration(null);
    setReturned(false);
    setSpaceId(integration.id);
    if (readSpaceFromUrl() !== integration.id) writeSpace(integration.id, 'push');
  }, []);

  /**
   * Fired when a person actually follows a link to an official site. The link
   * itself does the navigating; this only records the local shortcut history
   * and leaves a marker so the workspace can greet them on the way back.
   */
  const handleOpenOfficial = useCallback((integration: AppIntegration) => {
    rememberDeparture(integration.id);
    setReturned(false);
    rememberActivity(integration, 'opened');
  }, [rememberActivity]);

  const closeSpace = useCallback(() => {
    if (window.history.state && 'orbitSpace' in window.history.state) {
      window.history.back();
      return;
    }
    writeSpace(null, 'replace');
    setSpaceId(null);
    setReturned(false);
  }, []);

  const navigate = useCallback((next: ViewName) => {
    setView(next);
    if (readSpaceFromUrl() || spaceId) {
      writeSpace(null, 'replace');
      setSpaceId(null);
      setReturned(false);
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
          {spaceId && getIntegration(spaceId) ? (
            <AppWorkspace
              integration={getIntegration(spaceId)!}
              returned={returned}
              onOpen={handleOpenOfficial}
              onClose={closeSpace}
            />
          ) : view === 'overview' && (
            <OverviewPage
              name={user.name}
              apps={filteredIntegrations}
              connectedCount={connectedCount}
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
              onOpen={openSpace}
              onDetails={setSelectedIntegration}
              search={search.trim()}
            />
          )}
          {!spaceId && view === 'activity' && (
            <ActivityPage
              activity={activity}
              onClear={clearActivity}
              onOpen={openSpace}
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
      <IntegrationDialog integration={selectedIntegration} onClose={closeDialog} onOpen={handleOpenOfficial} />
      <Toast
        message={toast}
        onDismiss={() => setToast(null)}
        onBack={() => { setToast(null); navigate('overview'); }}
      />
    </div>
  );
}
