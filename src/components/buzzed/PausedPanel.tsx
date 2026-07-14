'use client';

import Button from '@mui/material/Button';

interface PausedPanelProps {
  isHost: boolean;
  pending: boolean;
  onResume: () => void;
}

export const PausedPanel = ({ isHost, pending, onResume }: PausedPanelProps) => (
  <div className="flex w-full min-w-0 flex-col items-center gap-3 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-10 text-center">
    <p className="text-4xl" aria-hidden>
      ⏸
    </p>
    <p className="text-2xl font-bold text-white">Paused</p>
    <p className="text-sm text-neutral-400">
      {isHost ? 'Buzzers are off until you resume.' : 'The host paused the game.'}
    </p>

    {isHost && (
      <Button variant="contained" className="mt-2" disabled={pending} onClick={onResume}>
        Resume game
      </Button>
    )}
  </div>
);
