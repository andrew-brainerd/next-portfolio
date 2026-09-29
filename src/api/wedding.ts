import type {
  MessageSendOutcome,
  PublicWeddingConfig,
  RsvpEditChannel,
  RsvpEditLinkOutcome,
  RsvpEditStartOutcome,
  RsvpLookupOutcome,
  QuizAnswers,
  QuizLeaderboard,
  QuizResult,
  QuizSubmitOutcome,
  WeddingConfig,
  WeddingMessage,
  WeddingQuizEntry,
  WeddingRsvp,
  WeddingRsvpBreakdown,
  WeddingRsvpInput,
  WeddingRsvpMatch
} from '@/types/wedding';
import { deleteRequest, getRequest, patchRequest, putRequest } from '@/api/client';

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
 * Whether the signed-in user is a wedding admin (WEDDING_ADMINS in brainerd-api).
 * Admins skip the passcode and see the guide before it opens. Signed-out → false.
 */
export const isWeddingAdmin = async (): Promise<boolean> => {
  const access = await getRequest<{ admin: boolean }>('/wedding/access');
  return access?.admin ?? false;
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

/**
 * Submit the couple quiz. Public — plain fetch. The server scores it; 403 means closed.
 * `headers` carries the admin mock clock (see `weddingMockClock.ts`).
 */
export const submitWeddingQuiz = async (
  input: {
    clientId: string;
    name: string;
    answers: QuizAnswers;
  },
  headers: Record<string, string> = {}
): Promise<QuizSubmitOutcome> => {
  try {
    const response = await fetch(brainerdApiUrl('/wedding/quiz'), {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
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
export const getWeddingQuizLeaderboard = async (
  clientId?: string,
  headers: Record<string, string> = {}
): Promise<QuizLeaderboard | undefined> => {
  try {
    const query = clientId ? `?clientId=${encodeURIComponent(clientId)}` : '';
    const response = await fetch(brainerdApiUrl(`/wedding/quiz/leaderboard${query}`), { cache: 'no-store', headers });
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

// Find-and-edit RSVP calls: public, plain fetch like submitWeddingRsvp. 403 means RSVPs have closed.
const rsvpFetch = (path: string, init?: RequestInit) =>
  fetch(brainerdApiUrl(`/wedding/rsvp${path}`), {
    ...init,
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store'
  });

/** Search RSVPs by name, email or US phone (3+ characters). */
export const lookupWeddingRsvps = async (query: string): Promise<RsvpLookupOutcome> => {
  try {
    const response = await rsvpFetch('/lookup', { method: 'POST', body: JSON.stringify({ query }) });
    if (response.status === 403) return { status: 'closed' };
    if (!response.ok) return { status: 'error' };
    return { status: 'ok', matches: (await response.json()) as WeddingRsvpMatch[] };
  } catch (error) {
    console.error('Failed to look up wedding RSVPs', error);
    return { status: 'error' };
  }
};

/**
 * Start editing a found RSVP: sends an edit link by email or text, or returns the RSVP directly
 * when it has neither. 400 means it has no contact for that channel.
 */
export const requestWeddingRsvpEdit = async (id: string, channel: RsvpEditChannel): Promise<RsvpEditStartOutcome> => {
  try {
    const response = await rsvpFetch(`/${encodeURIComponent(id)}/edit-link`, {
      method: 'POST',
      body: JSON.stringify({ channel })
    });
    if (response.status === 403) return { status: 'closed' };
    if (response.status === 404) return { status: 'missing' };
    if (response.status === 400) return { status: 'unavailable' };
    if (!response.ok) return { status: 'error' };
    const body = (await response.json()) as { channel?: RsvpEditChannel; maskedTo?: string; rsvp?: WeddingRsvp };
    if (body.rsvp) return { status: 'direct', rsvp: body.rsvp };
    return { status: 'sent', channel: body.channel ?? channel, maskedTo: body.maskedTo ?? '' };
  } catch (error) {
    console.error('Failed to start a wedding RSVP edit', error);
    return { status: 'error' };
  }
};

/** Open an emailed edit link: the RSVP plus the guest passcode that unlocks this device. */
export const openWeddingRsvpEditLink = async (token: string): Promise<RsvpEditLinkOutcome> => {
  try {
    const response = await rsvpFetch(`/edit/${encodeURIComponent(token)}`);
    if (response.status === 403) return { status: 'closed' };
    if (response.status === 404) return { status: 'missing' };
    if (!response.ok) return { status: 'error' };
    const { rsvp, code } = (await response.json()) as { rsvp: WeddingRsvp; code: string };
    return { status: 'ok', rsvp, code };
  } catch (error) {
    console.error('Failed to open a wedding RSVP edit link', error);
    return { status: 'error' };
  }
};
