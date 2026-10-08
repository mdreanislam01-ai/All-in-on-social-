import { Bookmark } from 'lucide-react';

interface BookmarkButtonProps {
  saved: boolean;
  name: string;
  onToggle: () => void;
}

export function BookmarkButton({ saved, name, onToggle }: BookmarkButtonProps) {
  return (
    <button
      type="button"
      className={`bookmark-button${saved ? ' is-saved' : ''}`}
      onClick={onToggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from bookmarks` : `Bookmark ${name}`}
      title={saved ? 'Remove bookmark' : 'Add bookmark'}
    >
      <Bookmark size={17} strokeWidth={2} fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
}
