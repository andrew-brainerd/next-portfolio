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
  endTime?: string; // lets "now" end before the next item starts
  title: string;
  description?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export type RegistryLinkKind = 'registry' | 'paypal' | 'venmo' | 'cashapp' | 'fund' | 'other';

export interface RegistryLink {
  label: string;
  url: string;
  kind?: RegistryLinkKind; // absent = 'registry'
}

export interface WeddingConfig {
  // Guest access — OWNER-ONLY, stripped from the public GET response
  guestPasscode: string;
  guideKey: string; // day-of guidebook tag/QR key; also accepted by /unlock

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

  // Day-of guidebook (/wedding/guide)
  guide: WeddingGuideConfig;
}

// --- Day-of guidebook (spec wedding-guide.md §4) ---

export interface WeddingGuideConfig {
  enabled: boolean;
  timeZone: string; // IANA, drives now/next
  welcome?: string;
  seating: SeatingTable[];
  menu: { courses: MenuCourse[]; bar: MenuCourse[]; note?: string };
  venue: { history?: string; funFacts: string[]; maps: VenueMap[]; practical: PracticalItem[] };
  quiz: WeddingQuizConfig;
  messages: { enabled: boolean; prompt?: string };
}

export interface SeatingTable {
  id: string; // short, URL-safe, stable — used in tag URLs
  name: string;
  description?: string;
  guests: SeatedGuest[];
}

// Either a named guest or an unnamed plus-one ("Guest of <guestOf>")
export interface SeatedGuest {
  name?: string;
  guestOf?: string;
  blurb?: string;
}

export type DietaryTag = 'V' | 'VG' | 'GF' | 'DF' | 'NF' | 'contains-nuts' | 'spicy';

export interface MenuItem {
  name: string;
  description?: string;
  tags: DietaryTag[];
}

export interface MenuCourse {
  title: string;
  items: MenuItem[];
}

export interface VenueMap {
  label: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  activeFrom?: string; // schedule item title after which this layout is the default
}

export interface PracticalItem {
  label: string;
  value: string;
}

export type QuizLeaderboardMode = 'after-close' | 'live' | 'hidden';

export interface WeddingQuizConfig {
  enabled: boolean;
  open: boolean; // manual override — false closes regardless of closesAt
  countsFrom?: string; // ISO with offset; earlier submissions are practice runs
  closesAt?: string; // ISO with offset; server-enforced
  leaderboard: QuizLeaderboardMode;
  title?: string;
  intro?: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: string[]; // exactly 3
  answerIndex: number; // OWNER-ONLY
  reveal?: string; // OWNER-ONLY until submission
}

export type PublicQuizQuestion = Omit<QuizQuestion, 'answerIndex' | 'reveal'>;

export type PublicWeddingGuideConfig = Omit<WeddingGuideConfig, 'quiz'> & {
  quiz: Omit<WeddingQuizConfig, 'questions'> & { questions: PublicQuizQuestion[] };
};

// Public shape strips the passcode, the guide key and the quiz answer key.
export type PublicWeddingConfig = Omit<WeddingConfig, 'guestPasscode' | 'guideKey' | 'guide'> & {
  guide: PublicWeddingGuideConfig;
};

export type QuizAnswers = Record<string, number>;

export interface WeddingQuizEntry {
  id?: string;
  clientId: string;
  name: string;
  answers: QuizAnswers;
  score: number;
  total: number;
  submittedAt: number;
  eligible: boolean; // false = practice run before countsFrom
}

export interface QuizQuestionResult {
  id: string;
  correct: boolean;
  answerIndex: number;
  reveal?: string;
}

export interface QuizResult {
  score: number;
  total: number;
  practice?: boolean;
  rank?: number;
  results: QuizQuestionResult[];
}

export interface QuizLeaderboardEntry {
  name: string;
  score: number;
  total: number;
  submittedAt: number;
}

export interface QuizLeaderboard {
  visible: boolean;
  closesAt?: string;
  entries: QuizLeaderboardEntry[];
  me?: { rank: number; of: number };
}

export type GuideSectionId = 'seating' | 'timeline' | 'menu' | 'venue' | 'quiz' | 'messages' | 'registry' | 'hotels';

export interface GuideSection {
  id: GuideSectionId;
  label: string;
}

export interface SeatMatch {
  tableId: string;
  tableName: string;
  guestIndex: number;
  label: string; // name, or "Guest of <host>"
}

// Remembered on the guest's device after "This is me"
export interface GuideMe {
  tableId: string;
  name: string;
}

// A tag/QR entry link with its server-rendered QR SVG
export interface GuideTagLink {
  label: string;
  tableId?: string;
  url: string;
  svg: string;
}

export type QuizSubmitOutcome =
  | { status: 'ok'; result: QuizResult }
  | { status: 'closed' }
  | { status: 'error' };

export type MessageSendOutcome = 'sent' | 'closed' | 'error';

// The guest's quiz result, remembered on this device
export interface StoredQuizResult {
  name: string;
  result: QuizResult;
}

export interface WeddingMessage {
  id?: string;
  clientId: string;
  name: string;
  message: string;
  table?: string;
  createdAt: number;
  read?: boolean;
}

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
