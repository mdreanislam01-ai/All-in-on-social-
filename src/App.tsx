import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './auth/AuthProvider';
import { IntegrationDialog } from './components/IntegrationDialog';
import { MobileNavigation, Sidebar, type ViewName } from './components/Sidebar';
import { Toast, type ToastMessage } from './components/Toast';
import { TopBar } from './components/TopBar';
import { integrations } from './integrations/registry';
import type { ActivityEntry, AppIntegration } from './integrations/types';
import { usePwaInstall } from './hooks/usePwaInstall';
import { ActivityPage } from './pages/ActivityPage';
import { AuthPage } from './pages/AuthPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { OverviewPage } from './pages/OverviewPage';
import { SettingsPage } from './pages/SettingsPage';

type ColorTheme = 'light' | 'dark';

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

  const handleOpenIntegration = useCallback((integration: AppIntegration) => {
    setActivity((current) => [
      {
        id: `${integration.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        integrationId: integration.id,
        action: 'opened' as const,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ].slice(0, 30));
    showToast({
      title: `${integration.name} opened in a new tab`,
      description: 'Sign in directly with the official platform, then return here whenever you’re ready.',
    });
  }, [showToast]);

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
        onNavigate={setView}
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
          onNavigate={setView}
          onSignOut={() => void handleSignOut()}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        <div className="main-scroll-area">
          {view === 'overview' && (
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
          {view === 'integrations' && (
            <IntegrationsPage
              apps={filteredIntegrations}
              connectedCount={connectedCount}
              onOpen={handleOpenIntegration}
              onDetails={setSelectedIntegration}
              search={search.trim()}
            />
          )}
          {view === 'activity' && (
            <ActivityPage
              activity={activity}
              onClear={clearActivity}
              onOpen={handleOpenIntegration}
            />
          )}
          {view === 'settings' && (
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
      <IntegrationDialog integration={selectedIntegration} onClose={closeDialog} />
      <Toast
        message={toast}
        onDismiss={() => setToast(null)}
        onBack={() => { setToast(null); setView('overview'); }}
      />
    </div>
  );
}
