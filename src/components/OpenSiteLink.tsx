import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { ArrowUpRight, TriangleAlert } from 'lucide-react';
import {
  openUrlFor,
  prepareSameTabOpen,
  rememberDeparture,
  sameTabHref,
  shouldForceChrome,
} from '../integrations/launch';
import type { AppIntegration } from '../integrations/types';

export type OpenSiteMode = 'same-tab' | 'new-tab';

/**
 * After an Android `intent://` tap we wait this long; if the page is still in
 * the foreground afterwards, Chrome was never launched and the tap was
 * swallowed — the button then flags itself.
 */
const STUCK_WATCH_MS = 1_400;

/**
 * The single primitive every "open" control in Orbit is built from.
 *
 * It is a genuine anchor element whose `href` is the provider's official
 * address, so long-press, "copy link", "open in new tab" and the browser Back
 * button all behave like normal browsing. There is no `window.open` and no
 * iframe anywhere in here. On Android — and only for services whose app is
 * known to hijack its links — the same-tab href is the `intent://` Chrome
 * wrapper from launch.ts; new-tab links always stay plain HTTPS so a copied
 * link is never an intent string, and desktop/iOS never see an intent at all.
 */
export function OpenSiteLink({
  integration,
  mode = 'same-tab',
  label,
  className,
  withIcon = true,
  returnToThisPage = false,
  onVisit,
  onStuck,
}: {
  integration: AppIntegration;
  /** `same-tab` is the primary open; `new-tab` keeps Orbit visible behind it. */
  mode?: OpenSiteMode;
  label?: string;
  className?: string;
  withIcon?: boolean;
  /**
   * Only Orbit's own open screen asks for this: it leaves one extra history
   * entry so Back returns to the instructions. Everywhere else Back goes
   * straight back to the dashboard, one press.
   */
  returnToThisPage?: boolean;
  onVisit?: (integration: AppIntegration) => void;
  /** Fires when an intent tap apparently went nowhere (page still visible). */
  onStuck?: (integration: AppIntegration) => void;
}) {
  const newTab = mode === 'new-tab';
  const text = label ?? (newTab ? 'নতুন ট্যাবে খুলুন' : `${integration.name} খুলুন`);
  const [stuck, setStuck] = useState(false);
  const stuckTimer = useRef<number | undefined>(undefined);

  // The official URL this control opens, and the href actually rendered.
  const openUrl = openUrlFor(integration);
  const forced = !newTab && shouldForceChrome(integration);
  const href = newTab ? openUrl : sameTabHref(integration);

  useEffect(() => () => window.clearTimeout(stuckTimer.current), []);

  function armStuckWatch() {
    window.clearTimeout(stuckTimer.current);
    stuckTimer.current = window.setTimeout(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        setStuck(true);
        onStuck?.(integration);
      }
    }, STUCK_WATCH_MS);
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // Modified or non-primary clicks are the browser's own business.
    if (event.defaultPrevented || event.button !== 0
      || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    setStuck(false);
    if (!newTab) {
      if (forced) armStuckWatch();
      if (returnToThisPage) prepareSameTabOpen(integration);
      else rememberDeparture(integration.id);
    }
    onVisit?.(integration);
  }

  return (
    <a
      href={href}
      className={className ?? 'button button-primary'}
      onClick={handleClick}
      {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      title={`${openUrl} · ${newTab ? 'নতুন ট্যাবে' : forced ? 'এই ট্যাবে (Android Chrome-এ)' : 'এই ট্যাবে'}`}
      aria-label={`${text} — ${openUrl}`}
      data-stuck={stuck || undefined}
    >
      {text}
      {withIcon && <ArrowUpRight size={16} strokeWidth={2.2} />}
      {stuck && (
        <span className="stuck-note" lang="bn">
          <TriangleAlert size={11} strokeWidth={2.4} /> খোলে না?
        </span>
      )}
    </a>
  );
}
