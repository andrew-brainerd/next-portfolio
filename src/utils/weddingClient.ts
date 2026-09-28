import { WEDDING_RSVP_CLIENT_ID_KEY } from '@/constants/wedding';

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
