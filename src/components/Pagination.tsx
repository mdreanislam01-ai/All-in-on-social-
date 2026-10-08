import { ChevronLeft, ChevronRight } from 'lucide-react';
import { pageItems } from '../directory/filter';

interface PaginationProps {
  page: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total, onChange }: PaginationProps) {
  if (total <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pages">
      <button type="button" className="page-btn" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft size={18} />
      </button>
      {pageItems(page, total).map((item, index) =>
        item === null ? (
          <span key={`gap-${index}`} className="page-gap" aria-hidden="true">…</span>
        ) : (
          <button
            key={item}
            type="button"
            className={`page-btn${item === page ? ' is-active' : ''}`}
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </button>
        ),
      )}
      <button type="button" className="page-btn" onClick={() => onChange(page + 1)} disabled={page >= total} aria-label="Next page">
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
