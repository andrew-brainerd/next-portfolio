import { describe, expect, it } from 'vitest';

import type { WeddingConfig } from '@/types/wedding';
import { chapterLabel, formatWeddingDate, isRsvpClosed, prepareWeddingConfigForSave, withEditableWeddingDefaults } from './wedding';

const baseConfig = (): WeddingConfig => ({
  guestPasscode: ' secret ',
  coupleNames: { partnerA: ' Andrew ', partnerB: 'Hayley' },
  weddingDate: '2028-06-24',
  ceremony: { venueName: ' Ivy House ' },
  reception: { venueName: 'Ivy House' },
  hotels: [],
  schedule: [],
  faq: [],
  registry: [],
  rsvp: { enabled: false }
});

describe('prepareWeddingConfigForSave', () => {
  it('trims top-level strings', () => {
    const result = prepareWeddingConfigForSave(baseConfig());
    expect(result.guestPasscode).toBe('secret');
    expect(result.coupleNames.partnerA).toBe('Andrew');
    expect(result.ceremony.venueName).toBe('Ivy House');
  });

  it('drops hotels without a name and incomplete schedule/faq/registry rows', () => {
    const config = baseConfig();
    config.hotels = [
      { name: 'Shinola Hotel', rate: '$250/night' },
      { name: '   ', address: 'left blank by an added-then-abandoned row' }
    ];
    config.schedule = [
      { time: '4:30 PM', title: 'Ceremony' },
      { time: '', title: 'No time yet' },
      { time: '6:00 PM', title: '' }
    ];
    config.faq = [
      { question: 'Dress code?', answer: 'Garden formal' },
      { question: 'Unanswered?', answer: '' }
    ];
    config.registry = [
      { label: 'Zola', url: 'https://zola.com/us' },
      { label: 'No link', url: '' }
    ];

    const result = prepareWeddingConfigForSave(config);
    expect(result.hotels).toHaveLength(1);
    expect(result.hotels[0].name).toBe('Shinola Hotel');
    expect(result.schedule).toEqual([{ time: '4:30 PM', title: 'Ceremony', description: undefined }]);
    expect(result.faq).toHaveLength(1);
    expect(result.registry).toHaveLength(1);
  });

  it('omits optional objects the owner has not filled in', () => {
    const config = baseConfig();
    config.travel = { parking: '', airports: '  ', directions: '', notes: '' };
    config.dressCode = { title: '', description: '' };
    config.honeymoonFund = { title: '  ', description: 'no title yet', url: '' };
    config.rehearsalDinner = { venueName: '', notes: '  ' };
    config.announcements = ['', '   '];
    config.tagline = '  ';

    const result = prepareWeddingConfigForSave(config);
    expect(result.travel).toBeUndefined();
    expect(result.dressCode).toBeUndefined();
    expect(result.honeymoonFund).toBeUndefined();
    expect(result.rehearsalDinner).toBeUndefined();
    expect(result.announcements).toBeUndefined();
    expect(result.tagline).toBeUndefined();
  });

  it('keeps optional objects with real content', () => {
    const config = baseConfig();
    config.travel = { parking: 'Free lot on-site', airports: '', directions: '', notes: '' };
    config.dressCode = { title: 'Garden formal', description: '' };
    config.honeymoonFund = { title: 'Honeymoon fund', url: ' https://example.com ' };
    config.rehearsalDinner = { venueName: 'Founders Brewing', invited: ' wedding party + family ' };
    config.announcements = [' Shuttle at 3 PM '];

    const result = prepareWeddingConfigForSave(config);
    expect(result.travel).toEqual({
      parking: 'Free lot on-site',
      airports: undefined,
      directions: undefined,
      notes: undefined
    });
    expect(result.dressCode).toEqual({ title: 'Garden formal', description: '' });
    expect(result.honeymoonFund).toEqual({ title: 'Honeymoon fund', description: undefined, url: 'https://example.com' });
    expect(result.rehearsalDinner?.venueName).toBe('Founders Brewing');
    expect(result.rehearsalDinner?.invited).toBe('wedding party + family');
    expect(result.announcements).toEqual(['Shuttle at 3 PM']);
  });

  it('keeps a rehearsal dinner that only has the invited field', () => {
    const config = baseConfig();
    config.rehearsalDinner = { venueName: '', invited: 'family only' };

    const result = prepareWeddingConfigForSave(config);
    expect(result.rehearsalDinner).toBeDefined();
    expect(result.rehearsalDinner?.invited).toBe('family only');
  });

  it('trims rsvp deadline/message and preserves enabled', () => {
    const config = baseConfig();
    config.rsvp = { enabled: true, deadline: ' 2028-05-01 ', message: '' };

    const result = prepareWeddingConfigForSave(config);
    expect(result.rsvp).toEqual({ enabled: true, deadline: '2028-05-01', message: undefined });
  });
});

describe('withEditableWeddingDefaults', () => {
  it('fills every optional section with an empty editable shell', () => {
    const result = withEditableWeddingDefaults(baseConfig());
    expect(result.tagline).toBe('');
    expect(result.rehearsalDinner).toEqual({ venueName: '' });
    expect(result.travel).toEqual({ parking: '', airports: '', directions: '', notes: '' });
    expect(result.dressCode).toEqual({ title: '', description: '' });
    expect(result.announcements).toEqual([]);
    expect(result.honeymoonFund).toEqual({ title: '', description: '', url: '' });
    expect(result.rsvp).toEqual({ enabled: false, deadline: '', message: '' });
  });

  it('preserves existing values while filling gaps', () => {
    const config = baseConfig();
    config.tagline = 'Once upon a time';
    config.travel = { parking: 'Free lot' };
    config.rsvp = { enabled: true, deadline: '2028-05-01' };

    const result = withEditableWeddingDefaults(config);
    expect(result.tagline).toBe('Once upon a time');
    expect(result.travel).toEqual({ parking: 'Free lot', airports: '', directions: '', notes: '' });
    expect(result.rsvp).toEqual({ enabled: true, deadline: '2028-05-01', message: '' });
  });

  it('round-trips cleanly: defaults then prepare produces the original pruned shape', () => {
    const prepared = prepareWeddingConfigForSave(withEditableWeddingDefaults(baseConfig()));
    expect(prepared.rehearsalDinner).toBeUndefined();
    expect(prepared.travel).toBeUndefined();
    expect(prepared.dressCode).toBeUndefined();
    expect(prepared.honeymoonFund).toBeUndefined();
    expect(prepared.announcements).toBeUndefined();
    expect(prepared.tagline).toBeUndefined();
  });
});

describe('formatWeddingDate', () => {
  it('formats an ISO date long-form', () => {
    expect(formatWeddingDate('2028-06-24')).toBe('June 24, 2028');
  });

  it('returns empty for unset or garbage input', () => {
    expect(formatWeddingDate('')).toBe('');
    expect(formatWeddingDate('not-a-date')).toBe('');
  });
});

describe('chapterLabel', () => {
  it('spells out the first chapters', () => {
    expect(chapterLabel(0)).toBe('Chapter One');
    expect(chapterLabel(3)).toBe('Chapter Four');
    expect(chapterLabel(11)).toBe('Chapter Twelve');
  });

  it('falls back to digits past twelve', () => {
    expect(chapterLabel(12)).toBe('Chapter 13');
  });
});

describe('isRsvpClosed', () => {
  it('stays open with no deadline or a garbage deadline', () => {
    expect(isRsvpClosed(undefined)).toBe(false);
    expect(isRsvpClosed('')).toBe(false);
    expect(isRsvpClosed('not-a-date')).toBe(false);
  });

  it('stays open through the end of the deadline day', () => {
    expect(isRsvpClosed('2028-05-01', new Date('2028-05-01T22:00:00'))).toBe(false);
  });

  it('closes after the deadline day ends', () => {
    expect(isRsvpClosed('2028-05-01', new Date('2028-05-02T00:00:01'))).toBe(true);
  });
});
