import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  CheckCheck,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings2,
  Sun,
  X,
} from 'lucide-react';
import { Wordmark } from './AppLogo';
import type { AppUser } from '../auth/AuthProvider';
import type { ViewName } from './Sidebar';

const pageLabels: Record<ViewName, string> = {
  overview: 'Overview',
  integrations: 'Integrations',
  activity: 'Activity',
  settings: 'Settings',
};

export function TopBar({
  view,
  user,
  theme,
  onToggleTheme,
  search,
  onSearchChange,
  onNavigate,
  onSignOut,
  onOpenSidebar,
}: {
  view: ViewName;
  user: AppUser;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  onNavigate: (view: ViewName) => void;
  onSignOut: () => void;
  onOpenSidebar: () => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(target)) setNotificationsOpen(false);
    }
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setNotificationsOpen(false);
  }, [view]);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    }
    document.addEventListener('keydown', focusSearch);
    return () => document.removeEventListener('keydown', focusSearch);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-start">
        <button type="button" className="icon-button mobile-menu-button" onClick={onOpenSidebar} aria-label="Open navigation">
          <Menu size={21} />
        </button>
        <div className="mobile-wordmark"><Wordmark /></div>
        <div className="desktop-page-label"><span>WORKSPACE</span><strong>{pageLabels[view]}</strong></div>
      </div>

      <div className="topbar-actions">
        <div className="global-search" role="search" aria-label="Search social apps">
          <button type="button" className="search-icon-button" onClick={() => searchInputRef.current?.focus()} aria-label="Focus app search">
            <Search size={16} strokeWidth={1.9} />
          </button>
          <input
            ref={searchInputRef}
            type="search"
            aria-label="Search apps"
            placeholder="Search apps"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && search.trim()) onNavigate('integrations');
              if (event.key === 'Escape') onSearchChange('');
            }}
          />
          {search && <button type="button" className="search-clear" onClick={() => onSearchChange('')} aria-label="Clear search"><X size={14} /></button>}
          {!search && <kbd>⌘ K</kbd>}
        </div>

        <button type="button" className="icon-button theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={18} />}
        </button>

        <div className="topbar-popover-wrap" ref={notificationsRef}>
          <button
            type="button"
            className={`icon-button notification-button${notificationsOpen ? ' control-active' : ''}`}
            onClick={() => { setNotificationsOpen((current) => !current); setProfileOpen(false); }}
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
          >
            <Bell size={18} />
            <span className="notification-indicator" />
          </button>
          {notificationsOpen && (
            <div className="topbar-popover notifications-popover">
              <div className="popover-heading"><div><strong>Notifications</strong><span>Just for you</span></div><button type="button" className="icon-button popover-close" onClick={() => setNotificationsOpen(false)} aria-label="Close notifications"><X size={15} /></button></div>
              <div className="notification-empty-icon"><CheckCheck size={19} /></div>
              <strong className="notification-empty-title">You're all caught up</strong>
              <p>No new alerts right now. We'll let you know when something needs your attention.</p>
            </div>
          )}
        </div>

        <div className="topbar-popover-wrap profile-wrap" ref={profileRef}>
          <button
            type="button"
            className={`profile-trigger${profileOpen ? ' control-active' : ''}`}
            onClick={() => { setProfileOpen((current) => !current); setNotificationsOpen(false); }}
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
          >
            <span className="avatar avatar-topbar">{user.name.slice(0, 1).toUpperCase()}</span>
            <span className="profile-trigger-copy"><strong>{user.name.split(' ')[0]}</strong><small>{user.isDemo ? 'Preview' : 'Personal'}</small></span>
            <ChevronDown size={15} className="profile-chevron" />
          </button>
          {profileOpen && (
            <div className="topbar-popover profile-popover">
              <div className="profile-popover-user"><span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span><div><strong>{user.name}</strong><span>{user.isDemo ? 'Demo workspace' : user.email}</span></div></div>
              <button type="button" className="popover-action" onClick={() => { onNavigate('settings'); setProfileOpen(false); }}><Settings2 size={16} /> Account settings</button>
              <button type="button" className="popover-action popover-signout" onClick={() => { setProfileOpen(false); onSignOut(); }}><LogOut size={16} /> Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
