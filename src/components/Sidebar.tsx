import {
  Activity,
  Grid2X2,
  Layers3,
  Settings2,
  ShieldCheck,
  LogOut,
  X,
} from 'lucide-react';
import { Wordmark } from './AppLogo';
import type { AppUser } from '../auth/AuthProvider';

export type ViewName = 'overview' | 'integrations' | 'activity' | 'settings';

const navigation: { id: ViewName; label: string; icon: typeof Grid2X2 }[] = [
  { id: 'overview', label: 'Overview', icon: Grid2X2 },
  { id: 'integrations', label: 'Integrations', icon: Layers3 },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

export function Sidebar({
  view,
  onNavigate,
  user,
  onSignOut,
  onClose,
  open,
  integrationCount,
}: {
  view: ViewName;
  onNavigate: (view: ViewName) => void;
  user: AppUser;
  onSignOut: () => void;
  onClose: () => void;
  open: boolean;
  integrationCount: number;
}) {
  return (
    <>
      {open && <button type="button" className="sidebar-scrim" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`sidebar${open ? ' sidebar-open' : ''}`} aria-label="Primary navigation">
        <div className="sidebar-brand-row">
          <Wordmark />
          <button type="button" className="icon-button sidebar-close" onClick={onClose} aria-label="Close navigation">
            <X size={19} />
          </button>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-avatar">O</div>
          <div className="workspace-copy"><span>WORKSPACE</span><strong>Personal space</strong></div>
          <span className="workspace-caret" aria-hidden="true">⌄</span>
        </div>

        <span className="nav-overline">MENU</span>
        <nav className="sidebar-nav">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              className={`nav-link${view === id ? ' nav-link-active' : ''}`}
              type="button"
              key={id}
              onClick={() => { onNavigate(id); onClose(); }}
              aria-current={view === id ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={view === id ? 2.2 : 1.8} />
              <span>{label}</span>
              {id === 'integrations' && <span className="nav-count">{integrationCount}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-flex-spacer" />

        <div className="sidebar-security-card">
          <div className="sidebar-security-icon"><ShieldCheck size={17} /></div>
          <strong>Private by design</strong>
          <p>Your social passwords stay with their platforms.</p>
          <span className="sidebar-security-link">Official sign-in only <span aria-hidden="true">↗</span></span>
        </div>

        <div className="sidebar-account">
          <div className="avatar avatar-sidebar">{user.name.slice(0, 1).toUpperCase()}</div>
          <div className="sidebar-account-copy">
            <strong>{user.name}</strong>
            <span>{user.isDemo ? 'Preview workspace' : user.email}</span>
          </div>
          {user.isDemo && <span className="preview-dot" title="Demo session" />}
          <button type="button" className="sidebar-signout" onClick={onSignOut} aria-label="Sign out" title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}

export function MobileNavigation({
  view,
  onNavigate,
}: {
  view: ViewName;
  onNavigate: (view: ViewName) => void;
}) {
  const mobileNavigation = navigation;
  return (
    <nav className="mobile-navigation" aria-label="Mobile navigation">
      {mobileNavigation.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={`mobile-nav-link${view === id ? ' mobile-nav-active' : ''}`}
          onClick={() => onNavigate(id)}
          aria-current={view === id ? 'page' : undefined}
        >
          <Icon size={20} strokeWidth={view === id ? 2.2 : 1.8} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
