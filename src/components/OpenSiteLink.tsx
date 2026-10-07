import type { MouseEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { prepareSameTabOpen, rememberDeparture } from '../integrations/launch';
import type { AppIntegration } from '../integrations/types';

export type OpenSiteMode = 'same-tab' | 'new-tab';

/**
 * The single primitive every "open" control in Orbit is built from.
 *
 * It is a genuine anchor element whose `href` is the provider's official
 * address, so long-press, "copy link", "open in new tab" and the browser Back
 * button all behave like normal browsing. There is no `window.open`, no
 * `intent://` and no iframe anywhere in here — an intent link is only rendered
 * by the open screen, and only for Android in-app browsers.
 */
export function OpenSiteLink({
  integration,
  mode = 'same-tab',
  label,
  className,
  withIcon = true,
  returnToThisPage = false,
  onVisit,
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
}) {
  const newTab = mode === 'new-tab';
  const text = label ?? (newTab ? 'নতুন ট্যাবে খুলুন' : `${integration.name} খুলুন`);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // Modified or non-primary clicks are the browser's own business.
    if (event.defaultPrevented || event.button !== 0
      || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!newTab) {
      if (returnToThisPage) prepareSameTabOpen(integration);
      else rememberDeparture(integration.id);
    }
    onVisit?.(integration);
  }

  return (
    <a
      href={integration.providerUrl}
      className={className ?? 'button button-primary'}
      onClick={handleClick}
      {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      title={`${integration.providerUrl} · ${newTab ? 'নতুন ট্যাবে' : 'এই ট্যাবে'}`}
      aria-label={`${text} — ${integration.providerUrl}`}
    >
      {text}
      {withIcon && <ArrowUpRight size={16} strokeWidth={2.2} />}
    </a>
  );
}
