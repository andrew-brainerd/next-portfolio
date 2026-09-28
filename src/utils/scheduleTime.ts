import type { ScheduleItem, VenueMap } from '@/types/wedding';
import { isoToZonedLocal, zonedLocalToIso } from '@/utils/weddingGuide';

const DAY_MS = 24 * 60 * 60 * 1000;

/** "4:30 PM" / "4pm" / "4:30 p.m." / "16:30" / "noon" / "midnight" → minutes since midnight, or null. */
export const parseScheduleTime = (value: string | undefined): number | null => {
  const text = (value ?? '').trim().toLowerCase().replace(/\./g, '');
  if (text === 'noon') return 12 * 60;
  if (text === 'midnight') return 0;

  const match = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/.exec(text);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  const meridiem = match[3];
  if (minutes > 59) return null;

  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    hours = (hours % 12) + (meridiem === 'pm' ? 12 : 0);
  } else if (hours > 23 || match[2] === undefined) {
    // A bare "4" is too ambiguous to highlight
    return null;
  }

  return hours * 60 + minutes;
};

const toInstant = (date: string, minutes: number, timeZone: string): number => {
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mm = String(minutes % 60).padStart(2, '0');
  return Date.parse(zonedLocalToIso(`${date}T${hh}:${mm}`, timeZone));
};

/** Calendar date ("YYYY-MM-DD") of an instant as seen in the zone. */
export const zonedDate = (instant: number, timeZone: string): string =>
  isoToZonedLocal(new Date(instant).toISOString(), timeZone).slice(0, 10);

export type NowNext =
  | { phase: 'unknown' }
  | { phase: 'before'; daysUntil: number }
  | { phase: 'day'; current?: ScheduleItem; next?: ScheduleItem; nextStartsAt?: number }
  | { phase: 'after' };

/**
 * Where the wedding day stands at `now`. An item runs from its start until its
 * endTime, else until the next item starts; the last item runs to midnight.
 */
export const getNowNext = (schedule: ScheduleItem[], weddingDate: string, timeZone: string, now: number): NowNext => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weddingDate)) return { phase: 'unknown' };

  const today = zonedDate(now, timeZone);
  if (today < weddingDate) {
    const daysUntil = Math.round((Date.parse(`${weddingDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY_MS);
    return { phase: 'before', daysUntil };
  }
  if (today > weddingDate) return { phase: 'after' };

  const timed = schedule
    .map(item => {
      const start = parseScheduleTime(item.time);
      const end = parseScheduleTime(item.endTime);
      return start === null
        ? null
        : {
            item,
            start: toInstant(weddingDate, start, timeZone),
            end: end === null ? undefined : toInstant(weddingDate, end, timeZone)
          };
    })
    .filter(entry => entry !== null)
    .sort((a, b) => a.start - b.start);

  const currentIndex = timed.findLastIndex(entry => entry.start <= now);
  const currentEntry = timed[currentIndex];
  const nextEntry = timed[currentIndex + 1];
  const running = currentEntry && (currentEntry.end === undefined || now < currentEntry.end);

  // Past the final item's explicit end — the evening is over
  if (currentEntry && !nextEntry && !running) return { phase: 'after' };

  return {
    phase: 'day',
    current: running ? currentEntry.item : undefined,
    next: nextEntry?.item,
    nextStartsAt: nextEntry?.start
  };
};

/** "4:30 PM" style label for an instant in the venue's zone. */
export const formatZonedTime = (instant: number, timeZone: string): string =>
  new Date(instant)
    .toLocaleTimeString('en-US', { timeZone, hour: 'numeric', minute: '2-digit' })
    // Newer ICU uses a narrow no-break space before AM/PM; keep server and browser output identical
    .replace(/\u202f/g, ' ');

/**
 * Which map layout to show first: the one whose `activeFrom` schedule item started
 * most recently on the wedding day, else the first map without `activeFrom`.
 */
export const pickDefaultMapIndex = (
  maps: VenueMap[],
  schedule: ScheduleItem[],
  weddingDate: string,
  timeZone: string,
  now: number
): number => {
  if (maps.length === 0) return -1;
  const onTheDay = /^\d{4}-\d{2}-\d{2}$/.test(weddingDate) && zonedDate(now, timeZone) >= weddingDate;

  let best = -1;
  let bestStart = -Infinity;
  if (onTheDay) {
    maps.forEach((map, index) => {
      const item = schedule.find(entry => entry.title === map.activeFrom);
      const minutes = parseScheduleTime(item?.time);
      if (minutes === null) return;
      const start = toInstant(weddingDate, minutes, timeZone);
      if (start <= now && start > bestStart) {
        best = index;
        bestStart = start;
      }
    });
  }

  if (best >= 0) return best;
  const fallback = maps.findIndex(map => !map.activeFrom);
  return fallback >= 0 ? fallback : 0;
};
