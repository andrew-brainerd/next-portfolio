'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import { BUZZED_ROUTE } from '@/constants/routes';
import { RosterToggle } from '@/components/buzzed/RosterToggle';
import type { BuzzedGame } from '@/types/buzzed';

interface GameMenuProps {
  game: BuzzedGame;
  currentUserId: string;
  onChange: (game: BuzzedGame) => void;
}

const ITEM = 'block w-full px-4 py-2.5 text-left text-sm text-neutral-200 hover:bg-neutral-800';

export const GameMenu = ({ game, currentUserId, onChange }: GameMenuProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Game menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-md border border-neutral-700 bg-neutral-900 shadow-lg">
          <Link href={BUZZED_ROUTE} className={ITEM}>
            Back to games
          </Link>

          <RosterToggle
            game={game}
            currentUserId={currentUserId}
            onChange={fresh => {
              onChange(fresh);
              setOpen(false);
            }}
            className={`${ITEM} disabled:opacity-50`}
          />
        </div>
      )}
    </div>
  );
};
