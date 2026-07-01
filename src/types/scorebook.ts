export interface ScorebookGame {
  id: string;
  name: string;
  description: string;
  route: string;
  available: boolean;
}

export type FrisbeeGolfRoundStatus = 'setup' | 'active' | 'completed';

export interface FrisbeeGolfHole {
  number: number;
  par: number;
}

export type FrisbeeGolfPlayerKind = 'user' | 'guest';

export interface FrisbeeGolfPlayer {
  id: string;
  kind: FrisbeeGolfPlayerKind;
  userId?: string;
  displayName: string;
  color?: string;
  photoURL?: string;
}

export interface FrisbeeGolfRound {
  id: string;
  ownerUserId: string;
  gamemasterUserId?: string;
  participantUserIds: string[];
  joinCode: string;
  name: string;
  status: FrisbeeGolfRoundStatus;
  holes: FrisbeeGolfHole[];
  players: FrisbeeGolfPlayer[];
  scores: Record<string, Record<number, number>>;
  currentHole?: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

export interface CreateFrisbeeGolfRoundInput {
  name?: string;
  holeCount: number;
  defaultPar: number;
  players: Omit<FrisbeeGolfPlayer, 'id'>[];
}

export interface FrisbeeGolfBestRound {
  roundId: string;
  name: string;
  total: number;
  overUnder: number;
  completedAt: number;
}

export interface FrisbeeGolfHeadToHead {
  opponentUserId: string;
  opponentName: string;
  opponentPhotoURL?: string;
  sharedRounds: number;
  wins: number;
  losses: number;
  ties: number;
}

export interface FrisbeeGolfUserStats {
  roundsPlayed: number;
  averageScore: number | null;
  averageOverUnder: number | null;
  bestRound: FrisbeeGolfBestRound | null;
  headToHead: FrisbeeGolfHeadToHead[];
}
