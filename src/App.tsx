import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './auth/AuthProvider';
import { AppWorkspace } from './components/AppWorkspace';
import { IntegrationDialog } from './components/IntegrationDialog';
import { MobileNavigation, Sidebar, type ViewName } from './components/Sidebar';
import { Toast, type ToastMessage } from './components/Toast';
import { TopBar } from './components/TopBar';
import { getIntegration, integrations } from './integrations/registry';
import {
  assignWithReturn,
  closeOfficialWindow,
  consumeReturn,
  isInAppBrowser,
  isStandaloneDisplay,
  openOfficialWindow,
  peekReturn,
  windowNameFor,
  type LaunchHandle,
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
  const [session, setSession] = useState<LaunchHandle | null>(null);
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
    const comingBack = peekReturn();
    const fromUrl = readSpaceFromUrl();
    const returnedFlag = new URLSearchParams(window.location.search).get('returned') === '1';
    if (comingBack && (returnedFlag || fromUrl === comingBack.id)) {
      consumeReturn();
      setSpaceId(comingBack.id);
      setReturned(true);
      writeSpace(comingBack.id, 'replace');
    } else if (fromUrl) {
      setSpaceId(fromUrl);
      setReturned(returnedFlag);
    }

    const onPopState = () => {
      const next = readSpaceFromUrl();
      setSpaceId(next);
      setReturned(new URLSearchParams(window.location.search).get('returned') === '1');
      if (!next) setSession(null);
    };
    const onPageShow = () => {
      const pending = peekReturn();
      if (!pending) return;
      consumeReturn();
      setSpaceId(pending.id);
      setReturned(true);
      setSession(null);
      writeSpace(pending.id, 'replace');
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('pageshow', onPageShow);
    };
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

  const openSpace = useCallback((integration: AppIntegration) => {
    setSelectedIntegration(null);
    setReturned(false);
    setSession(null);
    setSpaceId(integration.id);
    if (readSpaceFromUrl() !== integration.id) writeSpace(integration.id, 'push');
    rememberActivity(integration, 'opened');
  }, [rememberActivity]);

  const launchPopup = useCallback((integration: AppIntegration) => {
    const handle = openOfficialWindow(integration.providerUrl, windowNameFor(integration.id));
    setSession(handle);
    setReturned(false);
    if (handle.mode === 'blocked') {
      showToast({
        title: `${integration.name} ওপেন হয়নি`,
        description: 'পপআপ ব্লক হয়েছে। Orbit-এর ভিতরের Chrome বা “এই ট্যাবে খুলুন” ব্যবহার করুন।',
      });
    }
  }, [showToast]);

  const handleOpenIntegration = useCallback((integration: AppIntegration) => {
    openSpace(integration);
    const phone = window.matchMedia('(max-width: 760px)').matches || isInAppBrowser() || isStandaloneDisplay();
    const staysForReturn = integration.id === 'whatsapp' || integration.id === 'messenger';
    // On a phone, open the in-site workspace first. A raw new tab is what made
    // Facebook/TikTok look closed and WhatsApp/Messenger never come back.
    if (!phone && !staysForReturn) launchPopup(integration);
  }, [launchPopup, openSpace]);

  const handleLaunchSameTab = useCallback((integration: AppIntegration) => {
    assignWithReturn(integration.id, integration.providerUrl);
  }, []);

  const handleReturn = useCallback((integration: AppIntegration) => {
    closeOfficialWindow(session);
    setSession(null);
    setReturned(true);
    window.focus();
    rememberActivity(integration, 'returned');
    showToast({
      title: 'আপনি Orbit-এ ফিরে এসেছেন',
      description: `${integration.name}-এর লগইন অফিসিয়াল সাইটেই থাকে। পাসওয়ার্ড এখানে আসে না।`,
    });
  }, [rememberActivity, session, showToast]);

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
              session={session}
              returned={returned}
              onLaunchPopup={() => launchPopup(getIntegration(spaceId)!)}
              onLaunchSameTab={() => handleLaunchSameTab(getIntegration(spaceId)!)}
              onReturn={() => handleReturn(getIntegration(spaceId)!)}
              onClose={closeSpace}
            />
          ) : view === 'overview' && (
            <OverviewPage
              name={user.name}
              apps={filteredIntegrations}
              connectedCount={connectedCount}
              onOpen={handleOpenIntegration}
              onDetails={setSelectedIntegration}
              onNavigate={() => setView('integrations')}
              search={search.trim()}
            />
          )}
          {!spaceId && view === 'integrations' && (
            <IntegrationsPage
              apps={filteredIntegrations}
              connectedCount={connectedCount}
              onOpen={handleOpenIntegration}
              onDetails={setSelectedIntegration}
              search={search.trim()}
            />
          )}
          {!spaceId && view === 'activity' && (
            <ActivityPage
              activity={activity}
              onClear={clearActivity}
              onOpen={handleOpenIntegration}
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
      <IntegrationDialog integration={selectedIntegration} onClose={closeDialog} onOpen={handleOpenIntegration} />
      <Toast
        message={toast}
        onDismiss={() => setToast(null)}
        onBack={() => { setToast(null); setView('overview'); }}
      />
    </div>
  );
}
