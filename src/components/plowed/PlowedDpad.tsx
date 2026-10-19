'use client';

import type { PlowedDirection } from '@/types/plowed';

const ARROW_PATHS: Record<PlowedDirection, string> = {
  up: 'M12 6l-7 9h14z',
  down: 'M12 18l-7-9h14z',
  left: 'M6 12l9-7v14z',
  right: 'M18 12l-9-7v14z'
};

const POSITIONS: Record<PlowedDirection, string> = {
  up: 'col-start-2 row-start-1',
  left: 'col-start-1 row-start-2',
  right: 'col-start-3 row-start-2',
  down: 'col-start-2 row-start-3'
};

interface PlowedDpadProps {
  onDirection: (dir: PlowedDirection) => void;
  onPause: () => void;
}

export const PlowedDpad = ({ onDirection, onPause }: PlowedDpadProps) => (
  <div className="relative mx-auto flex w-full max-w-xs touch-none items-center justify-center select-none">
    <div className="grid grid-cols-3 grid-rows-3 gap-1">
      {(Object.keys(POSITIONS) as PlowedDirection[]).map(dir => (
        <button
          key={dir}
          type="button"
          aria-label={`Move ${dir}`}
          onPointerDown={event => {
            event.preventDefault();
            onDirection(dir);
          }}
          className={`${POSITIONS[dir]} flex h-14 w-14 items-center justify-center rounded-xl border border-neutral-600 bg-neutral-800/90 text-neutral-200 active:bg-sky-500 active:text-white`}
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
            <path d={ARROW_PATHS[dir]} />
          </svg>
        </button>
      ))}
    </div>
    <button
      type="button"
      aria-label="Pause"
      onPointerDown={event => {
        event.preventDefault();
        onPause();
      }}
      className="absolute right-0 bottom-0 flex h-11 w-11 items-center justify-center rounded-full border border-neutral-600 bg-neutral-800/90 text-neutral-200 active:bg-neutral-600"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
      </svg>
    </button>
  </div>
);
