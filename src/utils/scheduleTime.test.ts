import { describe, expect, it } from 'vitest';

import type { ScheduleItem, VenueMap } from '@/types/wedding';
import { formatZonedTime, getNowNext, parseScheduleTime, pickDefaultMapIndex, zonedDate } from './scheduleTime';

const TZ = 'America/Detroit';
const DATE = '2027-11-19';
const at = (local: string) => Date.parse(`${local}-05:00`); // EST on the wedding day

const schedule: ScheduleItem[] = [
  { time: '4:30 PM', title: 'Ceremony', endTime: '5:00 PM' },
  { time: '5:15 PM', title: 'Cocktail hour' },
  { time: '6:30 PM', title: 'Dinner' },
  { time: 'After dinner', title: 'Dancing' },
  { time: '11:00 PM', title: 'Send-off', endTime: '11:30 PM' }
];

describe('parseScheduleTime', () => {
  it.each([
    ['4:30 PM', 16 * 60 + 30],
    ['4pm', 16 * 60],
    ['4:30 p.m.', 16 * 60 + 30],
    ['12:15 AM', 15],
    ['12 PM', 12 * 60],
    ['16:30', 16 * 60 + 30],
    ['Noon', 12 * 60],
    ['midnight', 0]
  ])('parses %s', (text, minutes) => {
    expect(parseScheduleTime(text)).toBe(minutes);
  });

  it.each(['', 'After dinner', '4', '13 PM', '4:75 PM', '25:00'])('rejects %s', text => {
    expect(parseScheduleTime(text)).toBeNull();
  });
});

describe('zonedDate', () => {
  it('uses the venue calendar date, not UTC', () => {
    // 11:30 PM in Detroit is already the 20th in UTC
    expect(zonedDate(at('2027-11-19T23:30:00'), TZ)).toBe('2027-11-19');
  });
});

describe('getNowNext', () => {
  it('counts down days before the wedding', () => {
    expect(getNowNext(schedule, DATE, TZ, at('2027-11-07T20:00:00'))).toEqual({ phase: 'before', daysUntil: 12 });
    expect(getNowNext(schedule, DATE, TZ, at('2027-11-18T23:59:00'))).toEqual({ phase: 'before', daysUntil: 1 });
  });

  it('points at the first item on the morning of', () => {
    const result = getNowNext(schedule, DATE, TZ, at('2027-11-19T10:00:00'));
    expect(result).toEqual({ phase: 'day', current: undefined, next: schedule[0], nextStartsAt: at('2027-11-19T16:30:00') });
  });

  it('shows the running item and what is next', () => {
    const result = getNowNext(schedule, DATE, TZ, at('2027-11-19T16:45:00'));
    expect(result).toMatchObject({ phase: 'day', current: schedule[0], next: schedule[1] });
  });

  it('shows a gap after an item with an end time', () => {
    const result = getNowNext(schedule, DATE, TZ, at('2027-11-19T17:05:00'));
    expect(result).toMatchObject({ phase: 'day', current: undefined, next: schedule[1] });
  });

  it('runs an item without an end until the next one, skipping unparseable times', () => {
    const result = getNowNext(schedule, DATE, TZ, at('2027-11-19T21:00:00'));
    expect(result).toMatchObject({ phase: 'day', current: schedule[2], next: schedule[4] });
  });

  it('keeps the last item current until its end, then the day is over', () => {
    expect(getNowNext(schedule, DATE, TZ, at('2027-11-19T23:10:00'))).toMatchObject({
      phase: 'day',
      current: schedule[4],
      next: undefined
    });
    expect(getNowNext(schedule, DATE, TZ, at('2027-11-19T23:45:00'))).toEqual({ phase: 'after' });
  });

  it('is after once the date has passed', () => {
    expect(getNowNext(schedule, DATE, TZ, at('2027-11-20T09:00:00'))).toEqual({ phase: 'after' });
  });

  it('is unknown without a wedding date', () => {
    expect(getNowNext(schedule, '', TZ, Date.now())).toEqual({ phase: 'unknown' });
  });
});

describe('formatZonedTime', () => {
  it('formats in the venue zone', () => {
    expect(formatZonedTime(at('2027-11-19T18:30:00'), TZ)).toBe('6:30 PM');
  });
});

describe('pickDefaultMapIndex', () => {
  const map = (label: string, activeFrom?: string): VenueMap => ({ label, src: '/x.jpg', alt: label, width: 1, height: 1, activeFrom });
  const maps = [map('Ceremony'), map('Reception', 'Cocktail hour')];

  it('shows the ceremony layout until the reception item starts', () => {
    expect(pickDefaultMapIndex(maps, schedule, DATE, TZ, at('2027-11-12T12:00:00'))).toBe(0);
    expect(pickDefaultMapIndex(maps, schedule, DATE, TZ, at('2027-11-19T16:45:00'))).toBe(0);
  });

  it('switches once the activeFrom item has started, and stays switched after the day', () => {
    expect(pickDefaultMapIndex(maps, schedule, DATE, TZ, at('2027-11-19T17:20:00'))).toBe(1);
    expect(pickDefaultMapIndex(maps, schedule, DATE, TZ, at('2027-11-21T12:00:00'))).toBe(1);
  });

  it('handles no maps and unknown activeFrom titles', () => {
    expect(pickDefaultMapIndex([], schedule, DATE, TZ, Date.now())).toBe(-1);
    expect(pickDefaultMapIndex([map('Only', 'Nope')], schedule, DATE, TZ, at('2027-11-19T20:00:00'))).toBe(0);
  });
});
