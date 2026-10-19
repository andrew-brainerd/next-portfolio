import { describe, expect, it } from 'vitest';

import type { PlowedMapDef, PlowedState } from '@/types/plowed';
import {
  BEER_TTL_MS,
  CHEESE_POINTS,
  COMBO_GRACE_MS,
  CORNER_WINDOW,
  LEVEL_BONUS,
  PLAYER_SPEED,
  READY_MS,
  SHIELD_MS,
  SNOW_POINTS,
  START_LIVES,
  cageMs,
  createGame,
  distanceField,
  fitPixelWidth,
  multiplierFor,
  parseMap,
  queueDirection,
  startGame,
  step,
  tileAt,
  togglePause,
  yetiSpeed,
  yetiWander
} from './plowed';
import { PLOWED_MAPS } from './plowedMaps';

// One tile of player travel.
const TILE_MS = 1000 / PLAYER_SPEED;

const CORRIDOR: PlowedMapDef = {
  name: 'corridor',
  rows: [
    '##############################',
    '#P...........................#',
    '#############.################',
    '#############S################',
    '##############################'
  ]
};

const begin = (map: PlowedMapDef, rng = () => 0.99) => {
  const state = createGame({ maps: [map, map], rng });
  startGame(state);
  step(state, READY_MS);
  expect(state.phase).toBe('playing');
  return state;
};

const freezeYeti = (state: PlowedState) => {
  state.yeti.releaseMs = Number.MAX_SAFE_INTEGER;
};

const run = (state: PlowedState, ms: number, slice = 10) => {
  for (let t = 0; t < ms; t += slice) step(state, slice);
};

describe('plowed difficulty', () => {
  it('builds the multiplier every 3 piles up to 8x', () => {
    expect(multiplierFor(0)).toBe(1);
    expect(multiplierFor(2)).toBe(1);
    expect(multiplierFor(3)).toBe(2);
    expect(multiplierFor(10)).toBe(4);
    expect(multiplierFor(21)).toBe(8);
    expect(multiplierFor(500)).toBe(8);
  });

  it('scales the Yeti and cage by level with floors', () => {
    expect(yetiSpeed(1)).toBeCloseTo(4.2);
    expect(yetiSpeed(50)).toBe(5.8);
    expect(yetiWander(1)).toBeCloseTo(0.35);
    expect(yetiWander(50)).toBe(0.05);
    expect(cageMs(1)).toBe(8000);
    expect(cageMs(50)).toBe(3000);
  });
});

describe('plowed maps', () => {
  it.each(PLOWED_MAPS.map(map => [map.name, map] as const))('%s is well-formed and fully reachable', (_, def) => {
    const map = parseMap(def);
    expect(map.cheese).toHaveLength(4);

    const state = createGame({ maps: [def] });
    const dist = distanceField(state, map.playerSpawn);
    map.tiles.forEach((tile, index) => {
      if (tile === 'snow') expect(dist[index], `tile ${index} unreachable`).toBeGreaterThanOrEqual(0);
    });
    expect(dist[map.yetiSpawn.y * map.width + map.yetiSpawn.x]).toBeGreaterThan(0);
  });

  // Every open tile having 2 or 4 open neighbours (and the open tiles being connected) means an
  // Euler circuit exists: one continuous route clears the map, re-crossing only its crossroads.
  it.each(PLOWED_MAPS.map(map => [map.name, map] as const))('%s clears in one flow', (_, def) => {
    const map = parseMap(def);
    const { width, height, tiles } = map;
    const open = (x: number, y: number) =>
      y >= 0 && y < height && !['wall', 'den'].includes(tiles[y * width + ((x + width) % width)]);
    const neighbours = (x: number, y: number) =>
      [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1]
      ].filter(([nx, ny]) => open(nx, ny));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!open(x, y)) continue;
        expect([2, 4], `tile ${x},${y} has ${neighbours(x, y).length} exits`).toContain(neighbours(x, y).length);
      }
    }

    const seen = new Set([`${map.playerSpawn.x},${map.playerSpawn.y}`]);
    const queue = [[map.playerSpawn.x, map.playerSpawn.y]];
    while (queue.length) {
      const [x, y] = queue.pop()!;
      for (const [nx, ny] of neighbours(x, y)) {
        const key = `${(nx + width) % width},${ny}`;
        if (!seen.has(key)) {
          seen.add(key);
          queue.push([(nx + width) % width, ny]);
        }
      }
    }
    const openCount = tiles.filter(tile => tile === 'snow' || tile === 'clear').length;
    expect(seen.size).toBe(openCount);
  });

  it('rejects ragged rows and unknown tiles', () => {
    expect(() => parseMap({ name: 'bad', rows: ['#P#', '#S'] })).toThrow();
    expect(() => parseMap({ name: 'bad', rows: ['#PS?'] })).toThrow();
  });
});

describe('plowed movement and scoring', () => {
  it('clears snow it moves through and scores it', () => {
    const state = begin(CORRIDOR);
    queueDirection(state, 'right');
    run(state, TILE_MS * 3 + 5);
    expect(state.player.x).toBe(4);
    expect(tileAt(state, 2, 1)).toBe('clear');
    expect(state.piles).toBe(3);
    expect(state.score).toBe(SNOW_POINTS * 3);
  });

  it('applies the multiplier after 3 consecutive piles', () => {
    const state = begin(CORRIDOR);
    freezeYeti(state);
    queueDirection(state, 'right');
    run(state, TILE_MS * 4 + 5);
    expect(state.piles).toBe(4);
    expect(state.score).toBe(SNOW_POINTS * 3 + SNOW_POINTS * 2);
  });

  it('keeps the streak over cleared tiles until the combo timer runs out', () => {
    const state = begin(CORRIDOR);
    freezeYeti(state);
    queueDirection(state, 'right');
    run(state, TILE_MS * 5 + 5);
    expect(state.streak).toBe(5);

    queueDirection(state, 'left');
    run(state, COMBO_GRACE_MS - 100);
    expect(state.streak).toBe(5);

    run(state, 200);
    expect(state.streak).toBe(0);
    expect(multiplierFor(state.streak)).toBe(1);
  });

  it('refills the combo timer on every pile', () => {
    const state = begin(CORRIDOR);
    freezeYeti(state);
    queueDirection(state, 'right');
    run(state, COMBO_GRACE_MS * 2);
    expect(state.streak).toBe(state.piles);
    expect(state.comboMs).toBeGreaterThan(COMBO_GRACE_MS - TILE_MS - 20);
  });

  it('freezes the combo timer while the beer shield is up', () => {
    const state = begin(CORRIDOR);
    freezeYeti(state);
    queueDirection(state, 'right');
    run(state, TILE_MS * 5 + 5);
    state.shieldMs = SHIELD_MS;
    queueDirection(state, 'left');
    run(state, SHIELD_MS - 100);
    expect(state.streak).toBe(5);

    run(state, COMBO_GRACE_MS + 200);
    expect(state.streak).toBe(0);
  });

  it('stops at walls and turns at the next open tile with a buffered direction', () => {
    const state = begin(CORRIDOR);
    freezeYeti(state);
    queueDirection(state, 'up');
    run(state, TILE_MS * 2);
    expect(state.player).toMatchObject({ x: 1, y: 1, progress: 0 });

    queueDirection(state, 'right');
    run(state, TILE_MS * 2 + 5);
    queueDirection(state, 'down');
    run(state, TILE_MS * 12);
    expect(state.player.x).toBe(13);
    expect(state.player.y).toBe(2);
  });

  it('takes a turn pressed just after passing the junction centre', () => {
    const state = begin(CORRIDOR);
    freezeYeti(state);
    queueDirection(state, 'right');
    run(state, TILE_MS * 12 + 5);
    run(state, TILE_MS * CORNER_WINDOW * 0.5);
    expect(state.player).toMatchObject({ x: 13, y: 1, dir: 'right' });

    queueDirection(state, 'down');
    run(state, TILE_MS + 5);
    expect(state.player).toMatchObject({ x: 13, y: 2 });
  });

  it('misses a turn pressed well past the junction', () => {
    const state = begin(CORRIDOR);
    freezeYeti(state);
    queueDirection(state, 'right');
    run(state, TILE_MS * 12 + 5);
    run(state, TILE_MS * (CORNER_WINDOW + 0.2));
    queueDirection(state, 'down');
    run(state, TILE_MS + 5);
    expect(state.player).toMatchObject({ x: 14, y: 1 });
  });

  it('pauses and resumes', () => {
    const state = begin(CORRIDOR);
    queueDirection(state, 'right');
    togglePause(state);
    run(state, TILE_MS * 3);
    expect(state.piles).toBe(0);
    togglePause(state);
    run(state, TILE_MS + 5);
    expect(state.piles).toBe(1);
  });
});

describe('plowed power-ups', () => {
  it('cheese curds cage the Yeti so it cannot catch the player', () => {
    const map: PlowedMapDef = { name: 'cheese', rows: ['#####', '#PCS#', '#####'] };
    const state = begin(map);
    queueDirection(state, 'right');
    run(state, TILE_MS + 5);
    expect(state.score).toBe(SNOW_POINTS + CHEESE_POINTS + LEVEL_BONUS);
    expect(state.yeti.cagedMs).toBeGreaterThan(cageMs(1) - 100);
    expect(state.phase).toBe('levelClear');
  });

  it('a caged Yeti is harmless and pays a one-time taunt bonus', () => {
    const state = begin(CORRIDOR);
    state.yeti.x = 3;
    state.yeti.y = 1;
    state.yeti.cagedMs = 5000;
    queueDirection(state, 'right');
    run(state, TILE_MS * 2 + 5);
    expect(state.lives).toBe(START_LIVES);
    expect(state.yeti.taunted).toBe(true);
  });

  it('beer spawns on snow, grants the shield, and expires if ignored', () => {
    const state = begin(CORRIDOR);
    freezeYeti(state);
    state.nextBeerMs = 1;
    step(state, 10);
    expect(state.beer).not.toBeNull();
    expect(tileAt(state, state.beer!.x, state.beer!.y)).toBe('snow');

    run(state, BEER_TTL_MS + 20);
    expect(state.beer).toBeNull();

    state.beer = { x: 2, y: 1, ttlMs: BEER_TTL_MS };
    queueDirection(state, 'right');
    run(state, TILE_MS + 5);
    expect(state.beer).toBeNull();
    expect(state.shieldMs).toBeGreaterThan(SHIELD_MS - 100);
  });
});

describe('plowed lives and levels', () => {
  it('loses a life when the Yeti catches the player, then game over at zero', () => {
    const state = begin(CORRIDOR);
    state.yeti.x = 1;
    state.yeti.y = 1;
    state.yeti.releaseMs = 0;
    step(state, 10);
    expect(state.lives).toBe(START_LIVES - 1);
    expect(state.phase).toBe('ready');
    expect(state.player).toMatchObject({ x: 1, y: 1 });

    state.lives = 1;
    step(state, READY_MS);
    state.yeti.x = 1;
    state.yeti.y = 1;
    state.yeti.releaseMs = 0;
    step(state, 10);
    expect(state.phase).toBe('gameOver');
  });

  it('clearing the map awards the level bonus and loads the next level', () => {
    const map: PlowedMapDef = { name: 'tiny', rows: ['######', '#P..S#', '######'] };
    const state = begin(map);
    queueDirection(state, 'right');
    run(state, TILE_MS * 2 + 5);
    expect(state.phase).toBe('levelClear');
    expect(state.score).toBe(SNOW_POINTS * 2 + LEVEL_BONUS);
    run(state, 2000 + READY_MS + 20);
    expect(state.level).toBe(2);
    expect(state.snowLeft).toBe(2);
    expect(state.phase).toBe('playing');
  });

  it('chases the player when it does not wander', () => {
    const state = begin(CORRIDOR);
    state.yeti.releaseMs = 0;
    run(state, 1000);
    expect(state.yeti.y).toBeLessThan(3);
  });
});

describe('fitPixelWidth', () => {
  it('snaps to whole device-pixel multiples when there is room', () => {
    expect(fitPixelWidth(688, 608, 2)).toBe(608);
    expect(fitPixelWidth(1300, 608, 1)).toBe(1216);
  });

  it('fits fractionally on small screens', () => {
    expect(fitPixelWidth(343.5, 608, 3)).toBe(343);
  });
});
