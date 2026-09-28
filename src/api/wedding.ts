import type {
  MessageSendOutcome,
  PublicWeddingConfig,
  QuizAnswers,
  QuizLeaderboard,
  QuizResult,
  QuizSubmitOutcome,
  Venue,
  WeddingConfig,
  WeddingMessage,
  WeddingQuizEntry,
  WeddingRsvp,
  WeddingRsvpBreakdown,
  WeddingRsvpInput
} from '@/types/wedding';
import { deleteRequest, getRequest, patchRequest, putRequest } from '@/api/client';

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
 * Check a guest passcode against the stored one. Public endpoint, plain
 * unauthenticated fetch (guests have no accounts) — mirrors `submitRsvp`.
 * Used by the unlock route handler AND by the /wedding server page to
 * re-verify the cookie's code on every render.
 */
export const verifyWeddingPasscode = async (code: string): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BRAINERD_API_URL}/wedding/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to verify wedding passcode', error);
    return false;
  }
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

/**
 * Create or update the guest's wedding RSVP (upsert by clientId). Public
 * endpoint — plain unauthenticated fetch, guests have no accounts (mirrors
 * the engagement-dinner `submitRsvp`).
 */
export const submitWeddingRsvp = async (input: WeddingRsvpInput): Promise<WeddingRsvp | undefined> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BRAINERD_API_URL}/wedding/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      console.error(`Failed to submit wedding RSVP: ${response.status}`);
      return undefined;
    }

    return (await response.json()) as WeddingRsvp;
  } catch (error) {
    console.error('Failed to submit wedding RSVP', error);
    return undefined;
  }
};

/**
 * Owner-only full RSVP breakdown for the settings page. The backend 403s
 * anyone but the configured wedding owner, so non-owners get `undefined`.
 */
export const getWeddingRsvps = (): Promise<WeddingRsvpBreakdown | undefined> => {
  return getRequest<WeddingRsvpBreakdown>('/wedding/rsvp/all');
};

/** Owner-only: every quiz entry (practice runs flagged), ranked. */
export const getWeddingQuizEntries = (): Promise<WeddingQuizEntry[] | undefined> => {
  return getRequest<WeddingQuizEntry[]>('/wedding/quiz/entries');
};

/** Owner-only: remove a quiz entry, e.g. one with an inappropriate name. */
export const deleteWeddingQuizEntry = (id: string): Promise<void> => {
  return deleteRequest(`/wedding/quiz/entries/${encodeURIComponent(id)}`);
};

/** Owner-only: every guest message, newest first. */
export const getWeddingMessages = (): Promise<WeddingMessage[] | undefined> => {
  return getRequest<WeddingMessage[]>('/wedding/messages');
};

/** Owner-only: mark a guest message read or unread. */
export const setWeddingMessageRead = (id: string, read: boolean): Promise<WeddingMessage | undefined> => {
  return patchRequest<{ read: boolean }, WeddingMessage | undefined>(
    `/wedding/messages/${encodeURIComponent(id)}`,
    { read }
  );
};

const brainerdApiUrl = (path: string) => `${process.env.NEXT_PUBLIC_BRAINERD_API_URL}${path}`;

/** Submit the couple quiz. Public — plain fetch. The server scores it; 403 means closed. */
export const submitWeddingQuiz = async (input: {
  clientId: string;
  name: string;
  answers: QuizAnswers;
}): Promise<QuizSubmitOutcome> => {
  try {
    const response = await fetch(brainerdApiUrl('/wedding/quiz'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    if (response.status === 403) return { status: 'closed' };
    if (!response.ok) return { status: 'error' };
    return { status: 'ok', result: (await response.json()) as QuizResult };
  } catch (error) {
    console.error('Failed to submit wedding quiz', error);
    return { status: 'error' };
  }
};

/** Public leaderboard; empty with `visible: false` until the reveal. */
export const getWeddingQuizLeaderboard = async (clientId?: string): Promise<QuizLeaderboard | undefined> => {
  try {
    const query = clientId ? `?clientId=${encodeURIComponent(clientId)}` : '';
    const response = await fetch(brainerdApiUrl(`/wedding/quiz/leaderboard${query}`), { cache: 'no-store' });
    return response.ok ? ((await response.json()) as QuizLeaderboard) : undefined;
  } catch (error) {
    console.error('Failed to fetch wedding quiz leaderboard', error);
    return undefined;
  }
};

/** Send the couple a private message. Public — plain fetch. */
export const sendWeddingMessage = async (input: {
  clientId: string;
  name: string;
  message: string;
  table?: string;
}): Promise<MessageSendOutcome> => {
  try {
    const response = await fetch(brainerdApiUrl('/wedding/messages'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    if (response.status === 403) return 'closed';
    return response.ok ? 'sent' : 'error';
  } catch (error) {
    console.error('Failed to send wedding message', error);
    return 'error';
  }
};
