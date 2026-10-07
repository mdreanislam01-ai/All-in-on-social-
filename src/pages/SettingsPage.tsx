import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Contrast,
  ExternalLink,
  KeyRound,
  LogOut,
  MonitorDown,
  Moon,
  ShieldCheck,
  Sun,
  Trash2,
} from 'lucide-react';
import type { AppUser } from '../auth/AuthProvider';
import { integrations } from '../integrations/registry';
import { BrandIcon } from '../components/BrandIcon';
import type { AppIntegration } from '../integrations/types';

export function SettingsPage({
  user,
  authConfigured,
  theme,
  onThemeChange,
  onSignOut,
  onDetails,
  onClearActivity,
  activityCount,
  canInstall,
  onInstall,
}: {
  user: AppUser;
  authConfigured: boolean;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onSignOut: () => void;
  onDetails: (integration: AppIntegration) => void;
  onClearActivity: () => void;
  activityCount: number;
  canInstall: boolean;
  onInstall: () => void;
}) {
  return (
    <div className="page-content settings-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">MAKE ORBIT YOURS</span>
          <h1>Settings<span className="heading-period">.</span></h1>
          <p>Manage your workspace, appearance, and privacy choices.</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-main-column">
          <section className="settings-card account-settings-card">
            <div className="settings-card-heading"><div><span className="settings-overline">ACCOUNT</span><h2>Your profile</h2></div><span className={`account-mode-tag${user.isDemo ? ' account-mode-demo' : ''}`}>{user.isDemo ? 'PREVIEW' : 'SECURE'}</span></div>
            <div className="profile-settings-row">
              <span className="avatar avatar-settings">{user.name.slice(0, 1).toUpperCase()}</span>
              <div className="profile-settings-copy"><strong>{user.name}</strong><span>{user.email || 'Signed in with your email'}</span></div>
              <button type="button" className="button button-quiet signout-button" onClick={onSignOut}><LogOut size={15} /> Sign out</button>
            </div>
            {user.isDemo && <div className="demo-mode-note"><span className="demo-note-dot" /><p>You’re using a local preview profile. No credentials are saved. Configure Supabase Auth to enable passwordless sign-in for your own account.</p></div>}
          </section>

          <section className="settings-card appearance-card">
            <div className="settings-card-heading"><div><span className="settings-overline">PREFERENCES</span><h2>Appearance</h2></div><Contrast size={18} className="settings-heading-icon" /></div>
            <p className="settings-card-intro">Choose the mode that feels right. Your choice is saved on this device.</p>
            <div className="theme-choice-row" role="group" aria-label="Color theme">
              <button type="button" className={`theme-choice${theme === 'light' ? ' theme-choice-active' : ''}`} onClick={() => onThemeChange('light')} aria-pressed={theme === 'light'}>
                <span className="theme-preview theme-preview-light"><span /></span><span><strong>Light</strong><small>Bright and focused</small></span>{theme === 'light' && <span className="theme-choice-check"><Check size={12} /></span>}
              </button>
              <button type="button" className={`theme-choice${theme === 'dark' ? ' theme-choice-active' : ''}`} onClick={() => onThemeChange('dark')} aria-pressed={theme === 'dark'}>
                <span className="theme-preview theme-preview-dark"><span /></span><span><strong>Dark</strong><small>Easy on the eyes</small></span>{theme === 'dark' && <span className="theme-choice-check"><Check size={12} /></span>}
              </button>
            </div>
          </section>

          <section className="settings-card security-card">
            <div className="settings-card-heading"><div><span className="settings-overline">SECURITY</span><h2>Protected by design</h2></div><div className="settings-shield"><ShieldCheck size={21} /></div></div>
            <div className="security-check-list">
              <div><span><Check size={13} /></span><p><strong>No social passwords</strong><small>Orbit never asks for or stores third-party credentials.</small></p></div>
              <div><span><Check size={13} /></span><p><strong>Official sign-in only</strong><small>Platform login happens on the provider’s own domain.</small></p></div>
              <div><span><Check size={13} /></span><p><strong>{authConfigured ? 'Passwordless account access' : 'First-party auth is not configured'}</strong><small>{authConfigured ? 'This workspace uses Supabase email links with PKCE.' : 'Add Supabase settings to enable secure email-link sign-in.'}</small></p></div>
            </div>
            <a className="settings-doc-link" href="https://supabase.com/docs/guides/auth/auth-email-passwordless" target="_blank" rel="noopener noreferrer">Passwordless sign-in details <ArrowUpRight size={14} /></a>
          </section>
        </div>

        <div className="settings-side-column">
          <section className="settings-card connected-settings-card">
            <div className="settings-card-heading"><div><span className="settings-overline">SOCIAL ACCOUNTS</span><h2>Connections</h2></div><span className="settings-connected-count">0 / {integrations.length}</span></div>
            <p className="settings-card-intro" lang="bn">সাইট খোলা আর API কানেকশন দুই আলাদা জিনিস — শুধু ভিজিট করলে কোনো অ্যাকাউন্ট connected হয় না।</p>
            <div className="settings-integration-list">
              {integrations.map((integration) => (
                <div className="settings-integration-row" key={integration.id}>
                  <BrandIcon integration={integration} size="mini" />
                  <div className="settings-integration-copy"><strong>{integration.name}</strong><span>Not connected</span></div>
                  <button type="button" className="settings-integration-action" onClick={() => onDetails(integration)} aria-label={`View ${integration.name} connection details`}><ChevronRight size={17} /></button>
                </div>
              ))}
            </div>
            <a href="https://developers.facebook.com/" className="settings-all-integrations" target="_blank" rel="noopener noreferrer">Explore official APIs <ExternalLink size={13} /></a>
          </section>

          <section className="settings-card pwa-settings-card">
            <div className="pwa-card-icon"><MonitorDown size={19} /></div>
            <span className="settings-overline">OPTIONAL INSTALL</span>
            <h2>Take Orbit with you</h2>
            <p>Install for quick launch, or keep using the browser. The browser Back button is what brings you here after signing in on the official site — in installed app mode there is no Back button, so use “নতুন ট্যাবে খুলুন”.</p>
            {canInstall ? (
              <button type="button" className="button button-open pwa-install-button" onClick={onInstall}>Install Orbit <ArrowUpRight size={15} /></button>
            ) : (
              <div className="pwa-availability"><span className="pwa-availability-dot" /><span>Installable from your browser menu when supported</span></div>
            )}
          </section>

          <section className="settings-card data-settings-card">
            <div className="settings-card-heading"><div><span className="settings-overline">LOCAL DATA</span><h2>Your activity</h2></div><KeyRound size={17} className="settings-heading-icon" /></div>
            <p className="settings-card-intro">{activityCount === 0 ? 'No local shortcut history is saved.' : `${activityCount} recent shortcut ${activityCount === 1 ? 'event' : 'events'} in this session.`}</p>
            <button type="button" className="data-clear-button" onClick={onClearActivity} disabled={activityCount === 0}><Trash2 size={14} /> Clear local history</button>
          </section>
        </div>
      </div>

      <footer className="page-footer settings-footer"><span>Orbit stays in your browser.</span><span><Sun size={13} className="footer-sun" /><Moon size={13} className="footer-moon" /> {theme === 'dark' ? 'Dark mode' : 'Light mode'} on this device</span></footer>
    </div>
  );
}
