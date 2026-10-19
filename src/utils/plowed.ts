import type {
  PlowedDirection,
  PlowedLevelMap,
  PlowedMapDef,
  PlowedMover,
  PlowedPoint,
  PlowedState,
  PlowedTile
} from '@/types/plowed';
import { PLOWED_MAPS } from './plowedMaps';

export const PLAYER_SPEED = 6;
export const START_LIVES = 3;
export const MULTIPLIER_STEP = 3;
export const MAX_MULTIPLIER = 8;
export const SNOW_POINTS = 10;
export const CHEESE_POINTS = 50;
export const TAUNT_POINTS = 200;
export const BEER_POINTS = 100;
export const LEVEL_BONUS = 1000;
export const READY_MS = 1500;
export const LEVEL_CLEAR_MS = 2000;
export const YETI_START_DELAY_MS = 2000;
export const BEER_MIN_INTERVAL_MS = 18000;
export const BEER_MAX_INTERVAL_MS = 30000;
export const BEER_TTL_MS = 10000;
export const SHIELD_MS = 8000;
// Time without a fresh pile before the streak (and multiplier) is lost.
export const COMBO_GRACE_MS = 1500;
export const BEER_MIN_DISTANCE = 6;
export const CATCH_DISTANCE = 0.6;
// A turn pressed this far (in tiles) past a junction's centre still takes it.
export const CORNER_WINDOW = 0.3;

export const DIRECTIONS: PlowedDirection[] = ['up', 'left', 'down', 'right'];

const DELTA: Record<PlowedDirection, PlowedPoint> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITE: Record<PlowedDirection, PlowedDirection> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
};

export const multiplierFor = (streak: number) => Math.min(MAX_MULTIPLIER, 1 + Math.floor(streak / MULTIPLIER_STEP));

export const yetiSpeed = (level: number) => Math.min(5.8, 4.2 + 0.25 * (level - 1));

export const yetiWander = (level: number) => Math.max(0.05, 0.35 - 0.06 * (level - 1));

export const cageMs = (level: number) => Math.max(3000, 8000 - 750 * (level - 1));

export const parseMap = (def: PlowedMapDef): PlowedLevelMap => {
  const height = def.rows.length;
  const width = def.rows[0]?.length ?? 0;
  const tiles: PlowedTile[] = [];
  const cheese: PlowedPoint[] = [];
  let playerSpawn: PlowedPoint | null = null;
  let yetiSpawn: PlowedPoint | null = null;

  def.rows.forEach((row, y) => {
    if (row.length !== width) throw new Error(`Map "${def.name}" row ${y} is ${row.length} wide, expected ${width}`);
    [...row].forEach((char, x) => {
      switch (char) {
        case '#':
          tiles.push('wall');
          break;
        case '.':
          tiles.push('snow');
          break;
        case 'C':
          tiles.push('snow');
          cheese.push({ x, y });
          break;
        case 'P':
          tiles.push('clear');
          playerSpawn = { x, y };
          break;
        case 'Y':
          tiles.push('den');
          break;
        case 'S':
          tiles.push('den');
          yetiSpawn = { x, y };
          break;
        case ' ':
          tiles.push('clear');
          break;
        default:
          throw new Error(`Map "${def.name}" has unknown tile "${char}" at ${x},${y}`);
      }
    });
  });

  if (!playerSpawn || !yetiSpawn) throw new Error(`Map "${def.name}" needs a P and an S`);

  return { name: def.name, width, height, tiles, playerSpawn, yetiSpawn, cheese };
};

const tileIndex = (state: PlowedState, x: number, y: number) => y * state.map.width + x;

export const tileAt = (state: PlowedState, x: number, y: number): PlowedTile => state.tiles[tileIndex(state, x, y)];

export const neighbor = (state: PlowedState, x: number, y: number, dir: PlowedDirection): PlowedPoint | null => {
  const { width, height } = state.map;
  const ny = y + DELTA[dir].y;
  if (ny < 0 || ny >= height) return null;
  return { x: (x + DELTA[dir].x + width) % width, y: ny };
};

const playerCanEnter = (state: PlowedState, point: PlowedPoint | null) => {
  if (!point) return false;
  const tile = tileAt(state, point.x, point.y);
  return tile !== 'wall' && tile !== 'den';
};

const yetiCanEnter = (state: PlowedState, point: PlowedPoint | null) =>
  !!point && tileAt(state, point.x, point.y) !== 'wall';

export const moverPosition = (mover: PlowedMover): PlowedPoint => {
  if (!mover.dir) return { x: mover.x, y: mover.y };
  return { x: mover.x + DELTA[mover.dir].x * mover.progress, y: mover.y + DELTA[mover.dir].y * mover.progress };
};

const nearestTile = (state: PlowedState, mover: PlowedMover): PlowedPoint => {
  if (mover.dir && mover.progress >= 0.5) {
    return neighbor(state, mover.x, mover.y, mover.dir) ?? { x: mover.x, y: mover.y };
  }
  return { x: mover.x, y: mover.y };
};

export const moverDistance = (state: PlowedState, a: PlowedMover, b: PlowedMover) => {
  const pa = moverPosition(a);
  const pb = moverPosition(b);
  const rawDx = Math.abs(pa.x - pb.x);
  const dx = Math.min(rawDx, state.map.width - rawDx);
  return Math.hypot(dx, pa.y - pb.y);
};

// BFS distances (in tiles) from `target` over Yeti-walkable tiles; -1 = unreachable.
export const distanceField = (state: PlowedState, target: PlowedPoint): Int16Array => {
  const { width, height } = state.map;
  const dist = new Int16Array(width * height).fill(-1);
  const queue: number[] = [tileIndex(state, target.x, target.y)];
  dist[queue[0]] = 0;
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head];
    const x = current % width;
    const y = Math.floor(current / width);
    for (const dir of DIRECTIONS) {
      const next = neighbor(state, x, y, dir);
      if (!yetiCanEnter(state, next)) continue;
      const nextIndex = tileIndex(state, next!.x, next!.y);
      if (dist[nextIndex] !== -1) continue;
      dist[nextIndex] = dist[current] + 1;
      queue.push(nextIndex);
    }
  }
  return dist;
};

const randomBeerInterval = (state: PlowedState) =>
  BEER_MIN_INTERVAL_MS + state.rng() * (BEER_MAX_INTERVAL_MS - BEER_MIN_INTERVAL_MS);

const resetPositions = (state: PlowedState) => {
  const { playerSpawn, yetiSpawn } = state.map;
  state.player = { x: playerSpawn.x, y: playerSpawn.y, dir: null, progress: 0, buffered: null };
  state.yeti = {
    x: yetiSpawn.x,
    y: yetiSpawn.y,
    dir: null,
    progress: 0,
    releaseMs: YETI_START_DELAY_MS,
    cagedMs: 0,
    taunted: false
  };
  state.streak = 0;
  state.comboMs = 0;
  state.shieldMs = 0;
  state.beer = null;
  state.nextBeerMs = randomBeerInterval(state);
};

const loadLevel = (state: PlowedState, level: number) => {
  state.level = level;
  state.map = parseMap(state.maps[(level - 1) % state.maps.length]);
  state.tiles = [...state.map.tiles];
  state.snowLeft = state.tiles.filter(tile => tile === 'snow').length;
  state.cheese = state.map.cheese.map(point => ({ ...point }));
  resetPositions(state);
};

export interface CreateGameOptions {
  maps?: PlowedMapDef[];
  rng?: () => number;
}

export const createGame = ({ maps = PLOWED_MAPS, rng = Math.random }: CreateGameOptions = {}): PlowedState => {
  const map = parseMap(maps[0]);
  const state: PlowedState = {
    maps,
    rng,
    phase: 'title',
    pausedFrom: null,
    phaseTimerMs: 0,
    level: 1,
    lives: START_LIVES,
    score: 0,
    streak: 0,
    comboMs: 0,
    piles: 0,
    elapsedMs: 0,
    map,
    tiles: [],
    snowLeft: 0,
    cheese: [],
    player: { x: 0, y: 0, dir: null, progress: 0, buffered: null },
    yeti: { x: 0, y: 0, dir: null, progress: 0, releaseMs: 0, cagedMs: 0, taunted: false },
    beer: null,
    nextBeerMs: 0,
    shieldMs: 0,
    events: []
  };
  loadLevel(state, 1);
  return state;
};

export const startGame = (state: PlowedState) => {
  if (state.phase !== 'title' && state.phase !== 'gameOver') return;
  state.lives = START_LIVES;
  state.score = 0;
  state.piles = 0;
  state.elapsedMs = 0;
  state.pausedFrom = null;
  loadLevel(state, 1);
  state.phase = 'ready';
  state.phaseTimerMs = READY_MS;
};

export const queueDirection = (state: PlowedState, dir: PlowedDirection) => {
  state.player.buffered = dir;
};

export const togglePause = (state: PlowedState) => {
  if (state.phase === 'paused') {
    state.phase = state.pausedFrom ?? 'playing';
    state.pausedFrom = null;
  } else if (state.phase === 'playing' || state.phase === 'ready') {
    state.pausedFrom = state.phase;
    state.phase = 'paused';
  }
};

const advance = (
  state: PlowedState,
  mover: PlowedMover,
  distance: number,
  choose: () => PlowedDirection | null,
  onEnter?: () => void
) => {
  let remaining = distance;
  while (remaining > 0) {
    if (mover.progress === 0) {
      mover.dir = choose();
      if (!mover.dir) return;
    }
    const needed = 1 - mover.progress;
    if (remaining < needed) {
      mover.progress += remaining;
      return;
    }
    remaining -= needed;
    const next = neighbor(state, mover.x, mover.y, mover.dir!)!;
    mover.x = next.x;
    mover.y = next.y;
    mover.progress = 0;
    onEnter?.();
    if (state.phase !== 'playing') return;
  }
};

const choosePlayerDirection = (state: PlowedState) => {
  const { player } = state;
  if (player.buffered && playerCanEnter(state, neighbor(state, player.x, player.y, player.buffered))) {
    return player.buffered;
  }
  if (player.dir && playerCanEnter(state, neighbor(state, player.x, player.y, player.dir))) {
    return player.dir;
  }
  // Bends follow the corridor instead of stopping; only a true dead end stops the shoveler.
  if (player.dir) {
    const reverse = OPPOSITE[player.dir];
    const ways = DIRECTIONS.filter(
      dir => dir !== reverse && playerCanEnter(state, neighbor(state, player.x, player.y, dir))
    );
    if (ways.length === 1) {
      if (player.buffered === player.dir) player.buffered = null;
      return ways[0];
    }
  }
  return null;
};

const chooseYetiDirection = (state: PlowedState) => {
  const { yeti } = state;
  let options = DIRECTIONS.filter(dir => yetiCanEnter(state, neighbor(state, yeti.x, yeti.y, dir)));
  if (options.length > 1 && yeti.dir) {
    const reverse = OPPOSITE[yeti.dir];
    options = options.filter(dir => dir !== reverse);
  }
  if (options.length === 0) return null;
  if (state.rng() < yetiWander(state.level)) {
    return options[Math.floor(state.rng() * options.length)];
  }
  const dist = distanceField(state, nearestTile(state, state.player));
  let best = options[0];
  let bestDistance = Infinity;
  for (const dir of options) {
    const next = neighbor(state, yeti.x, yeti.y, dir)!;
    const d = dist[tileIndex(state, next.x, next.y)];
    if (d !== -1 && d < bestDistance) {
      best = dir;
      bestDistance = d;
    }
  }
  return best;
};

const onPlayerEnter = (state: PlowedState) => {
  const { x, y } = state.player;
  const index = tileIndex(state, x, y);

  if (state.tiles[index] === 'snow') {
    const multiplier = multiplierFor(state.streak);
    state.score += SNOW_POINTS * multiplier;
    state.streak += 1;
    state.comboMs = COMBO_GRACE_MS;
    state.piles += 1;
    state.tiles[index] = 'clear';
    state.snowLeft -= 1;
    state.events.push('shovel');
    if (multiplierFor(state.streak) > multiplier) state.events.push('tierUp');
  }

  const cheeseIndex = state.cheese.findIndex(point => point.x === x && point.y === y);
  if (cheeseIndex !== -1) {
    state.cheese.splice(cheeseIndex, 1);
    state.score += CHEESE_POINTS * multiplierFor(state.streak);
    state.yeti.cagedMs = cageMs(state.level);
    state.yeti.taunted = false;
    state.events.push('cheese');
  }

  if (state.beer && state.beer.x === x && state.beer.y === y) {
    state.score += BEER_POINTS;
    state.shieldMs = SHIELD_MS;
    state.beer = null;
    state.events.push('beer');
  }

  if (state.snowLeft === 0) {
    state.score += LEVEL_BONUS * state.level;
    state.phase = 'levelClear';
    state.phaseTimerMs = LEVEL_CLEAR_MS;
    state.events.push('levelClear');
  }
};

const spawnBeer = (state: PlowedState) => {
  const { width } = state.map;
  const { x: px, y: py } = state.player;
  const snowTiles: PlowedPoint[] = [];
  state.tiles.forEach((tile, index) => {
    if (tile === 'snow') snowTiles.push({ x: index % width, y: Math.floor(index / width) });
  });
  const far = snowTiles.filter(point => Math.abs(point.x - px) + Math.abs(point.y - py) >= BEER_MIN_DISTANCE);
  const pool = far.length > 0 ? far : snowTiles;
  if (pool.length === 0) return;
  const spot = pool[Math.floor(state.rng() * pool.length)];
  state.beer = { x: spot.x, y: spot.y, ttlMs: BEER_TTL_MS };
  state.events.push('beerSpawn');
};

const tickTimers = (state: PlowedState, dtMs: number) => {
  if (state.streak > 0 && state.shieldMs <= 0) {
    state.comboMs -= dtMs;
    if (state.comboMs <= 0) {
      state.streak = 0;
      state.comboMs = 0;
      state.events.push('streakLost');
    }
  }
  state.shieldMs = Math.max(0, state.shieldMs - dtMs);

  if (state.beer) {
    state.beer.ttlMs -= dtMs;
    if (state.beer.ttlMs <= 0) {
      state.beer = null;
      state.nextBeerMs = randomBeerInterval(state);
    }
  } else {
    state.nextBeerMs -= dtMs;
    if (state.nextBeerMs <= 0) {
      spawnBeer(state);
      state.nextBeerMs = randomBeerInterval(state);
    }
  }

  const { yeti } = state;
  if (yeti.cagedMs > 0) {
    yeti.cagedMs = Math.max(0, yeti.cagedMs - dtMs);
    if (yeti.cagedMs === 0) state.events.push('cageBreak');
  } else if (yeti.releaseMs > 0) {
    yeti.releaseMs = Math.max(0, yeti.releaseMs - dtMs);
  }
};

const catchPlayer = (state: PlowedState) => {
  state.lives -= 1;
  state.events.push('caught');
  if (state.lives <= 0) {
    state.streak = 0;
    state.comboMs = 0;
    state.shieldMs = 0;
    state.beer = null;
    state.phase = 'gameOver';
    state.events.push('gameOver');
    return;
  }
  resetPositions(state);
  state.phase = 'ready';
  state.phaseTimerMs = READY_MS;
};

const stepPlaying = (state: PlowedState, dtMs: number) => {
  state.elapsedMs += dtMs;
  tickTimers(state, dtMs);

  const { player, yeti } = state;
  if (player.buffered && player.dir && player.progress > 0 && player.buffered === OPPOSITE[player.dir]) {
    const ahead = neighbor(state, player.x, player.y, player.dir)!;
    player.x = ahead.x;
    player.y = ahead.y;
    player.dir = player.buffered;
    player.progress = 1 - player.progress;
  } else if (
    player.buffered &&
    player.dir &&
    player.buffered !== player.dir &&
    player.progress > 0 &&
    player.progress <= CORNER_WINDOW &&
    playerCanEnter(state, neighbor(state, player.x, player.y, player.buffered))
  ) {
    player.dir = player.buffered;
  }

  const seconds = dtMs / 1000;
  advance(
    state,
    player,
    PLAYER_SPEED * seconds,
    () => choosePlayerDirection(state),
    () => onPlayerEnter(state)
  );
  if (state.phase !== 'playing') return;

  if (yeti.cagedMs === 0 && yeti.releaseMs === 0) {
    advance(state, yeti, yetiSpeed(state.level) * seconds, () => chooseYetiDirection(state));
  }

  if (moverDistance(state, player, yeti) < CATCH_DISTANCE) {
    if (yeti.cagedMs > 0) {
      if (!yeti.taunted) {
        yeti.taunted = true;
        state.score += TAUNT_POINTS * multiplierFor(state.streak);
        state.events.push('taunt');
      }
    } else {
      catchPlayer(state);
    }
  }
};

export const step = (state: PlowedState, dtMs: number) => {
  state.events.length = 0;
  switch (state.phase) {
    case 'ready':
      state.phaseTimerMs -= dtMs;
      if (state.phaseTimerMs <= 0) state.phase = 'playing';
      break;
    case 'levelClear':
      state.phaseTimerMs -= dtMs;
      if (state.phaseTimerMs <= 0) {
        loadLevel(state, state.level + 1);
        state.phase = 'ready';
        state.phaseTimerMs = READY_MS;
      }
      break;
    case 'playing':
      stepPlaying(state, dtMs);
      break;
    default:
      break;
  }
};

// CSS width for a pixel-art canvas: whole device-pixel multiples once there's room for 2×, else fit.
export const fitPixelWidth = (available: number, natural: number, devicePixelRatio: number) => {
  const deviceScale = (available * devicePixelRatio) / natural;
  if (deviceScale < 2) return Math.max(0, Math.floor(available));
  return (Math.floor(deviceScale) * natural) / devicePixelRatio;
};
