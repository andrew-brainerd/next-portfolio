import { WEDDING_RSVP_CLIENT_ID_KEY, WEDDING_RSVP_SAVED_KEY } from '@/constants/wedding';
import type { WeddingRsvp } from '@/types/wedding';
import { toWeddingRsvpInput } from '@/utils/wedding';

let fallbackId: string | undefined;

/**
 * Anonymous per-device id shared by the wedding RSVP, quiz and messages
 * (same localStorage key the storybook RSVP already uses).
 */
export const getWeddingClientId = (): string => {
  try {
    let clientId = window.localStorage.getItem(WEDDING_RSVP_CLIENT_ID_KEY);
    if (!clientId) {
      clientId = crypto.randomUUID();
      window.localStorage.setItem(WEDDING_RSVP_CLIENT_ID_KEY, clientId);
    }
    return clientId;
  } catch {
    // Storage blocked — stable for this page load only
    fallbackId ??= crypto.randomUUID();
    return fallbackId;
  }
};

/**
 * Makes a found RSVP this device's own: the RSVP page then restores it into the form,
 * and saving upserts the same document (same clientId).
 */
export const saveRsvpToThisDevice = (rsvp: WeddingRsvp): void => {
  const input = toWeddingRsvpInput(rsvp);
  window.localStorage.setItem(WEDDING_RSVP_CLIENT_ID_KEY, input.clientId);
  window.localStorage.setItem(WEDDING_RSVP_SAVED_KEY, JSON.stringify(input));
};
