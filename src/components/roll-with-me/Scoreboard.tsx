'use client';

import { motion } from 'motion/react';
import { NUMBER_SLOTS, SPECIAL_SLOTS, getNumberTotal, getLeftTotal, getTotal } from '@/utils/rollWithMeScoring';
import type { RollWithMePlayer, Scoreboard as ScoreboardType, Slot } from '@/types/rollWithMe';

interface ScoreCellProps {
  score: number;
  isOpen: boolean;
  showDash?: boolean;
}

const ScoreCell = ({ score, isOpen, showDash }: ScoreCellProps) => {
  if (showDash) return <span className="w-10 text-right text-neutral-700">–</span>;
  if (isOpen) return <span className="w-10 text-right text-neutral-500" />;
  return (
    <motion.span
      key={score}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className="w-10 text-right text-white inline-block"
    >
      {score}
    </motion.span>
  );
};

const SLOT_LABELS: Record<Slot, string> = {
  ones: 'Ones',
  twos: 'Twos',
  threes: 'Threes',
  fours: 'Fours',
  fives: 'Fives',
  sixes: 'Sixes',
  kind3: '3 of a Kind',
  kind4: '4 of a Kind',
  fullHouse: 'Full House',
  smStraight: 'Sm Straight',
  lgStraight: 'Lg Straight',
  kind5: 'Yahtzee',
  chance: 'Chance'
};

interface ScoreboardProps {
  player1: RollWithMePlayer;
  player2: RollWithMePlayer | null;
  available: ScoreboardType;
  selectedSlot: Slot | null;
  canSelect: boolean;
  hasRolled: boolean;
  activeColumn: 'player1' | 'player2';
  onSelectSlot: (slot: Slot) => void;
}

export const Scoreboard = ({
  player1,
  player2,
  available,
  selectedSlot,
  canSelect,
  hasRolled,
  activeColumn,
  onSelectSlot
}: ScoreboardProps) => {
  const renderRow = (slot: Slot) => {
    const p1 = player1.scores[slot];
    const p2 = player2?.scores[slot] ?? -1;
    const isP1Open = p1 < 0;
    const isP2Open = p2 < 0;
    const isSelected = selectedSlot === slot;
    const isActiveOpen = activeColumn === 'player1' ? isP1Open : isP2Open;
    const clickable = canSelect && hasRolled && isActiveOpen;
    const availableScore = available[slot];

    return (
      <button
        type="button"
        key={slot}
        disabled={!clickable}
        onClick={() => clickable && onSelectSlot(slot)}
        className={[
          'grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-3 py-2 text-left rounded-md text-sm border w-full',
          isSelected ? 'border-brand-400 bg-neutral-700' : 'border-transparent',
          clickable ? 'cursor-pointer hover:bg-neutral-800' : 'cursor-default'
        ].join(' ')}
      >
        <span className="text-neutral-200">{SLOT_LABELS[slot]}</span>
        <ScoreCell score={p1} isOpen={isP1Open} />
        <ScoreCell score={p2} isOpen={isP2Open} showDash={!player2} />
        <span className="w-10 text-right text-brand-400 text-xs">
          {hasRolled && isActiveOpen ? availableScore : ''}
        </span>
      </button>
    );
  };

  const numberTotal = getNumberTotal(player1.scores);
  const leftTotal = getLeftTotal(player1.scores);
  const p1Total = getTotal(player1.scores);
  const p2Total = player2 ? getTotal(player2.scores) : 0;
  const p2NumberTotal = player2 ? getNumberTotal(player2.scores) : 0;

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-md p-3 sm:p-4 max-w-md mx-auto">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 mb-2 text-xs uppercase tracking-wide text-neutral-500">
        <span>Slot</span>
        <span className="w-10 text-right">{player1.name.slice(0, 4)}</span>
        <span className="w-10 text-right">{player2 ? player2.name.slice(0, 4) : '—'}</span>
        <span className="w-10 text-right">Avail</span>
      </div>

      <div className="flex flex-col">
        {NUMBER_SLOTS.map(renderRow)}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-1 text-xs text-neutral-400 border-t border-neutral-800 mt-1">
          <span>Bonus</span>
          <span className="w-10 text-right">{numberTotal >= 63 ? 35 : ''}</span>
          <span className="w-10 text-right">{player2 && p2NumberTotal >= 63 ? 35 : ''}</span>
          <span className="w-10" />
        </div>
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-1 text-xs text-neutral-400">
          <span>Subtotal</span>
          <span className="w-10 text-right">{leftTotal || ''}</span>
          <span className="w-10 text-right">{player2 ? getLeftTotal(player2.scores) || '' : ''}</span>
          <span className="w-10" />
        </div>
      </div>

      <div className="flex flex-col mt-2 border-t border-neutral-800 pt-2">
        {SPECIAL_SLOTS.map(renderRow)}
      </div>

      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-2 text-sm font-semibold text-white border-t border-neutral-800 mt-1">
        <span>Total</span>
        <span className="w-10 text-right">{p1Total}</span>
        <span className="w-10 text-right">{player2 ? p2Total : ''}</span>
        <span className="w-10" />
      </div>
    </div>
  );
};
