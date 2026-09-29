import { describe, expect, it } from 'vitest';

import { DEFAULT_WEDDING_GUIDE } from '@/constants/wedding';
import type { PublicWeddingConfig } from '@/types/wedding';
import { daysUntilWedding, getWeddingFeatures } from './weddingFeatures';

const publicConfig = (): PublicWeddingConfig => ({
  coupleNames: { partnerA: 'Andrew', partnerB: 'Hayley' },
  weddingDate: '2027-11-19',
  ceremony: { venueName: 'Colony Club' },
  reception: { venueName: 'Colony Club' },
  hotels: [],
  schedule: [],
  faq: [],
  registry: [],
  rsvp: { enabled: true },
  guide: { ...structuredClone(DEFAULT_WEDDING_GUIDE), timeZone: 'America/Detroit' }
});

const at = (iso: string) => Date.parse(iso);

describe('getWeddingFeatures', () => {
  it('opens nothing more than 6 months out', () => {
    const features = getWeddingFeatures(publicConfig(), at('2027-05-18T23:59:00-04:00'), true);

    expect(features).toMatchObject({ story: false, details: false, rsvp: false, guide: false });
    expect(features.storyOpensAt).toBe(at('2027-05-19T00:00:00-04:00'));
  });

  it('opens the story and details 6 months out, RSVP 3 months out', () => {
    const config = publicConfig();

    expect(getWeddingFeatures(config, at('2027-05-19T00:00:00-04:00'), true)).toMatchObject({
      story: true,
      details: true,
      rsvp: false,
      guide: false
    });
    expect(getWeddingFeatures(config, at('2027-08-19T00:00:00-04:00'), true)).toMatchObject({ rsvp: true, guide: false });
  });

  it('keeps RSVP hidden while the CMS switch is off', () => {
    const config = publicConfig();
    config.rsvp.enabled = false;

    expect(getWeddingFeatures(config, at('2027-10-01T12:00:00-04:00'), true).rsvp).toBe(false);
  });

  it('opens the guide on the wedding day, or early when enabled', () => {
    const config = publicConfig();
    expect(getWeddingFeatures(config, at('2027-11-18T23:59:00-05:00'), true).guide).toBe(false);
    expect(getWeddingFeatures(config, at('2027-11-19T00:00:00-05:00'), true).guide).toBe(true);

    config.guide.enabled = true;
    expect(getWeddingFeatures(config, at('2027-06-01T12:00:00-04:00'), true).guide).toBe(true);
  });

  it('opens everything for an admin preview on the real clock', () => {
    const config = publicConfig();
    config.rsvp.enabled = false;

    expect(getWeddingFeatures(config, at('2026-09-28T12:00:00-04:00'), false)).toMatchObject({
      story: true,
      details: true,
      rsvp: true,
      guide: true
    });
  });

  it('has no date windows without a wedding date', () => {
    const config = publicConfig();
    config.weddingDate = '';

    expect(getWeddingFeatures(config, at('2026-09-28T12:00:00-04:00'), true)).toMatchObject({
      story: true,
      details: true,
      rsvp: true,
      guide: false
    });
  });
});

describe('daysUntilWedding', () => {
  const start = at('2027-11-19T00:00:00-05:00');

  it('counts whole days, rounding a partial day up', () => {
    expect(daysUntilWedding(start, at('2027-11-17T12:00:00-05:00'))).toBe(2);
    expect(daysUntilWedding(start, at('2027-11-18T00:00:00-05:00'))).toBe(1);
  });

  it('is 0 on or after the day and undefined without a date', () => {
    expect(daysUntilWedding(start, start)).toBe(0);
    expect(daysUntilWedding(start, at('2027-12-01T00:00:00-05:00'))).toBe(0);
    expect(daysUntilWedding(undefined, start)).toBeUndefined();
  });
});
