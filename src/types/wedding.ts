export type VenueCategory = 'greenhouse' | 'glass-nature' | 'urban-loft' | 'historic-ballroom';
export type VenueRegion = 'west-michigan' | 'detroit-metro' | 'other';

export interface VenueCoords {
  lat: number;
  lng: number;
}

export interface VenueCapacity {
  min?: number;
  max: number;
}

export interface Venue {
  slug: string;
  name: string;
  city: string;
  region: VenueRegion;
  category: VenueCategory;
  description: string;
  url: string;
  priceRange: string;
  priceMidpoint: number;
  capacity: VenueCapacity;
  // Geocoded once and committed to venues.json; null until B-2 fills them in.
  coords: VenueCoords | null;
  // Added in Phase D; optional during A–C.
  imageUrls?: string[];
  features: string[];
}

// --- Storybook wedding config (mirrors brainerd-api src/types/wedding.ts) ---

export interface EventBlock {
  venueName: string;
  address?: string;
  mapUrl?: string; // Google Maps link
  date?: string; // ISO; omitted on ceremony/reception if same as weddingDate
  startTime?: string; // "4:30 PM"
  endTime?: string;
  notes?: string;
}

export interface Hotel {
  name: string;
  address?: string;
  url?: string;
  bookingCode?: string;
  rate?: string;
  notes?: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RegistryLink {
  label: string;
  url: string;
}

export interface WeddingConfig {
  // Guest access — OWNER-ONLY, stripped from the public GET response
  guestPasscode: string;

  // Headline
  coupleNames: { partnerA: string; partnerB: string };
  weddingDate: string; // ISO date, e.g. "2028-06-24"
  tagline?: string;

  // Ceremony & reception
  ceremony: EventBlock;
  reception: EventBlock;
  rehearsalDinner?: EventBlock & { invited?: string };

  // Lodging
  hotels: Hotel[];

  // Guest guidance
  schedule: ScheduleItem[];
  travel?: { parking?: string; airports?: string; directions?: string; notes?: string };
  dressCode?: { title: string; description: string };
  faq: FaqItem[];
  announcements?: string[];

  // Registry
  registry: RegistryLink[];
  honeymoonFund?: { title: string; description?: string; url?: string };

  // RSVP
  rsvp: { enabled: boolean; deadline?: string; message?: string };
}

// Public shape = WeddingConfig without the passcode.
export type PublicWeddingConfig = Omit<WeddingConfig, 'guestPasscode'>;

// Per-chapter mood hook — drives placeholder washes now, art prompts later (spec §4.2)
export type StoryTheme = 'dawn' | 'forest' | 'night' | 'festival';

// --- Guest RSVP (mirrors brainerd-api; separate from the engagement-dinner RSVP) ---

export type WeddingRsvpStatus = 'going' | 'maybe' | 'no';

export interface WeddingRsvpInput {
  clientId: string; // anon client id (localStorage)
  name: string;
  status: WeddingRsvpStatus;
  guestCount: number; // plus-ones beyond the named guest
  guestNames: string[]; // one per plus-one
  note?: string; // dietary restrictions / message
}

export interface WeddingRsvp extends WeddingRsvpInput {
  id?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WeddingRsvpBreakdown {
  going: WeddingRsvp[];
  maybe: WeddingRsvp[];
  no: WeddingRsvp[];
  counts: { going: number; maybe: number; no: number };
  headcount: number;
}

// One authored story chapter (spec §4.2). Lives in src/content/wedding/story.ts,
// edited via PR — deliberately NOT in the CMS, for full design control per page.
export interface StoryChapter {
  id: string; // stable, e.g. "how-we-met"
  title: string; // "The Meeting"
  art?: string; // illustration asset path; absent → themed placeholder frame
  artAlt?: string; // alt text once real art lands (§6 a11y)
  paragraphs: string[]; // storybook prose
  theme?: StoryTheme;
}
