import type { PlowedDirection, PlowedMover, PlowedSprites, PlowedState } from '@/types/plowed';
import { moverPosition, tileAt } from '@/utils/plowed';

export const TILE = 32;

const SPRITE_ROOT = '/plowed';
const WALK_FRAME_MS = 120;
const IDLE_COLUMN = 4;

// Character sheets: one row per facing, walk frames 0-3 then the idle pose.
const FACING_ROW: Record<PlowedDirection, number> = { down: 0, left: 1, up: 2, right: 3 };

// Items sheet: 32px cells.
const ITEM = { cheese: 0, beer: 1, snow: 2, cage: 3 };

// Roads tileset is a corner (Wang) set: index = NW·8 + NE·4 + SW·2 + SE·1, bit set = snowbank.
const WANG: [number, number][] = [
  [64, 32],
  [96, 32],
  [64, 64],
  [32, 64],
  [64, 0],
  [96, 64],
  [0, 32],
  [96, 96],
  [32, 32],
  [64, 96],
  [32, 0],
  [0, 64],
  [96, 0],
  [0, 0],
  [32, 96],
  [0, 96]
];

const COLORS = {
  night: '#0b1324',
  den: 'rgba(26, 16, 48, 0.75)',
  shield: '#f6c343'
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load ${src}`));
    image.src = src;
  });

export const loadPlowedSprites = async (): Promise<PlowedSprites> => {
  const [roads, shoveler, yeti, items] = await Promise.all(
    ['roads', 'shoveler', 'yeti', 'items'].map(name => loadImage(`${SPRITE_ROOT}/${name}.png`))
  );
  return { roads, shoveler, yeti, items };
};

// Out-of-bounds rows count as snowbank; columns wrap like the tunnels do.
const isBank = (state: PlowedState, x: number, y: number) => {
  const { width, height } = state.map;
  if (y < 0 || y >= height) return true;
  return tileAt(state, (x + width) % width, y) === 'wall';
};

// Dual grid: each road tile is centred on a cell corner and picked by the four cells around it.
const drawRoads = (ctx: CanvasRenderingContext2D, state: PlowedState, sprites: PlowedSprites) => {
  const { width, height } = state.map;
  const half = TILE / 2;
  for (let y = 0; y <= height; y++) {
    for (let x = 0; x <= width; x++) {
      const index =
        (isBank(state, x - 1, y - 1) ? 8 : 0) +
        (isBank(state, x, y - 1) ? 4 : 0) +
        (isBank(state, x - 1, y) ? 2 : 0) +
        (isBank(state, x, y) ? 1 : 0);
      const [sx, sy] = WANG[index];
      ctx.drawImage(sprites.roads, sx, sy, TILE, TILE, x * TILE - half, y * TILE - half, TILE, TILE);
    }
  }
};

const drawItem = (ctx: CanvasRenderingContext2D, sprites: PlowedSprites, item: number, x: number, y: number) => {
  ctx.drawImage(sprites.items, item * TILE, 0, TILE, TILE, x, y, TILE, TILE);
};

const drawGround = (ctx: CanvasRenderingContext2D, state: PlowedState, sprites: PlowedSprites, timeMs: number) => {
  const { width, height } = state.map;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = tileAt(state, x, y);
      if (tile === 'snow') drawItem(ctx, sprites, ITEM.snow, x * TILE, y * TILE);
      else if (tile === 'den') {
        ctx.fillStyle = COLORS.den;
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
  }

  const bob = Math.round(Math.sin(timeMs / 250) * 1.5);
  for (const point of state.cheese) drawItem(ctx, sprites, ITEM.cheese, point.x * TILE, point.y * TILE + bob);

  const { beer } = state;
  if (beer && !(beer.ttlMs < 3000 && Math.floor(timeMs / 150) % 2 === 0)) {
    drawItem(ctx, sprites, ITEM.beer, beer.x * TILE, beer.y * TILE + bob);
  }
};

const drawCharacter = (
  ctx: CanvasRenderingContext2D,
  sheet: HTMLImageElement,
  mover: PlowedMover,
  facing: PlowedDirection,
  moving: boolean,
  timeMs: number
) => {
  const size = sheet.height / 4;
  const pos = moverPosition(mover);
  const column = moving ? Math.floor(timeMs / WALK_FRAME_MS) % 4 : IDLE_COLUMN;
  const dx = Math.round(pos.x * TILE + TILE / 2 - size / 2);
  const dy = Math.round(pos.y * TILE + TILE - size + 4);
  ctx.drawImage(sheet, column * size, FACING_ROW[facing] * size, size, size, dx, dy, size, size);
};

const drawPlayer = (
  ctx: CanvasRenderingContext2D,
  state: PlowedState,
  sprites: PlowedSprites,
  facing: PlowedDirection,
  timeMs: number
) => {
  const moving = state.phase === 'playing' && !!state.player.dir;
  if (state.shieldMs > 0) {
    const pos = moverPosition(state.player);
    ctx.strokeStyle = COLORS.shield;
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(timeMs / 120);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(pos.x * TILE + TILE / 2, pos.y * TILE + TILE - 2, 13, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  drawCharacter(ctx, sprites.shoveler, state.player, facing, moving, timeMs);
};

const drawYeti = (ctx: CanvasRenderingContext2D, state: PlowedState, sprites: PlowedSprites, timeMs: number) => {
  const { yeti } = state;
  const caged = yeti.cagedMs > 0;
  const moving = state.phase === 'playing' && !caged && yeti.releaseMs === 0 && !!yeti.dir;
  drawCharacter(ctx, sprites.yeti, yeti, yeti.dir ?? 'down', moving, timeMs);

  if (caged && !(yeti.cagedMs < 1500 && Math.floor(timeMs / 120) % 2 === 0)) {
    const pos = moverPosition(yeti);
    const size = 44;
    const dx = Math.round(pos.x * TILE + TILE / 2 - size / 2);
    const dy = Math.round(pos.y * TILE + TILE - size + 2);
    ctx.drawImage(sprites.items, ITEM.cage * TILE, 0, TILE, TILE, dx, dy, size, size);
  }
};

export const renderPlowed = (
  ctx: CanvasRenderingContext2D,
  state: PlowedState,
  sprites: PlowedSprites,
  facing: PlowedDirection,
  timeMs: number
) => {
  ctx.fillStyle = COLORS.night;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawRoads(ctx, state, sprites);
  drawGround(ctx, state, sprites, timeMs);

  // Whoever is lower on screen draws on top.
  if (moverPosition(state.yeti).y > moverPosition(state.player).y) {
    drawPlayer(ctx, state, sprites, facing, timeMs);
    drawYeti(ctx, state, sprites, timeMs);
  } else {
    drawYeti(ctx, state, sprites, timeMs);
    drawPlayer(ctx, state, sprites, facing, timeMs);
  }
};
