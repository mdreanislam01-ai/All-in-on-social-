import { Link2 } from 'lucide-react';

export function OrbitMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`orbit-mark${compact ? ' orbit-mark-compact' : ''}`} aria-hidden="true">
      <span className="orbit-mark-core" />
      <span className="orbit-mark-dot orbit-dot-one" />
      <span className="orbit-mark-dot orbit-dot-two" />
      <span className="orbit-mark-dot orbit-dot-three" />
      <Link2 className="orbit-mark-link" strokeWidth={2.4} />
    </span>
  );
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className={`wordmark${light ? ' wordmark-light' : ''}`}>
      <OrbitMark />
      <span>orbit</span>
    </span>
  );
}
