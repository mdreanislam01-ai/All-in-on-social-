const BOOKMARK_KEY = 'orbit-bookmarks';

/** Reads saved bookmark ids, dropping anything that no longer exists in the catalog. */
export function readBookmarks(validIds: ReadonlySet<string>): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(BOOKMARK_KEY) ?? '[]');
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((id): id is string => typeof id === 'string' && validIds.has(id)))];
  } catch {
    return [];
  }
}

export function writeBookmarks(ids: string[]): void {
  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(ids));
  } catch {
    // Storage can be blocked (private mode); bookmarks then last for this visit only.
  }
}
