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
}

export interface FrisbeeGolfRound {
  id: string;
  ownerUserId: string;
  participantUserIds: string[];
  name: string;
  status: FrisbeeGolfRoundStatus;
  holes: FrisbeeGolfHole[];
  players: FrisbeeGolfPlayer[];
  scores: Record<string, Record<number, number>>;
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
