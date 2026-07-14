'use client';

import { BUZZED_POINTS_BY_RANK, DEFAULT_BUZZER_COLOR } from '@/constants/buzzed';
import type { BuzzedGame, BuzzedQuestion } from '@/types/buzzed';

interface RingInQueueProps {
  game: BuzzedGame;
  question: BuzzedQuestion;
  currentUserId: string;
}

export const RingInQueue = ({ game, question, currentUserId }: RingInQueueProps) => (
  <ol className="flex w-full min-w-0 flex-col gap-1.5">
    {question.ringIns.map((ringIn, i) => {
      const player = game.players.find(p => p.userId === ringIn.userId);
      const isMe = ringIn.userId === currentUserId;
      const potential = BUZZED_POINTS_BY_RANK[i];

      return (
        <li
          key={ringIn.userId}
          className={`flex min-w-0 items-center gap-2.5 rounded-lg border px-3 py-2 ${
            isMe ? 'border-brand-600/60 bg-brand-600/15' : 'border-neutral-800 bg-neutral-900/60'
          }`}
        >
          <span className="w-5 shrink-0 text-center text-sm font-semibold text-neutral-400">{i + 1}</span>

          <span
            aria-hidden
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: player?.color ?? DEFAULT_BUZZER_COLOR }}
          />

          <span className="min-w-0 flex-1 truncate text-sm text-white">
            {player?.displayName ?? 'Player'}
            {isMe && <span className="ml-1.5 text-xs text-neutral-500">(you)</span>}
          </span>

          <span className="shrink-0 text-xs text-neutral-500">
            {ringIn.grade === 'correct'
              ? `+${ringIn.points ?? 0}`
              : ringIn.grade === 'missed'
                ? '✗'
                : potential
                  ? `up to ${potential}`
                  : '0 pts'}
          </span>
        </li>
      );
    })}
  </ol>
);
