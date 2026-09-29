import type { EventBlock, WeddingConfig } from '@/types/wedding';
import { prepareGuideForSave, withEditableGuideDefaults, zonedLocalToIso } from '@/utils/weddingGuide';

const trimmed = (value?: string): string => (value ?? '').trim();

/** "2028-06-24" → "June 24, 2028". Empty string when unset/unparseable. */
export const formatWeddingDate = (isoDate: string): string => {
  if (!isoDate) return '';
  const parsed = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const CHAPTER_WORDS = [
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve'
];

/** 0-based index → "Chapter One" … falls back to digits past twelve. */
export const chapterLabel = (index: number): string =>
  `Chapter ${CHAPTER_WORDS[index] ?? String(index + 1)}`;

/**
 * RSVPs close at the END of the deadline day (guests get the whole day).
 * No deadline (or an unparseable one) means RSVPs stay open.
 */
export const isRsvpClosed = (deadline: string | undefined, now: Date = new Date()): boolean => {
  if (!deadline) return false;
  const endOfDeadlineDay = new Date(`${deadline}T23:59:59.999`);
  if (Number.isNaN(endOfDeadlineDay.getTime())) return false;
  return now > endOfDeadlineDay;
};

const pad2 = (value: number): string => String(value).padStart(2, '0');

/**
 * Midnight in `timeZone`, `monthsBefore` calendar months before the wedding date (day clamped to the
 * month's end, so Aug 31 − 6 → Feb 28/29). Undefined without a valid wedding date: the window is always open.
 */
export const weddingWindowOpensAt = (weddingDate: string, monthsBefore: number, timeZone: string): number | undefined => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(weddingDate);
  if (!match) return undefined;
  const [year, month, day] = match.slice(1).map(Number);

  const target = new Date(Date.UTC(year, month - 1 - monthsBefore, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  const local = `${target.getUTCFullYear()}-${pad2(target.getUTCMonth() + 1)}-${pad2(Math.min(day, lastDay))}T00:00`;

  const iso = zonedLocalToIso(local, timeZone);
  return iso ? Date.parse(iso) : undefined;
};

/** A window's opening instant as "May 19, 2027" in the venue's zone. */
export const formatWindowOpening = (opensAt: number, timeZone: string): string =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone }).format(opensAt);

// Optional string fields: trimmed value, or undefined when empty (dropped from JSON)
const optional = (value?: string): string | undefined => {
  const clean = trimmed(value);
  return clean.length > 0 ? clean : undefined;
};

const cleanEventBlock = <T extends EventBlock>(block: T): T => ({
  ...block,
  venueName: trimmed(block.venueName),
  address: optional(block.address),
  mapUrl: optional(block.mapUrl),
  date: optional(block.date),
  startTime: optional(block.startTime),
  endTime: optional(block.endTime),
  notes: optional(block.notes)
});

const isEmptyEventBlock = (block?: EventBlock & { invited?: string }): boolean =>
  !block ||
  Object.values(cleanEventBlock({ ...block, invited: optional(block.invited) })).every(
    value => value === undefined || value === ''
  );

/**
 * Fill every optional section with an empty shell so the CMS form's inputs are
 * always controlled. `prepareWeddingConfigForSave` prunes the untouched shells
 * back out before the payload hits the backend.
 */
export const withEditableWeddingDefaults = (config: WeddingConfig): WeddingConfig => ({
  ...config,
  tagline: config.tagline ?? '',
  rehearsalDinner: { venueName: '', ...config.rehearsalDinner },
  travel: { parking: '', airports: '', directions: '', notes: '', ...config.travel },
  dressCode: { title: '', description: '', ...config.dressCode },
  announcements: config.announcements ?? [],
  honeymoonFund: { title: '', description: '', url: '', ...config.honeymoonFund },
  rsvp: { deadline: '', message: '', ...config.rsvp },
  guideKey: config.guideKey ?? '',
  guide: withEditableGuideDefaults(config.guide)
});

/**
 * Prune a CMS-form config into a payload the backend Joi schema accepts:
 * drops incomplete array rows (a hotel needs a name, a FAQ needs both halves),
 * empty announcements, and optional objects the owner hasn't filled in yet.
 */
export const prepareWeddingConfigForSave = (config: WeddingConfig): WeddingConfig => {
  const travel = {
    parking: optional(config.travel?.parking),
    airports: optional(config.travel?.airports),
    directions: optional(config.travel?.directions),
    notes: optional(config.travel?.notes)
  };
  const hasTravel = Object.values(travel).some(Boolean);

  const dressCode = {
    title: trimmed(config.dressCode?.title),
    description: trimmed(config.dressCode?.description)
  };
  const hasDressCode = dressCode.title.length > 0 || dressCode.description.length > 0;

  const honeymoonFund = config.honeymoonFund
    ? {
        title: trimmed(config.honeymoonFund.title),
        description: optional(config.honeymoonFund.description),
        url: optional(config.honeymoonFund.url)
      }
    : undefined;

  const announcements = (config.announcements ?? []).map(trimmed).filter(Boolean);

  const rehearsalDinner = isEmptyEventBlock(config.rehearsalDinner)
    ? undefined
    : { ...cleanEventBlock(config.rehearsalDinner as EventBlock), invited: optional(config.rehearsalDinner?.invited) };

  return {
    guestPasscode: trimmed(config.guestPasscode),
    guideKey: trimmed(config.guideKey),
    coupleNames: {
      partnerA: trimmed(config.coupleNames.partnerA),
      partnerB: trimmed(config.coupleNames.partnerB)
    },
    weddingDate: trimmed(config.weddingDate),
    tagline: optional(config.tagline),
    ceremony: cleanEventBlock(config.ceremony),
    reception: cleanEventBlock(config.reception),
    rehearsalDinner,
    hotels: config.hotels
      .map(hotel => ({
        name: trimmed(hotel.name),
        address: optional(hotel.address),
        url: optional(hotel.url),
        bookingCode: optional(hotel.bookingCode),
        rate: optional(hotel.rate),
        notes: optional(hotel.notes)
      }))
      .filter(hotel => hotel.name.length > 0),
    schedule: config.schedule
      .map(item => ({
        time: trimmed(item.time),
        endTime: optional(item.endTime),
        title: trimmed(item.title),
        description: optional(item.description)
      }))
      .filter(item => item.time.length > 0 && item.title.length > 0),
    travel: hasTravel ? travel : undefined,
    dressCode: hasDressCode ? dressCode : undefined,
    faq: config.faq
      .map(item => ({ question: trimmed(item.question), answer: trimmed(item.answer) }))
      .filter(item => item.question.length > 0 && item.answer.length > 0),
    announcements: announcements.length > 0 ? announcements : undefined,
    registry: config.registry
      .map(link => ({ label: trimmed(link.label), url: trimmed(link.url), kind: link.kind }))
      .filter(link => link.label.length > 0 && link.url.length > 0),
    honeymoonFund: honeymoonFund && honeymoonFund.title.length > 0 ? honeymoonFund : undefined,
    rsvp: {
      enabled: config.rsvp.enabled,
      deadline: optional(config.rsvp.deadline),
      message: optional(config.rsvp.message)
    },
    guide: prepareGuideForSave(config.guide)
  };
};
