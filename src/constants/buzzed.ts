import type { BuzzedSettings, BuzzedTarget } from '@/types/buzzed';

export const buzzedChannelName = (gameId: string) => `buzzed-game-${gameId}`;

export const BUZZED_GAME_UPDATED = 'buzzedGameUpdated';
export const BUZZED_RANG_IN = 'buzzedRangIn';
export const BUZZED_WINDOW_CLOSED = 'buzzedWindowClosed';
export const BUZZED_GRADED = 'buzzedGraded';
export const BUZZED_PLAYBACK_UPDATED = 'buzzedPlaybackUpdated';

// Points by position AMONG THE CORRECT — a wrong answer above you doesn't cost you a place.
export const BUZZED_POINTS_BY_RANK = [3, 2, 1];

export const DEFAULT_BUZZED_SETTINGS: BuzzedSettings = {
  answerWindowMs: 10_000
};

export const ANSWER_WINDOW_CHOICES = [5_000, 10_000, 15_000, 20_000];

export const BUZZED_PLAYER_COLORS = [
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#16a34a',
  '#0891b2',
  '#2563eb',
  '#7c3aed',
  '#db2777'
] as const;

export const DEFAULT_BUZZER_COLOR = '#737373';

export const BUZZED_TARGET_LABELS: Record<BuzzedTarget, string> = {
  host: 'Host’s screen',
  synced: 'Everyone’s own screen',
  roku: 'Roku TV'
};

export const BUZZED_TARGET_DESCRIPTIONS: Record<BuzzedTarget, string> = {
  host: 'The host plays the video on one screen everyone can see. Everyone else just gets a buzzer.',
  synced: 'Everyone plays their own copy, kept in sync by the server. For playing apart.',
  roku: 'The video plays on the TV. Needs the Buzzed app running on the same network.'
};
