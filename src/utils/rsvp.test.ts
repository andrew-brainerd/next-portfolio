import { describe, expect, it } from 'vitest';
import { buildEventIcs, mapsDirectionsUrl } from './rsvp';

describe('buildEventIcs', () => {
  const ics = buildEventIcs();

  it('wraps a single VEVENT in a VCALENDAR', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR')).toBe(true);
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
  });

  it('uses CRLF line endings', () => {
    expect(ics).toContain('\r\n');
    expect(ics.split('\r\n')).toHaveLength(ics.split('\n').length);
  });

  it('converts 4–9 PM EDT to the spec UTC stamps', () => {
    expect(ics).toContain('DTSTART:20260913T200000Z');
    expect(ics).toContain('DTEND:20260914T010000Z');
  });

  it('has a stable UID and the event summary/location', () => {
    expect(ics).toContain('UID:rsvp-2026-09-13@brainerd.dev');
    expect(ics).toContain('SUMMARY:Surprise Family Dinner — Andrew + Hayley');
    expect(ics).toContain('LOCATION:White Horse Inn\\, 1 E High St\\, Metamora\\, MI 48455');
  });
});

describe('mapsDirectionsUrl', () => {
  it('builds a Google Maps directions link to the venue with no origin', () => {
    const url = mapsDirectionsUrl();
    expect(url).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=1%20E%20High%20St%2C%20Metamora%2C%20MI%2048455'
    );
  });
});
