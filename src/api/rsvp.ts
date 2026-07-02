import type { RsvpGuestBook, Rsvp, RsvpBreakdown, RsvpInput } from '@/types/rsvp';
import { getRequest } from '@/api/client';

const BASE_URL = process.env.NEXT_PUBLIC_BRAINERD_API_URL;

/**
 * Create or update the guest's RSVP (upsert by clientId). Public endpoint —
 * plain unauthenticated fetch, guests have no accounts.
 */
export const submitRsvp = async (input: RsvpInput): Promise<Rsvp | undefined> => {
  try {
    const response = await fetch(`${BASE_URL}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      console.error(`Failed to submit RSVP: ${response.status}`);
      return undefined;
    }

    return (await response.json()) as Rsvp;
  } catch (error) {
    console.error('Failed to submit RSVP', error);
    return undefined;
  }
};

/**
 * Public guest book: Going guests only, plus the total headcount.
 */
export const getGuestBook = async (): Promise<RsvpGuestBook | undefined> => {
  try {
    const response = await fetch(`${BASE_URL}/rsvp/list`);

    if (!response.ok) {
      console.error(`Failed to fetch guest book: ${response.status}`);
      return undefined;
    }

    return (await response.json()) as RsvpGuestBook;
  } catch (error) {
    console.error('Failed to fetch guest book', error);
    return undefined;
  }
};

/**
 * Owner-only full RSVP breakdown (Going / Maybe / Can't make it). Auth'd —
 * the backend rejects anyone but the configured event owner.
 */
export const getAllRsvps = (): Promise<RsvpBreakdown | undefined> => {
  return getRequest<RsvpBreakdown>('/rsvp/all');
};
