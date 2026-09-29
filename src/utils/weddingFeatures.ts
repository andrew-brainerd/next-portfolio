import { RSVP_OPENS_MONTHS_BEFORE, STORYBOOK_OPENS_MONTHS_BEFORE } from '@/constants/wedding';
import type { PublicWeddingConfig, WeddingFeatures } from '@/types/wedding';
import { weddingWindowOpensAt } from '@/utils/wedding';

const DAY_MS = 24 * 60 * 60 * 1000;

const isOpen = (opensAt: number | undefined, now: number): boolean => opensAt === undefined || now >= opensAt;

/**
 * Open guest pages at `now`. `windowsApply` is false for an admin on the real clock,
 * who previews everything; guests and mock-clock admins get the release windows.
 */
export const getWeddingFeatures = (
  config: PublicWeddingConfig,
  now: number,
  windowsApply: boolean
): WeddingFeatures => {
  const { weddingDate, guide, rsvp } = config;
  const storyOpensAt = weddingWindowOpensAt(weddingDate, STORYBOOK_OPENS_MONTHS_BEFORE, guide.timeZone);
  const rsvpOpensAt = weddingWindowOpensAt(weddingDate, RSVP_OPENS_MONTHS_BEFORE, guide.timeZone);
  const weddingStartsAt = weddingWindowOpensAt(weddingDate, 0, guide.timeZone);

  if (!windowsApply) {
    return { story: true, details: true, rsvp: true, guide: true, storyOpensAt, weddingStartsAt };
  }

  const story = isOpen(storyOpensAt, now);
  return {
    story,
    details: story,
    rsvp: rsvp.enabled && isOpen(rsvpOpensAt, now),
    guide: guide.enabled || (weddingStartsAt !== undefined && now >= weddingStartsAt),
    storyOpensAt,
    weddingStartsAt
  };
};

/** Whole days until the wedding day starts; 0 on or after it, undefined without a date. */
export const daysUntilWedding = (weddingStartsAt: number | undefined, now: number): number | undefined =>
  weddingStartsAt === undefined ? undefined : Math.max(0, Math.ceil((weddingStartsAt - now) / DAY_MS));
