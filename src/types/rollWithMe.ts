export type Slot =
  | 'ones'
  | 'twos'
  | 'threes'
  | 'fours'
  | 'fives'
  | 'sixes'
  | 'kind3'
  | 'kind4'
  | 'fullHouse'
  | 'smStraight'
  | 'lgStraight'
  | 'kind5'
  | 'chance';

export type GameType = 'solo' | 'versus';
export type PlayerSlot = 'player1' | 'player2';

export type Scoreboard = Record<Slot, number>;

export interface RollWithMePlayer {
  uid: string;
  name: string;
  scores: Scoreboard;
}

export interface RollWithMeGame {
  id: string;
  type: GameType;
  player1: RollWithMePlayer;
  player2: RollWithMePlayer | null;
  currentPlayer: PlayerSlot;
  currentRoll: [number, number, number, number, number];
  currentRollNum: number;
  lockedDice: number[];
  isGameOver: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GameStatePatch {
  currentPlayer?: PlayerSlot;
  currentRoll?: [number, number, number, number, number];
  currentRollNum?: number;
  lockedDice?: number[];
  isGameOver?: boolean;
  player1Scores?: Scoreboard;
  player2Scores?: Scoreboard;
}
