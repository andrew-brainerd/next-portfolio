export type BuzzedGameStatus = 'lobby' | 'active' | 'completed';

export type BuzzedTarget = 'host' | 'synced' | 'roku';

export type BuzzedQuestionState = 'armed' | 'locked' | 'resolved' | 'skipped';

export interface BuzzedPlayer {
  userId: string;
  displayName: string;
  color?: string;
  photoURL?: string;
}

export interface BuzzedSettings {
  wrongPenalty: number;
  resumeDelayMs: number;
  disputeWindowMs: number;
}

export interface BuzzedPlayback {
  playing: boolean;
  positionSec: number;
  updatedAt: number;
  resumeAt?: number;
}

export interface BuzzedAttempt {
  userId: string;
  lockedAt: number;
  buzzMs: number;
  correct: boolean;
  answerText?: string;
  resolvedAt: number;
  overturned?: boolean;
}

export interface BuzzedQuestion {
  index: number;
  state: BuzzedQuestionState;
  videoId?: string;
  armedAt: number;
  rearmedAt: number;
  lockedBy?: string;
  lockedAt?: number;
  lockedAtPositionSec?: number;
  lockedOutUserIds: string[];
  controlClientId?: string;
  attempts: BuzzedAttempt[];
  resolvedBy?: string;
  correct?: boolean;
  answerText?: string;
  resolvedAt?: number;
  overturnedBy?: string;
}

export interface BuzzedGame {
  id: string;
  ownerUserId: string;
  participantUserIds: string[];
  joinCode: string;
  name: string;
  status: BuzzedGameStatus;
  target: BuzzedTarget;
  rokuDeviceIp?: string;
  controlClientId?: string;
  players: BuzzedPlayer[];
  scores: Record<string, number>;
  settings: BuzzedSettings;
  playlistId?: string;
  videoId?: string;
  videoTitle?: string;
  playback: BuzzedPlayback;
  currentQuestion: BuzzedQuestion | null;
  history: BuzzedQuestion[];
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

export interface CreateBuzzedGameInput {
  name?: string;
  target?: BuzzedTarget;
  rokuDeviceIp?: string;
  settings?: Partial<BuzzedSettings>;
}

// The buzz response is the winner's fast path — they learn they won from this, not from Pusher.
export interface BuzzResponse {
  won: boolean;
  game: BuzzedGame;
}

export interface BuzzedStanding {
  userId: string;
  displayName: string;
  photoURL?: string;
  color?: string;
  score: number;
  correct: number;
  wrong: number;
  avgBuzzMs: number | null;
  rank: number;
}
