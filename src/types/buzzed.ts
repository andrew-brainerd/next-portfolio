export type BuzzedGameStatus = 'lobby' | 'active' | 'completed';

export type BuzzedTarget = 'host' | 'synced' | 'roku';

export type BuzzedQuestionState = 'armed' | 'answering' | 'grading' | 'complete';

// Explicit union rather than `correct?: boolean` so "hasn't graded yet" can never be confused with "got it
// wrong" — that distinction decides whether a ring-in holds a scoring place.
export type BuzzedGrade = 'correct' | 'missed';

export interface BuzzedPlayer {
  userId: string;
  displayName: string;
  color?: string;
  photoURL?: string;
}

export interface BuzzedSettings {
  answerWindowMs: number;
}

export interface BuzzedPlayback {
  playing: boolean;
  positionSec: number;
  updatedAt: number;
  resumeAt?: number;
  seekToSec?: number;
  seekAt?: number;
}

// Position in this array IS the ring-in order. `points` is filled at grade time, not ring-in time.
export interface BuzzedRingIn {
  userId: string;
  ringAt: number;
  buzzMs: number;
  grade?: BuzzedGrade;
  gradedAt?: number;
  points?: number;
}

export interface BuzzedQuestion {
  index: number;
  state: BuzzedQuestionState;
  videoId?: string;
  armedAt: number;
  rearmedAt: number;
  answerCloseAt?: number;
  pausedAtPositionSec?: number;
  ringIns: BuzzedRingIn[];
  closedAt?: number;
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
  color?: string;
  videoId?: string;
  videoTitle?: string;
  hostPlaying?: boolean;
}

export interface BuzzResponse {
  rang: boolean;
  position?: number;
  game: BuzzedGame;
}

export interface BuzzedStanding {
  userId: string;
  displayName: string;
  color?: string;
  score: number;
  correct: number;
  ringIns: number;
  avgBuzzMs: number | null;
  rank: number;
}

export interface RangInPayload {
  questionIndex: number;
  userId: string;
  displayName: string;
  position: number;
  answerCloseAt?: number;
}

export interface WindowClosedPayload {
  questionIndex?: number;
  nextQuestionIndex?: number;
  rearmedAt?: number;
}

export interface GradedPayload {
  questionIndex: number;
  userId: string;
  grade: BuzzedGrade;
  scores?: Record<string, number>;
}
