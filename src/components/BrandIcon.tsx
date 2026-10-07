import type { CSSProperties } from 'react';
import type { AppIntegration } from '../integrations/types';

export function BrandIcon({
  integration,
  size = 'regular',
}: {
  integration: AppIntegration;
  size?: 'regular' | 'large' | 'mini';
}) {
  return (
    <span
      className={`integration-mark mark-${integration.id} mark-${size}`}
      style={{ '--brand-accent': integration.accent, '--brand-soft': integration.softAccent } as CSSProperties}
      aria-hidden="true"
    >
      {integration.id === 'facebook' && <span className="facebook-glyph">f</span>}
      {integration.id === 'whatsapp' && (
        <svg viewBox="0 0 48 48" className="whatsapp-glyph" focusable="false">
          <path d="M24.1 6.3A17.1 17.1 0 0 0 9.4 32.1L7 41l9.2-2.4A17 17 0 1 0 24.1 6.3Z" fill="none" stroke="currentColor" strokeWidth="3.1" strokeLinejoin="round" />
          <path d="M18.1 16.2c-.4-.9-.9-1-1.3-1h-1.1c-.4 0-1 .2-1.5.7s-1.9 1.9-1.9 4.6 2 5.3 2.3 5.7c.3.4 3.9 6.2 9.6 8.4 4.8 1.9 5.8 1.5 6.9 1.4s3.5-1.4 4-2.8c.5-1.4.5-2.6.4-2.8-.2-.2-.6-.4-1.3-.8-.7-.3-3.5-1.7-4-1.9-.5-.2-.9-.3-1.2.4-.4.7-1.4 1.9-1.7 2.3-.3.4-.6.5-1.3.1-.7-.3-2.6-1-5-3.1-1.8-1.6-3.1-3.5-3.4-4.1-.4-.7 0-1 .3-1.3.3-.3.7-.8 1-1.1.3-.4.4-.7.7-1.1.2-.4.1-.8 0-1.1-.2-.3-1.5-3.1-1.9-4.2Z" fill="currentColor" transform="translate(3 0) scale(.84)" />
        </svg>
      )}
      {integration.id === 'messenger' && (
        <svg viewBox="0 0 48 48" className="messenger-glyph" focusable="false">
          <path d="M24 5C13.2 5 5 12.8 5 23.4c0 5.5 2.4 10.3 6.3 13.5.3.2.5.6.5 1v4.3c0 .7.7 1.2 1.4.9l4.8-2.1c.4-.2.8-.2 1.2-.1 1.6.4 3.2.6 4.9.6 10.8 0 19-7.8 19-18.4C43.1 12.8 34.8 5 24 5Z" fill="currentColor" />
          <path d="m13.8 28.2 7-7.4c.7-.7 1.7-.9 2.6-.4l4.6 2.5c.4.2.8.2 1.1-.1l7.4-5.6c.7-.6 1.6.3 1 1l-7 7.4c-.7.7-1.7.9-2.6.4l-4.6-2.5c-.4-.2-.8-.2-1.1.1l-7.4 5.6c-.7.6-1.6-.3-1-1Z" fill="white" />
        </svg>
      )}
      {integration.id === 'youtube' && (
        <svg viewBox="0 0 48 48" className="youtube-glyph" focusable="false">
          <rect x="3.5" y="11" width="41" height="26" rx="8" fill="currentColor" />
          <path d="M20.2 18.4v11.2L30 24l-9.8-5.6Z" fill="#fff" />
        </svg>
      )}
      {integration.id === 'tiktok' && (
        <svg viewBox="0 0 48 48" className="tiktok-glyph" focusable="false">
          <path d="M29 7v22.2a8.3 8.3 0 1 1-7.1-8.2v6.2a2.5 2.5 0 1 0 1.3 2.2V7h5.8c.4 4.3 2.5 7.1 7 8.5v6.1c-2.7-.6-5.1-1.9-7-3.7V7Z" fill="#25f4ee" transform="translate(-1.6 1.4)" />
          <path d="M29 7v22.2a8.3 8.3 0 1 1-7.1-8.2v6.2a2.5 2.5 0 1 0 1.3 2.2V7h5.8c.4 4.3 2.5 7.1 7 8.5v6.1c-2.7-.6-5.1-1.9-7-3.7V7Z" fill="#fe2c55" transform="translate(1.2 -.8)" />
          <path d="M29 7v22.2a8.3 8.3 0 1 1-7.1-8.2v6.2a2.5 2.5 0 1 0 1.3 2.2V7h5.8c.4 4.3 2.5 7.1 7 8.5v6.1c-2.7-.6-5.1-1.9-7-3.7V7Z" fill="currentColor" />
        </svg>
      )}
    </span>
  );
}
