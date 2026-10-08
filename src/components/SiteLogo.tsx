import { useState } from 'react';
import { brandMarks } from '../directory/brandMarks';
import type { DirectorySite } from '../directory/catalog';

/** Relative luminance (0–1) of a 6-digit hex colour. */
function luminance(hex: string): number {
  const channel = (offset: number) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/**
 * Official brand mark first (bundled, no network needed). Sites without a bundled
 * mark load their own /favicon.ico directly from the official domain. If that also
 * fails, a letter mark is shown.
 */
export function SiteLogo({ site, size = 44 }: { site: DirectorySite; size?: number }) {
  const [failed, setFailed] = useState(false);
  const mark = brandMarks[site.id];
  const style = { width: size, height: size, '--site-accent': site.accent } as React.CSSProperties;

  if (mark) {
    // Light brand colours (e.g. Snapchat yellow) get their own tile with a dark glyph, as the brand uses them.
    const lightBrand = luminance(mark.hex) > 0.6;
    const tile = lightBrand ? `#${mark.hex}` : '#ffffff';
    const glyph = lightBrand ? '#111418' : `#${mark.hex}`;
    return (
      <span className="site-logo site-logo--brand" style={{ ...style, background: tile }} aria-hidden="true">
        <svg viewBox="0 0 24 24" width={size * 0.56} height={size * 0.56} role="presentation" focusable="false">
          <path d={mark.path} fill={glyph} />
        </svg>
      </span>
    );
  }

  if (failed) {
    return (
      <span className="site-logo site-logo--mark" style={style} aria-hidden="true">
        {site.monogram}
      </span>
    );
  }

  return (
    <span className="site-logo site-logo--brand" style={style} aria-hidden="true">
      <img
        src={`https://${site.domain}/favicon.ico`}
        alt=""
        width={size * 0.62}
        height={size * 0.62}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
