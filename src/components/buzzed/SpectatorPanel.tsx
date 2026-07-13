'use client';

import { countdownSeconds } from '@/utils/buzzed';
import type { BuzzedGame } from '@/types/buzzed';

interface SpectatorPanelProps {
  game: BuzzedGame;
  now: number;
  isHost: boolean;
}

export const SpectatorPanel = ({ game, now, isHost }: SpectatorPanelProps) => {
  const question = game.currentQuestion;
  const countdown = countdownSeconds(game.playback.resumeAt, now);
  const locked = question?.state === 'locked';
  const ringer = game.players.find(p => p.userId === question?.lockedBy);

  const status = locked
    ? `${ringer?.displayName ?? 'Someone'} is answering`
    : countdown > 0
      ? 'Resuming…'
      : 'Buzzers are live';

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-lg border border-neutral-800 bg-neutral-900/60 p-8 text-center">
      <div
        className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-neutral-800 text-4xl font-bold text-neutral-500"
        style={locked ? { borderColor: ringer?.color ?? undefined } : undefined}
      >
        {countdown > 0 ? countdown : locked ? '!' : '···'}
      </div>

      <div>
        <p className="text-lg font-semibold text-white">{status}</p>
        <p className="text-sm text-neutral-500">
          {isHost ? 'You’re running the game' : 'You’re sitting out'} — {game.players.length} playing
        </p>
      </div>
    </div>
  );
};
