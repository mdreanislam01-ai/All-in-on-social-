import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowUp,
  Bookmark,
  Compass,
  Info,
  Layers3,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings2,
  Sun,
  X,
} from 'lucide-react';
import type { AppUser } from '../auth/AuthProvider';
import type { ViewName } from './Sidebar';
import { Wordmark } from './AppLogo';

const menuViews: { id: ViewName; label: string; icon: typeof Compass }[] = [
  { id: 'overview', label: 'Explore directory', icon: Compass },
  { id: 'integrations', label: 'Integrations', icon: Layers3 },
  { id: 'activity', label: 'Recent activity', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

export function DirectoryHeader({
  view,
  user,
  theme,
  siteCount,
  savedCount,
  onNavigate,
  onHome,
  onToggleTheme,
  onOpenBookmarks,
  onOpenAbout,
  onFocusSearch,
  onScrollTop,
  onSignOut,
}: {
  view: ViewName;
  user: AppUser;
  theme: 'light' | 'dark';
  siteCount: number;
  savedCount: number;
  onNavigate: (view: ViewName) => void;
  onHome: () => void;
  onToggleTheme: () => void;
  onOpenBookmarks: () => void;
  onOpenAbout: () => void;
  onFocusSearch: () => void;
  onScrollTop: () => void;
  onSignOut: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setMenuOpen(false);
        onFocusSearch();
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', handleKeyboard);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', handleKeyboard);
    };
  }, [onFocusSearch]);

  useEffect(() => setMenuOpen(false), [view]);

  function navigate(next: ViewName) {
    onNavigate(next);
    setMenuOpen(false);
  }

  return (
    <header className="directory-topbar">
      <div className="directory-topbar-inner">
        <button
          type="button"
          className="directory-brand-button"
          onClick={onHome}
          aria-label="Orbit home"
        >
          <Wordmark />
          <span className="directory-brand-divider" aria-hidden="true" />
          <span className="directory-brand-caption">SOCIAL DIRECTORY</span>
        </button>

        <div className="directory-topbar-actions">
          <span className="directory-site-count"><span className="directory-count-dot" />{siteCount} curated sites</span>
          <button type="button" className="directory-bookmark-trigger" onClick={onOpenBookmarks}>
            <Bookmark size={16} />
            <span>Saved</span>
            <span className="directory-bookmark-count" aria-label={`${savedCount} saved sites`}>{savedCount}</span>
          </button>
          <div className="directory-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className={`directory-menu-trigger${menuOpen ? ' directory-menu-trigger-open' : ''}`}
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
              <span>Menu</span>
            </button>
            {menuOpen && (
              <div className="directory-menu-popover" role="menu" aria-label="Orbit menu">
                <div className="directory-menu-account">
                  <span className="directory-avatar">{user.name.slice(0, 1).toUpperCase()}</span>
                  <span className="directory-account-copy">
                    <strong>{user.name}</strong>
                    <small>{user.isDemo ? 'Preview workspace' : user.email}</small>
                  </span>
                  {user.isDemo && <span className="directory-preview-badge">PREVIEW</span>}
                </div>

                <div className="directory-menu-section-label">YOUR WORKSPACE</div>
                <nav className="directory-menu-nav" aria-label="Workspace pages">
                  {menuViews.map(({ id, label, icon: Icon }) => (
                    <button
                      type="button"
                      role="menuitem"
                      className={`directory-menu-item${view === id ? ' directory-menu-item-active' : ''}`}
                      key={id}
                      onClick={() => navigate(id)}
                      aria-current={view === id ? 'page' : undefined}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                      {view === id && <span className="directory-menu-current-dot" />}
                    </button>
                  ))}
                </nav>

                <div className="directory-menu-separator" />
                <button type="button" className="directory-menu-item" role="menuitem" onClick={() => { onOpenBookmarks(); setMenuOpen(false); }}>
                  <Bookmark size={16} />
                  <span>My saved sites</span>
                  <span className="directory-menu-count">{savedCount}</span>
                </button>
                <button type="button" className="directory-menu-item" role="menuitem" onClick={() => { onOpenAbout(); setMenuOpen(false); }}>
                  <Info size={16} />
                  <span>About Orbit</span>
                </button>
                <button type="button" className="directory-menu-item" role="menuitem" onClick={() => { onFocusSearch(); setMenuOpen(false); }}>
                  <Search size={16} />
                  <span>Search directory</span>
                  <kbd>⌘ K</kbd>
                </button>
                <button type="button" className="directory-menu-item" role="menuitem" onClick={() => { onScrollTop(); setMenuOpen(false); }}>
                  <ArrowUp size={16} />
                  <span>Back to top</span>
                </button>
                <button type="button" className="directory-menu-item" role="menuitem" onClick={onToggleTheme}>
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  <span>Use {theme === 'dark' ? 'light' : 'dark'} theme</span>
                </button>
                <div className="directory-menu-separator" />
                <button type="button" className="directory-menu-item directory-menu-signout" role="menuitem" onClick={onSignOut}>
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
