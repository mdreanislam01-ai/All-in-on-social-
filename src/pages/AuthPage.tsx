import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Check,
  EyeOff,
  Fingerprint,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Wordmark } from '../components/AppLogo';
import { BrandIcon } from '../components/BrandIcon';
import { integrations } from '../integrations/registry';

export function AuthPage({
  authConfigured,
  loading,
  onSendMagicLink,
  onContinueDemo,
}: {
  authConfigured: boolean;
  loading: boolean;
  onSendMagicLink: (email: string) => Promise<void>;
  onContinueDemo: () => void;
}) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSendMagicLink(email.trim());
      setSentTo(email.trim());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not send a sign-in link. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-story-panel">
        <div className="auth-story-inner">
          <Wordmark light />
          <div className="auth-story-copy">
            <span className="hero-eyebrow auth-eyebrow"><span><Sparkles size={13} /></span> THE SOCIAL SPACE THAT FITS YOUR LIFE</span>
            <h1>Less app-hopping.<br />More <em>being there.</em></h1>
            <p>One thoughtful home for your social shortcuts, built around the way the web should work.</p>
          </div>
          <div className="auth-social-orbit" aria-hidden="true">
            <span className="auth-orbit-circle auth-circle-one" />
            <span className="auth-orbit-circle auth-circle-two" />
            <span className="auth-orbit-glow" />
            <span className="auth-floating-app auth-float-fb"><BrandIcon integration={integrations[0]} size="regular" /></span>
            <span className="auth-floating-app auth-float-wa"><BrandIcon integration={integrations[1]} size="regular" /></span>
            <span className="auth-floating-app auth-float-ms"><BrandIcon integration={integrations[2]} size="regular" /></span>
            <span className="auth-floating-app auth-float-tt"><BrandIcon integration={integrations[3]} size="regular" /></span>
            <span className="auth-orbit-spark auth-spark-a">✦</span><span className="auth-orbit-spark auth-spark-b">·</span>
          </div>
          <div className="auth-story-footer"><span><ShieldCheck size={15} /> Official sign-in only</span><span>FACEBOOK · WHATSAPP · MESSENGER · TIKTOK</span></div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-top"><Wordmark /><span>New to Orbit? <span className="auth-preview-label">A safe place to start.</span></span></div>
        <div className="auth-form-card">
          {loading ? (
            <div className="auth-loading-state"><span className="loading-spinner" /><strong>Checking your session…</strong><span>Just a moment.</span></div>
          ) : sentTo ? (
            <div className="auth-success-state">
              <span className="auth-success-icon"><Mail size={22} /></span>
              <span className="section-overline">CHECK YOUR INBOX</span>
              <h2>Your sign-in link is on its way.</h2>
              <p>We sent a secure one-time link to <strong>{sentTo}</strong>. Open it to return to Orbit. No password needed.</p>
              <button type="button" className="text-button auth-resend" onClick={() => { setSentTo(''); setError(''); }}>Use a different email</button>
            </div>
          ) : (
            <>
              <span className="auth-kicker"><Fingerprint size={14} /> YOUR PERSONAL SOCIAL DASHBOARD</span>
              <h2>Welcome back<span className="heading-period">.</span></h2>
              <p className="auth-form-description">Sign in to your Orbit workspace. Your social accounts always authenticate directly with their own platforms.</p>

              {authConfigured ? (
                <form className="auth-email-form" onSubmit={handleSubmit}>
                  <label htmlFor="account-email">Email address</label>
                  <div className="auth-input-wrap"><Mail size={17} /><input id="account-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></div>
                  {error && <p className="auth-error" role="alert">{error}</p>}
                  <button type="submit" className="button button-primary auth-submit" disabled={submitting}>
                    {submitting ? <><span className="button-spinner" /> Sending link…</> : <>Email me a sign-in link <ArrowRight size={16} /></>}
                  </button>
                </form>
              ) : (
                <div className="demo-signin-box">
                  <div className="demo-signin-icon"><Sparkles size={17} /></div>
                  <div><strong>Preview workspace</strong><span>First-party authentication is not set up yet.</span></div>
                  <button type="button" className="button button-primary auth-submit" onClick={onContinueDemo}>Continue to demo <ArrowRight size={16} /></button>
                  <p>Connect Supabase Auth to enable secure email-link sign-in. The demo does not save a password.</p>
                </div>
              )}

              <div className="auth-divider"><span /> <small>BUILT WITH PRIVACY IN MIND</small> <span /></div>
              <ul className="auth-assurances">
                <li><span><Check size={11} /></span> No third-party passwords collected</li>
                <li><span><Check size={11} /></span> Official provider websites stay in control</li>
                <li><span><Check size={11} /></span> Optional PWA — no install required</li>
              </ul>
            </>
          )}
        </div>
        <div className="auth-panel-footer"><EyeOff size={14} /> Your social activity stays with each provider.</div>
      </section>
    </main>
  );
}
