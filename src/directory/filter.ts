import { directorySites, type DirectorySite } from './catalog';

export const PAGE_SIZE = 48;
export const ALL_CATEGORIES = 'All' as const;
export type CategoryFilter = typeof ALL_CATEGORIES | DirectorySite['category'];

export function filterSites(category: CategoryFilter, query: string, sites: DirectorySite[] = directorySites): DirectorySite[] {
  const needle = query.trim().toLowerCase();
  return sites.filter((site) => {
    if (category !== ALL_CATEGORIES && site.category !== category) return false;
    if (!needle) return true;
    return (
      site.name.toLowerCase().includes(needle) ||
      site.description.toLowerCase().includes(needle) ||
      site.category.toLowerCase().includes(needle)
    );
  });
}

export function countByCategory(sites: DirectorySite[] = directorySites): Map<string, number> {
  const counts = new Map<string, number>();
  for (const site of sites) counts.set(site.category, (counts.get(site.category) ?? 0) + 1);
  return counts;
}

/** Page numbers to show, with `null` marking a gap ("…"). */
export function pageItems(current: number, total: number): Array<number | null> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: Array<number | null> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push(null);
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < total - 1) items.push(null);
  items.push(total);
  return items;
}
