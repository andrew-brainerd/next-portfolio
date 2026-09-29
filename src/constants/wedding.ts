import type {
  DietaryTag,
  QuizLeaderboardMode,
  RegistryLinkKind,
  WeddingGuideConfig,
  WeddingRsvpStatus
} from '@/types/wedding';

// localStorage keys for the guest RSVP — distinct from the engagement-dinner
// RSVP keys so the two features never collide in the same browser.
export const WEDDING_RSVP_CLIENT_ID_KEY = 'wedding-rsvp-client-id';
export const WEDDING_RSVP_SAVED_KEY = 'wedding-rsvp-saved';

export const WEDDING_RSVP_STATUSES: { value: WeddingRsvpStatus; label: string }[] = [
  { value: 'going', label: "We'll be there" },
  { value: 'maybe', label: 'Maybe' },
  { value: 'no', label: "Can't make it" }
];

// --- Day-of guidebook ---

export const DEFAULT_WEDDING_GUIDE: WeddingGuideConfig = {
  enabled: false,
  timeZone: 'America/Detroit',
  seating: [],
  menu: { courses: [], bar: [] },
  venue: { funFacts: [], maps: [], practical: [] },
  quiz: { enabled: false, open: true, leaderboard: 'after-close', questions: [] },
  messages: { enabled: false }
};

export const GUIDE_TIME_ZONES = [
  'America/Detroit',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'America/Los_Angeles'
];

export const DIETARY_TAGS: { value: DietaryTag; label: string }[] = [
  { value: 'V', label: 'Vegetarian' },
  { value: 'VG', label: 'Vegan' },
  { value: 'GF', label: 'Gluten-free' },
  { value: 'DF', label: 'Dairy-free' },
  { value: 'NF', label: 'Nut-free' },
  { value: 'contains-nuts', label: 'Contains nuts' },
  { value: 'spicy', label: 'Spicy' }
];

export const REGISTRY_LINK_KINDS: { value: RegistryLinkKind; label: string }[] = [
  { value: 'registry', label: 'Registry' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'venmo', label: 'Venmo' },
  { value: 'cashapp', label: 'Cash App' },
  { value: 'fund', label: 'Fund' },
  { value: 'other', label: 'Other' }
];

export const QUIZ_LEADERBOARD_MODES: { value: QuizLeaderboardMode; label: string }[] = [
  { value: 'after-close', label: 'Reveal when the quiz closes' },
  { value: 'live', label: 'Live all evening' },
  { value: 'hidden', label: 'Never show guests' }
];

export const QUIZ_CHOICE_COUNT = 3;

// Release windows, in calendar months before weddingDate (spec wedding.md §3)
export const STORYBOOK_OPENS_MONTHS_BEFORE = 6;
export const RSVP_OPENS_MONTHS_BEFORE = 3;
