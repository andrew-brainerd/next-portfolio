import type { Venue } from '@/types/wedding';
import { getRequest } from '@/api/client';

/**
 * Get all wedding venue candidates (with images + coords) from brainerd-api.
 * Data lives at `brainerd-api/data/wedding-venues.json` and is mutated by the
 * scrape/upload/geocode scripts in that repo.
 */
export const getWeddingVenues = (): Promise<Venue[] | undefined> => {
  return getRequest<Venue[]>('/wedding/venues');
};
