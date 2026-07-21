import type { PublicWeddingConfig, Venue, WeddingConfig } from '@/types/wedding';
import { getRequest, putRequest } from '@/api/client';

/**
 * Get all wedding venue candidates (with images + coords) from brainerd-api.
 * Data lives at `brainerd-api/data/wedding-venues.json` and is mutated by the
 * scrape/upload/geocode scripts in that repo.
 */
export const getWeddingVenues = (): Promise<Venue[] | undefined> => {
  return getRequest<Venue[]>('/wedding/venues');
};

/**
 * Public wedding config for the guest storybook. The backend strips the
 * guest passcode before responding; no auth required.
 */
export const getPublicWeddingConfig = (): Promise<PublicWeddingConfig | undefined> => {
  return getRequest<PublicWeddingConfig>('/wedding/config');
};

/**
 * Owner-only: full wedding config including the guest passcode — feeds the
 * CMS form. The backend 403s anyone but the configured wedding owner, so a
 * non-owner just gets `undefined` here.
 */
export const getFullWeddingConfig = (): Promise<WeddingConfig | undefined> => {
  return getRequest<WeddingConfig>('/wedding/config/full');
};

/**
 * Owner-only: save the full wedding config (including the guest passcode).
 * Throws on failure (non-owner, invalid body, network) — callers surface it.
 */
export const updateWeddingConfig = (config: WeddingConfig): Promise<WeddingConfig> => {
  return putRequest<WeddingConfig, WeddingConfig>('/wedding/config', config);
};
