import { useState } from 'react';
import type { DirectorySite } from '../directory/catalog';

/** Favicon first; falls back to a letter mark if the icon cannot be loaded. */
export function SiteLogo({ site, size = 44 }: { site: DirectorySite; size?: number }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size, '--site-accent': site.accent } as React.CSSProperties;
  if (failed) {
    return (
      <span className="site-logo site-logo--mark" style={style} aria-hidden="true">
        {site.monogram}
      </span>
    );
  }
  return (
    <span className="site-logo" style={style} aria-hidden="true">
      <img
        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(site.domain)}&sz=64`}
        alt=""
        width={size * 0.6}
        height={size * 0.6}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
