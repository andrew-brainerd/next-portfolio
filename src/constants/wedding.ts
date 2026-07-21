import type { WeddingRsvpStatus } from '@/types/wedding';

// localStorage keys for the guest RSVP — distinct from the engagement-dinner
// RSVP keys so the two features never collide in the same browser.
export const WEDDING_RSVP_CLIENT_ID_KEY = 'wedding-rsvp-client-id';
export const WEDDING_RSVP_SAVED_KEY = 'wedding-rsvp-saved';

export const WEDDING_RSVP_STATUSES: { value: WeddingRsvpStatus; label: string }[] = [
  { value: 'going', label: "We'll be there" },
  { value: 'maybe', label: 'Maybe' },
  { value: 'no', label: "Can't make it" }
];
