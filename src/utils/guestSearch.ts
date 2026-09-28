import type { SeatMatch, SeatingTable } from '@/types/wedding';
import { seatLabel } from '@/utils/weddingGuide';

/** Lowercase, accent-free words: "Zoë O'Neil-Smith" → "zoe o neil smith". */
export const normalizeName = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Every query word must prefix some word of the guest's name. Unnamed plus-ones
 * match on their host's name, so a plus-one finds the table by searching the host.
 */
export const searchGuests = (tables: SeatingTable[], query: string, limit = 8): SeatMatch[] => {
  const terms = normalizeName(query).split(' ').filter(Boolean);
  if (terms.join('').length < 2) return [];

  const matches: (SeatMatch & { exact: boolean; named: boolean })[] = [];
  tables.forEach(table =>
    table.guests.forEach((guest, guestIndex) => {
      const searchable = normalizeName(guest.name || guest.guestOf || '');
      const words = searchable.split(' ');
      if (!terms.every(term => words.some(word => word.startsWith(term)))) return;
      matches.push({
        tableId: table.id,
        tableName: table.name,
        guestIndex,
        label: seatLabel(guest),
        exact: searchable === terms.join(' ') && !!guest.name,
        named: !!guest.name
      });
    })
  );

  return matches
    // Exact names, then named guests, then plus-ones
    .sort(
      (a, b) =>
        Number(b.exact) - Number(a.exact) || Number(b.named) - Number(a.named) || a.label.localeCompare(b.label)
    )
    .slice(0, limit)
    .map(({ exact, named, ...match }) => match);
};
