'use client';

import type { GolfTerm } from '@/utils/frisbeeGolfTerms';

export interface Celebration extends GolfTerm {
  id: number;
}

interface ScoreCelebrationProps {
  celebration: Celebration | null;
}

const CONFETTI = ['🎉', '✨', '🥏', '🎊', '⭐', '🙌'];

export const ScoreCelebration = ({ celebration }: ScoreCelebrationProps) => {
  if (!celebration) return null;

  return (
    <div
      key={celebration.id}
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      aria-live="polite"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="animate-confetti-fall absolute top-0 text-2xl"
          style={{ left: `${i * 8 + 4}%`, animationDelay: `${(i % 6) * 0.12}s` }}
        >
          {CONFETTI[i % CONFETTI.length]}
        </span>
      ))}
      <div className="animate-celebrate-pop rounded-2xl bg-neutral-900/90 px-8 py-6 text-center shadow-2xl ring-1 ring-white/10">
        <div className="text-5xl">{celebration.emoji}</div>
        <div className="mt-2 text-2xl font-bold text-white">{celebration.term}</div>
      </div>
    </div>
  );
};
