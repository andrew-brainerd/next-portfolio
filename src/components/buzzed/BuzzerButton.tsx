'use client';

import { useState } from 'react';

import { buzzBlockedReason, canBuzz, ringInPosition, shadeColor } from '@/utils/buzzed';
import { DEFAULT_BUZZER_COLOR } from '@/constants/buzzed';
import type { BuzzedGame } from '@/types/buzzed';

const TRAVEL = 10;

interface BuzzerButtonProps {
  game: BuzzedGame;
  currentUserId: string;
  now: number;
  pending: boolean;
  onBuzz: () => void;
}

export const BuzzerButton = ({ game, currentUserId, now, pending, onBuzz }: BuzzerButtonProps) => {
  const [pressed, setPressed] = useState(false);

  const live = canBuzz(game, currentUserId, now) && !pending;
  const reason = buzzBlockedReason(game, currentUserId, now);
  const position = ringInPosition(game.currentQuestion, currentUserId);

  const color = game.players.find(p => p.userId === currentUserId)?.color ?? DEFAULT_BUZZER_COLOR;
  const rim = shadeColor(color, 0.6);
  const down = pressed && live;

  const release = () => setPressed(false);

  return (
    <div className="flex w-full flex-col items-center gap-4 py-4 sm:gap-6 sm:py-8">
      {/* Caps at the smaller of the container width and the viewport height, so the buzzer is always
          fully visible and thumb-reachable — never taller than the screen on a short phone in landscape. */}
      <div
        className="w-full max-w-[min(20rem,60vh)]"
        style={{ paddingBottom: TRAVEL, WebkitTapHighlightColor: 'transparent' }}
      >
        <button
          type="button"
          onClick={onBuzz}
          disabled={!live}
          aria-label="Ring in"
          onPointerDown={() => setPressed(true)}
          onPointerUp={release}
          onPointerLeave={release}
          onPointerCancel={release}
          style={
            live
              ? {
                  backgroundColor: color,
                  boxShadow: down
                    ? `0 0 0 0 ${rim}, 0 0 40px -14px ${color}`
                    : `0 ${TRAVEL}px 0 0 ${rim}, 0 0 90px -12px ${color}`,
                  transform: `translateY(${down ? TRAVEL : 0}px)`,
                  transitionDuration: down ? '60ms' : '180ms',
                  WebkitTapHighlightColor: 'transparent'
                }
              : { boxShadow: `0 ${TRAVEL}px 0 0 #262626`, WebkitTapHighlightColor: 'transparent' }
          }
          className={`flex aspect-square w-full touch-manipulation items-center justify-center rounded-full p-8 text-3xl font-bold tracking-wider uppercase transition-all ease-out select-none sm:p-12 sm:text-4xl ${
            live
              ? 'cursor-pointer text-white active:brightness-95'
              : 'cursor-not-allowed bg-neutral-800 text-neutral-600'
          }`}
        >
          {position ? `#${position}` : 'Buzz'}
        </button>
      </div>

      <p className="h-5 text-sm text-neutral-400">{live ? '' : reason}</p>
    </div>
  );
};
