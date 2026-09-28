import { describe, expect, it } from 'vitest';

import type { SeatingTable } from '@/types/wedding';
import { normalizeName, searchGuests } from './guestSearch';

const tables: SeatingTable[] = [
  {
    id: 't7',
    name: 'Table 7',
    guests: [{ name: 'Jane Doe' }, { guestOf: 'Jane Doe' }, { name: 'Zoë O’Neil-Smith' }]
  },
  { id: 't8', name: 'Table 8', guests: [{ name: 'Janet Doe' }, { name: 'Bob Smith' }] }
];

describe('normalizeName', () => {
  it('strips accents, case and punctuation', () => {
    expect(normalizeName('  Zoë O’Neil-Smith ')).toBe('zoe o neil smith');
  });
});

describe('searchGuests', () => {
  it('needs at least two characters', () => {
    expect(searchGuests(tables, 'j')).toEqual([]);
  });

  it('prefix-matches every word, exact names first, plus-ones via their host', () => {
    expect(searchGuests(tables, 'jane doe').map(match => match.label)).toEqual([
      'Jane Doe',
      'Janet Doe',
      'Guest of Jane Doe'
    ]);
  });

  it('lists named guests before plus-ones on a partial match', () => {
    expect(searchGuests(tables, 'jane').map(match => match.label)).toEqual(['Jane Doe', 'Janet Doe', 'Guest of Jane Doe']);
  });

  it('matches last names and accent-free spellings', () => {
    expect(searchGuests(tables, 'smith').map(match => `${match.label} @ ${match.tableId}`)).toEqual([
      'Bob Smith @ t8',
      'Zoë O’Neil-Smith @ t7'
    ]);
    expect(searchGuests(tables, 'zoe')[0]).toEqual({ tableId: 't7', tableName: 'Table 7', guestIndex: 2, label: 'Zoë O’Neil-Smith' });
  });

  it('returns nothing when a word does not match', () => {
    expect(searchGuests(tables, 'jane smith')).toEqual([]);
  });
});
