import { WEDDING_ENTER_ROUTE } from '@/constants/routes';
import { DEFAULT_WEDDING_GUIDE, QUIZ_CHOICE_COUNT } from '@/constants/wedding';
import type {
  GuideSection,
  MenuCourse,
  PublicWeddingConfig,
  QuizQuestion,
  SeatedGuest,
  SeatingTable,
  WeddingGuideConfig
} from '@/types/wedding';

const trimmed = (value?: string): string => (value ?? '').trim();

const optional = (value?: string): string | undefined => {
  const clean = trimmed(value);
  return clean.length > 0 ? clean : undefined;
};

const randomToken = (length: number): string => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join('');
};

/** Tag/QR key — short enough for a compact QR, URL-safe, no look-alike characters. */
export const generateGuideKey = (): string => randomToken(16);

export const newQuizQuestionId = (): string => `q-${randomToken(6).toLowerCase()}`;

/** "Table 7 — The Michigan Crew" → "table-7-the-michigan-crew" (≤24 chars, the backend limit). */
export const slugify = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
    .replace(/-+$/, '');

// Minutes the zone is ahead of UTC at a given instant
const zoneOffsetMinutes = (instant: number, timeZone: string): number => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).formatToParts(new Date(instant));
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(part => part.type === type)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return Math.round((asUtc - instant) / 60000);
};

const formatOffset = (minutes: number): string => {
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
};

/** `<input type="datetime-local">` value in the venue's zone → ISO with offset. "" when blank/invalid. */
export const zonedLocalToIso = (local: string, timeZone: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return '';
  const naive = Date.parse(`${local}:00Z`);
  // Second pass settles instants near a DST transition
  const offset = zoneOffsetMinutes(naive - zoneOffsetMinutes(naive, timeZone) * 60000, timeZone);
  return `${local}:00${formatOffset(offset)}`;
};

/** ISO instant → `datetime-local` value as seen in the venue's zone. "" when blank/invalid. */
export const isoToZonedLocal = (iso: string | undefined, timeZone: string): string => {
  const instant = iso ? Date.parse(iso) : NaN;
  if (Number.isNaN(instant)) return '';
  const local = new Date(instant + zoneOffsetMinutes(instant, timeZone) * 60000);
  return local.toISOString().slice(0, 16);
};

/**
 * Bulk-add guests from pasted lines:
 * "Jane Doe — Andrew's aunt" / "Jane Doe - blurb" / "Guest of Jane Doe" / "Guest of Jane Doe — blurb".
 */
export const parseGuestLines = (text: string): SeatedGuest[] =>
  text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [who, ...rest] = line.split(/\s+[—–-]\s+/);
      const blurb = optional(rest.join(' - '));
      const guestOf = /^guest of\s+(.+)$/i.exec(who.trim())?.[1];
      const guest: SeatedGuest = guestOf ? { guestOf: guestOf.trim() } : { name: who.trim() };
      return blurb ? { ...guest, blurb } : guest;
    });

/** Display label for a seat: the guest's name or "Guest of <host>". */
export const seatLabel = (guest: SeatedGuest): string =>
  trimmed(guest.name) || (trimmed(guest.guestOf) ? `Guest of ${trimmed(guest.guestOf)}` : '');

/** Named guests seated at more than one table (case-insensitive) — a CMS warning, not an error. */
export const findDuplicateGuests = (tables: SeatingTable[]): string[] => {
  const seen = new Map<string, Set<string>>();
  tables.forEach(table =>
    table.guests.forEach(guest => {
      const name = trimmed(guest.name).toLowerCase();
      if (!name) return;
      seen.set(name, (seen.get(name) ?? new Set()).add(table.id || table.name));
    })
  );
  return [...seen.entries()].filter(([, where]) => where.size > 1).map(([name]) => name);
};

/** A question the backend will accept: a prompt and exactly 3 non-empty choices. */
export const isQuizQuestionComplete = (question: QuizQuestion): boolean =>
  trimmed(question.prompt).length > 0 &&
  question.choices.length === QUIZ_CHOICE_COUNT &&
  question.choices.every(choice => trimmed(choice).length > 0);

/** Empty shells for every optional guide field so the CMS inputs stay controlled. */
export const withEditableGuideDefaults = (guide?: WeddingGuideConfig): WeddingGuideConfig => {
  const base = guide ?? DEFAULT_WEDDING_GUIDE;
  return {
    ...base,
    welcome: base.welcome ?? '',
    menu: { ...base.menu, note: base.menu.note ?? '' },
    venue: { ...base.venue, history: base.venue.history ?? '' },
    quiz: {
      ...base.quiz,
      countsFrom: base.quiz.countsFrom ?? '',
      closesAt: base.quiz.closesAt ?? '',
      title: base.quiz.title ?? '',
      intro: base.quiz.intro ?? '',
      questions: base.quiz.questions.map(question => ({
        ...question,
        reveal: question.reveal ?? '',
        choices: Array.from({ length: QUIZ_CHOICE_COUNT }, (_, i) => question.choices[i] ?? '')
      }))
    },
    messages: { ...base.messages, prompt: base.messages.prompt ?? '' }
  };
};

const cleanCourses = (courses: MenuCourse[]): MenuCourse[] =>
  courses
    .map(course => ({
      title: trimmed(course.title),
      items: course.items
        .map(item => ({ name: trimmed(item.name), description: optional(item.description), tags: item.tags }))
        .filter(item => item.name.length > 0)
    }))
    .filter(course => course.title.length > 0);

/** Prune a CMS-form guide into a payload the backend accepts (incomplete rows are dropped). */
export const prepareGuideForSave = (guide: WeddingGuideConfig): WeddingGuideConfig => ({
  enabled: guide.enabled,
  timeZone: guide.timeZone,
  welcome: optional(guide.welcome),
  seating: guide.seating
    .map((table, index) => ({
      id: slugify(trimmed(table.id)) || slugify(table.name) || `t${index + 1}`,
      name: trimmed(table.name),
      description: optional(table.description),
      guests: table.guests
        .map(guest => ({ name: optional(guest.name), guestOf: optional(guest.guestOf), blurb: optional(guest.blurb) }))
        .filter(guest => guest.name || guest.guestOf)
    }))
    .filter(table => table.name.length > 0),
  menu: { courses: cleanCourses(guide.menu.courses), bar: cleanCourses(guide.menu.bar), note: optional(guide.menu.note) },
  venue: {
    history: optional(guide.venue.history),
    funFacts: guide.venue.funFacts.map(trimmed).filter(Boolean),
    maps: guide.venue.maps
      .map(map => ({
        label: trimmed(map.label),
        src: trimmed(map.src),
        alt: trimmed(map.alt),
        width: Math.round(map.width),
        height: Math.round(map.height),
        activeFrom: optional(map.activeFrom)
      }))
      .filter(map => map.label && map.src && map.alt && map.width > 0 && map.height > 0),
    practical: guide.venue.practical
      .map(item => ({ label: trimmed(item.label), value: trimmed(item.value) }))
      .filter(item => item.label && item.value)
  },
  quiz: {
    enabled: guide.quiz.enabled,
    open: guide.quiz.open,
    countsFrom: optional(guide.quiz.countsFrom),
    closesAt: optional(guide.quiz.closesAt),
    leaderboard: guide.quiz.leaderboard,
    title: optional(guide.quiz.title),
    intro: optional(guide.quiz.intro),
    questions: guide.quiz.questions.filter(isQuizQuestionComplete).map(question => ({
      id: slugify(question.id) || newQuizQuestionId(),
      prompt: trimmed(question.prompt),
      choices: question.choices.map(trimmed),
      answerIndex: question.answerIndex,
      reveal: optional(question.reveal)
    }))
  },
  messages: { enabled: guide.messages.enabled, prompt: optional(guide.messages.prompt) }
});

/** Tag/QR entry URLs: the welcome-sign link plus one per table. */
export const guideEntryUrls = (
  origin: string,
  guideKey: string,
  tables: SeatingTable[]
): { label: string; tableId?: string; url: string }[] => {
  if (!guideKey) return [];
  const base = `${origin}${WEDDING_ENTER_ROUTE}?k=${encodeURIComponent(guideKey)}`;
  return [
    { label: 'Welcome sign', url: base },
    ...tables.map(table => ({ label: table.name, tableId: table.id, url: `${base}&table=${encodeURIComponent(table.id)}` }))
  ];
};

/** Guide sections with content, in page order — empty ones are dropped along with their nav chips. */
export const getGuideSections = (config: PublicWeddingConfig): GuideSection[] => {
  const { guide } = config;
  const candidates: (GuideSection & { show: boolean })[] = [
    { id: 'seating', label: 'Your seat', show: guide.seating.length > 0 },
    { id: 'timeline', label: 'Timeline', show: config.schedule.length > 0 },
    { id: 'menu', label: 'Menu', show: guide.menu.courses.length > 0 || guide.menu.bar.length > 0 },
    {
      id: 'venue',
      label: 'The venue',
      show:
        !!guide.venue.history ||
        guide.venue.funFacts.length > 0 ||
        guide.venue.maps.length > 0 ||
        guide.venue.practical.length > 0
    },
    { id: 'quiz', label: 'Quiz', show: guide.quiz.enabled && guide.quiz.questions.length > 0 },
    { id: 'messages', label: 'Message us', show: guide.messages.enabled },
    { id: 'registry', label: 'Registry', show: config.registry.length > 0 || !!config.honeymoonFund?.title },
    { id: 'hotels', label: 'Hotels', show: config.hotels.length > 0 }
  ];
  return candidates.filter(section => section.show).map(({ id, label }) => ({ id, label }));
};
