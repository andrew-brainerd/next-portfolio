import type { BuzzedSettings, BuzzedTarget } from '@/types/buzzed';

export const buzzedChannelName = (gameId: string) => `buzzed-game-${gameId}`;

// Mirrors brainerd-api/src/constants/buzzed.ts. Duplicated rather than imported — the house pattern.
export const BUZZED_GAME_UPDATED = 'buzzedGameUpdated';
export const BUZZED_BUZZ_LOCKED = 'buzzedBuzzLocked';
export const BUZZED_BUZZ_REOPENED = 'buzzedBuzzReopened';
export const BUZZED_QUESTION_RESOLVED = 'buzzedQuestionResolved';
export const BUZZED_PLAYBACK_UPDATED = 'buzzedPlaybackUpdated';

export const DEFAULT_BUZZED_SETTINGS: BuzzedSettings = {
  wrongPenalty: 0,
  resumeDelayMs: 5_000,
  disputeWindowMs: 20_000
};

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
