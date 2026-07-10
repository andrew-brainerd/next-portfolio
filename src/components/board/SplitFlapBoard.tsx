'use client';

import { glyphForCode } from '@/utils/vestaboard';
import { SplitFlapChar } from './SplitFlapChar';

interface SplitFlapBoardProps {
  // rows×cols grid of flap codes.
  grid: number[][];
  flapSpeedMs: number;
}

const gridToText = (grid: number[][]): string =>
  grid
    .map(row =>
      row
        .map(code => {
          const glyph = glyphForCode(code);
          return glyph.char ?? ' ';
        })
        .join('')
        .trimEnd()
    )
    .join(' ')
    .trim();

export const SplitFlapBoard = ({ grid, flapSpeedMs }: SplitFlapBoardProps) => {
  const cols = grid[0]?.length ?? 0;

  return (
    <div
      className="rounded-2xl bg-black p-2 shadow-[0_20px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/5 sm:p-3"
      style={{ width: 'min(96vw, 1080px)' }}
      role="img"
      aria-label={gridToText(grid)}
    >
      <div
        className="grid gap-[3px] sm:gap-[4px]"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {grid.flatMap((row, r) =>
          row.map((code, c) => (
            <SplitFlapChar key={`${r}-${c}`} code={code} flapSpeedMs={flapSpeedMs} staggerMs={(r + c) * 13} />
          ))
        )}
      </div>
    </div>
  );
};
