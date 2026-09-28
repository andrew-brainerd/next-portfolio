import { describe, expect, it } from 'vitest';

import { DEFAULT_WEDDING_GUIDE } from '@/constants/wedding';
import type { PublicWeddingConfig, WeddingGuideConfig } from '@/types/wedding';
import {
  findDuplicateGuests,
  generateGuideKey,
  getGuideSections,
  guideEntryUrls,
  isoToZonedLocal,
  parseGuestLines,
  prepareGuideForSave,
  seatLabel,
  slugify,
  withEditableGuideDefaults,
  zonedLocalToIso
} from './weddingGuide';

describe('generateGuideKey', () => {
  it('is 16 URL-safe characters and not repeated', () => {
    const key = generateGuideKey();
    expect(key).toMatch(/^[A-Za-z0-9]{16}$/);
    expect(generateGuideKey()).not.toBe(key);
  });
});

describe('slugify', () => {
  it('lowercases, strips accents and caps at 24 chars', () => {
    expect(slugify('Table 7 — Pokémon Crew')).toBe('table-7-pokemon-crew');
    expect(slugify('A very long table name that keeps going')).toBe('a-very-long-table-name-t');
    expect(slugify('  ')).toBe('');
  });
});

describe('zoned time conversion', () => {
  it('turns venue-local 5 PM on the wedding day into EST ISO', () => {
    expect(zonedLocalToIso('2027-11-19T17:00', 'America/Detroit')).toBe('2027-11-19T17:00:00-05:00');
  });

  it('uses the summer offset during DST', () => {
    expect(zonedLocalToIso('2027-07-04T21:00', 'America/Detroit')).toBe('2027-07-04T21:00:00-04:00');
  });

  it('round-trips back to the datetime-local value', () => {
    expect(isoToZonedLocal('2027-11-19T21:00:00-05:00', 'America/Detroit')).toBe('2027-11-19T21:00');
    expect(isoToZonedLocal('2027-11-20T02:00:00Z', 'America/Detroit')).toBe('2027-11-19T21:00');
  });

  it('returns empty strings for blank or invalid input', () => {
    expect(zonedLocalToIso('', 'America/Detroit')).toBe('');
    expect(isoToZonedLocal(undefined, 'America/Detroit')).toBe('');
    expect(isoToZonedLocal('nope', 'America/Detroit')).toBe('');
  });
});

describe('parseGuestLines', () => {
  it('reads names, blurbs and unnamed plus-ones', () => {
    const guests = parseGuestLines(
      "Jane Doe — Andrew's aunt, ask about the canoe\n\n  Guest of Jane Doe  \nBob Smith - Hayley's college roommate\nSolo Name"
    );

    expect(guests).toEqual([
      { name: 'Jane Doe', blurb: "Andrew's aunt, ask about the canoe" },
      { guestOf: 'Jane Doe' },
      { name: 'Bob Smith', blurb: "Hayley's college roommate" },
      { name: 'Solo Name' }
    ]);
  });

  it('keeps hyphenated names intact', () => {
    expect(parseGuestLines('Mary-Kate Olsen')).toEqual([{ name: 'Mary-Kate Olsen' }]);
  });
});

describe('seatLabel', () => {
  it('prefers the name, falls back to Guest of', () => {
    expect(seatLabel({ name: 'Jane' })).toBe('Jane');
    expect(seatLabel({ guestOf: 'Jane' })).toBe('Guest of Jane');
    expect(seatLabel({})).toBe('');
  });
});

describe('findDuplicateGuests', () => {
  it('flags names seated at two tables, ignoring case', () => {
    const duplicates = findDuplicateGuests([
      { id: 't1', name: 'Table 1', guests: [{ name: 'Jane Doe' }, { guestOf: 'Jane Doe' }] },
      { id: 't2', name: 'Table 2', guests: [{ name: 'jane doe' }, { name: 'Bob' }] }
    ]);

    expect(duplicates).toEqual(['jane doe']);
  });
});

const editableGuide = (): WeddingGuideConfig => withEditableGuideDefaults(DEFAULT_WEDDING_GUIDE);

describe('prepareGuideForSave', () => {
  it('drops empty optional strings and incomplete rows', () => {
    const guide = editableGuide();
    guide.seating = [
      {
        id: '',
        name: ' Table 7 ',
        description: ' ',
        guests: [{ name: ' Jane ', blurb: '' }, { name: '', guestOf: '' }, { guestOf: 'Jane' }]
      },
      { id: 'ghost', name: '  ', guests: [] }
    ];
    guide.menu.courses = [
      { title: 'Dinner', items: [{ name: 'Short rib', tags: ['GF'] }, { name: ' ', tags: [] }] },
      { title: '', items: [{ name: 'Orphan', tags: [] }] }
    ];
    guide.venue.maps = [
      { label: 'Ceremony', src: '/wedding/venue-map-ceremony.jpg', alt: 'Map', width: 1600, height: 1200 },
      { label: 'Reception', src: '', alt: '', width: 0, height: 0 }
    ];
    guide.quiz.questions = [
      { id: 'pokemon', prompt: 'Favorite Pokémon?', choices: ['Eevee', 'Pikachu', 'Snorlax'], answerIndex: 2, reveal: '' },
      { id: 'half', prompt: 'Unfinished?', choices: ['A', '', ''], answerIndex: 0, reveal: '' }
    ];

    const saved = prepareGuideForSave(guide);

    expect(saved.welcome).toBeUndefined();
    expect(saved.seating).toEqual([
      { id: 'table-7', name: 'Table 7', description: undefined, guests: [{ name: 'Jane', guestOf: undefined, blurb: undefined }, { name: undefined, guestOf: 'Jane', blurb: undefined }] }
    ]);
    expect(saved.menu.courses).toEqual([{ title: 'Dinner', items: [{ name: 'Short rib', description: undefined, tags: ['GF'] }] }]);
    expect(saved.venue.maps).toHaveLength(1);
    expect(saved.quiz.questions).toEqual([
      { id: 'pokemon', prompt: 'Favorite Pokémon?', choices: ['Eevee', 'Pikachu', 'Snorlax'], answerIndex: 2, reveal: undefined }
    ]);
    expect(saved.quiz.countsFrom).toBeUndefined();
  });
});

describe('guideEntryUrls', () => {
  it('builds the welcome link plus one per table', () => {
    const urls = guideEntryUrls('https://example.com', 'Key123', [{ id: 't7', name: 'Table 7', guests: [] }]);

    expect(urls).toEqual([
      { label: 'Welcome sign', url: 'https://example.com/wedding/enter?k=Key123' },
      { label: 'Table 7', tableId: 't7', url: 'https://example.com/wedding/enter?k=Key123&table=t7' }
    ]);
  });

  it('returns nothing without a key', () => {
    expect(guideEntryUrls('https://example.com', '', [])).toEqual([]);
  });
});

describe('getGuideSections', () => {
  const publicConfig = (): PublicWeddingConfig => ({
    coupleNames: { partnerA: 'Andrew', partnerB: 'Hayley' },
    weddingDate: '2027-11-19',
    ceremony: { venueName: 'Colony Club' },
    reception: { venueName: 'Colony Club' },
    hotels: [],
    schedule: [],
    faq: [],
    registry: [],
    rsvp: { enabled: false },
    guide: structuredClone(DEFAULT_WEDDING_GUIDE)
  });

  it('drops every empty section', () => {
    expect(getGuideSections(publicConfig())).toEqual([]);
  });

  it('keeps sections with content in page order', () => {
    const config = publicConfig();
    config.hotels = [{ name: 'Shinola' }];
    config.schedule = [{ time: '4:30 PM', title: 'Ceremony' }];
    config.honeymoonFund = { title: 'Honeymoon' };
    config.guide.messages.enabled = true;
    config.guide.quiz = { ...config.guide.quiz, enabled: true, questions: [{ id: 'q1', prompt: '?', choices: ['a', 'b', 'c'] }] };

    expect(getGuideSections(config).map(section => section.id)).toEqual(['timeline', 'quiz', 'messages', 'registry', 'hotels']);
  });

  it('hides a quiz that is disabled even with questions', () => {
    const config = publicConfig();
    config.guide.quiz = { ...config.guide.quiz, questions: [{ id: 'q1', prompt: '?', choices: ['a', 'b', 'c'] }] };

    expect(getGuideSections(config)).toEqual([]);
  });
});
