import type { StoryChapter } from '@/types/wedding';

/**
 * The authored relationship story (spec §4.2) — the illustrated heart of the
 * book. Edited via PR, deliberately not in the CMS.
 *
 * ── PLACEHOLDER CONTENT ──────────────────────────────────────────────────
 * Every paragraph below is scaffolding for the real story beats (how we met,
 * first date, adventures, the proposal). Swap the prose in place; `art` gets
 * filled by the Gemini pipeline in Phase W-G (Appendix B — keep each image's
 * lower third calm for the overlaid text).
 */
export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'how-we-met',
    title: 'The Meeting',
    theme: 'dawn',
    art: '/wedding/how-we-met.jpg',
    artAlt: 'Illustration of Andrew and Hayley meeting in a sunlit coffee shop',
    paragraphs: [
      'Every story starts somewhere. Ours starts with two people, one ordinary day, and absolutely no idea what was coming.',
      'Placeholder — replace with how Andrew and Hayley actually met.'
    ]
  },
  {
    id: 'first-date',
    title: 'The First Date',
    theme: 'forest',
    art: '/wedding/first-date.jpg',
    artAlt: 'Illustration of Andrew and Hayley walking a sun-dappled forest trail',
    paragraphs: [
      'There are dates, and then there are the ones you keep retelling for years.',
      'Placeholder — replace with the real first-date story (the place, the nerves, the moment it clicked).'
    ]
  },
  {
    id: 'adventures',
    title: 'The Adventures',
    theme: 'festival',
    art: '/wedding/adventures.jpg',
    artAlt: 'Illustration of Andrew and Hayley sharing festival food under strings of gold lanterns',
    paragraphs: [
      'Somewhere between the first date and forever came all the in-between: the trips, the inside jokes, the anime marathons, the forests and the sunshine.',
      'Placeholder — replace with two or three favorite moments worth a page of their own.'
    ]
  },
  {
    id: 'chilling',
    title: 'The Chilling',
    theme: 'night',
    art: '/wedding/chilling.jpg',
    artAlt: 'Illustration of Andrew and Hayley playing video games together on the couch under a blanket',
    paragraphs: [
      'Not every chapter is an adventure. Some of the best ones are two controllers, one blanket, and a rematch that absolutely was not going to be the last.',
      'Placeholder — replace with the real couch-gaming lore (the games, who wins, the trash talk).'
    ]
  },
  {
    id: 'the-migration',
    title: 'The Migration',
    theme: 'dawn',
    art: '/wedding/the-migration.jpg',
    artAlt: 'Illustration of Andrew and Hayley beside their packed car on a desert highway, the Las Vegas skyline glowing ahead',
    paragraphs: [
      'Then came the biggest adventure yet: everything we owned in one car, Michigan in the rearview, and a glowing desert skyline up ahead.',
      'Placeholder — replace with the real moving story (the drive, the goodbyes, the first Vegas sunset).'
    ]
  },
  {
    id: 'the-proposal',
    title: 'The Question',
    theme: 'night',
    art: '/wedding/the-proposal.jpg',
    artAlt: 'Illustration of Andrew proposing to Hayley on one knee under a starry sky',
    paragraphs: [
      'And then, one day, a question — the easiest yes there ever was.',
      'Placeholder — replace with the proposal story.'
    ]
  }
];
