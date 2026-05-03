'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface DieProps {
  face: number;
  isLocked: boolean;
  isRolling: boolean;
  isPlaceholder: boolean;
  disabled: boolean;
  onClick: () => void;
  ariaLabel: string;
}

const PIP_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [
    [28, 28],
    [72, 72]
  ],
  3: [
    [28, 28],
    [50, 50],
    [72, 72]
  ],
  4: [
    [28, 28],
    [72, 28],
    [28, 72],
    [72, 72]
  ],
  5: [
    [28, 28],
    [72, 28],
    [50, 50],
    [28, 72],
    [72, 72]
  ],
  6: [
    [28, 25],
    [72, 25],
    [28, 50],
    [72, 50],
    [28, 75],
    [72, 75]
  ]
};

const PIP_RADIUS = 9;
const SHUFFLE_TICK_MS = 70;

const renderPips = (face: number, fillClass: string) => {
  const positions = PIP_POSITIONS[face] ?? [];
  return positions.map(([cx, cy], i) => (
    <circle key={i} cx={cx} cy={cy} r={PIP_RADIUS} className={fillClass} />
  ));
};

export const Die = ({ face, isLocked, isRolling, isPlaceholder, disabled, onClick, ariaLabel }: DieProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const [shuffleFace, setShuffleFace] = useState<number | null>(null);

  const isShuffling = isRolling && !isLocked && !isPlaceholder && !reducedMotion;

  useEffect(() => {
    if (!isShuffling) return;
    const interval = setInterval(() => {
      setShuffleFace(Math.floor(Math.random() * 6) + 1);
    }, SHUFFLE_TICK_MS);
    return () => {
      clearInterval(interval);
      setShuffleFace(null);
    };
  }, [isShuffling]);

  const displayFace = isShuffling && shuffleFace !== null ? shuffleFace : face;

  const baseClass =
    'relative aspect-square w-16 sm:w-20 rounded-2xl flex items-center justify-center border-2 transition-colors';
  const lockedClass = isLocked
    ? 'bg-brand-700 border-brand-300 shadow-[0_0_0_3px_rgba(56,189,248,0.15)]'
    : 'bg-neutral-50 border-neutral-300';
  const interactivityClass = disabled
    ? 'cursor-not-allowed opacity-60'
    : 'cursor-pointer hover:border-brand-400 active:scale-95';

  const pipClass = isLocked ? 'fill-white' : 'fill-neutral-800';
  const showPips = !isPlaceholder && displayFace >= 1 && displayFace <= 6;

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      animate={isShuffling ? { rotate: [0, -8, 6, -4, 0] } : { rotate: 0 }}
      transition={
        isShuffling
          ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
          : { type: 'spring', stiffness: 400, damping: 18 }
      }
      whileTap={!disabled ? { scale: 0.92 } : undefined}
      className={[baseClass, lockedClass, interactivityClass].join(' ')}
    >
      <svg viewBox="0 0 100 100" className="w-11 h-11 sm:w-14 sm:h-14" aria-hidden="true">
        {showPips ? (
          renderPips(displayFace, pipClass)
        ) : (
          <circle cx="50" cy="50" r="6" className={`${pipClass} opacity-30`} />
        )}
      </svg>
    </motion.button>
  );
};
