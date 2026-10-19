export type PlowedDirection = 'up' | 'down' | 'left' | 'right';

export type PlowedTile = 'wall' | 'snow' | 'clear' | 'den';

export type PlowedPhase = 'title' | 'ready' | 'playing' | 'paused' | 'levelClear' | 'gameOver';

export type PlowedEvent =
  | 'shovel'
  | 'tierUp'
  | 'streakLost'
  | 'cheese'
  | 'taunt'
  | 'cageBreak'
  | 'beer'
  | 'beerSpawn'
  | 'caught'
  | 'levelClear'
  | 'gameOver';

export interface PlowedPoint {
  x: number;
  y: number;
}

// `#` wall, `.` snow, `C` cheese curds on snow, `P` player spawn (clear), `Y` Yeti den, `S` Yeti
// spawn (den), ` ` clear. Open row ends wrap horizontally.
export interface PlowedMapDef {
  name: string;
  rows: string[];
}

export interface PlowedLevelMap {
  name: string;
  width: number;
  height: number;
  tiles: PlowedTile[];
  playerSpawn: PlowedPoint;
  yetiSpawn: PlowedPoint;
  cheese: PlowedPoint[];
}

// Sits on tile (x, y), heading `dir`, `progress` (0..1) of the way to the next tile.
export interface PlowedMover {
  x: number;
  y: number;
  dir: PlowedDirection | null;
  progress: number;
}

export interface PlowedPlayer extends PlowedMover {
  buffered: PlowedDirection | null;
}

export interface PlowedYeti extends PlowedMover {
  releaseMs: number;
  cagedMs: number;
  taunted: boolean;
}

export interface PlowedBeer {
  x: number;
  y: number;
  ttlMs: number;
}

export interface PlowedState {
  maps: PlowedMapDef[];
  rng: () => number;
  phase: PlowedPhase;
  pausedFrom: PlowedPhase | null;
  phaseTimerMs: number;
  level: number;
  lives: number;
  score: number;
  streak: number;
  comboMs: number;
  piles: number;
  elapsedMs: number;
  map: PlowedLevelMap;
  tiles: PlowedTile[];
  snowLeft: number;
  cheese: PlowedPoint[];
  player: PlowedPlayer;
  yeti: PlowedYeti;
  beer: PlowedBeer | null;
  nextBeerMs: number;
  shieldMs: number;
  events: PlowedEvent[];
}

export interface PlowedHud {
  phase: PlowedPhase;
  score: number;
  multiplier: number;
  lives: number;
  level: number;
  shielded: boolean;
  piles: number;
}

export interface PlowedSprites {
  roads: HTMLImageElement;
  shoveler: HTMLImageElement;
  yeti: HTMLImageElement;
  items: HTMLImageElement;
}
