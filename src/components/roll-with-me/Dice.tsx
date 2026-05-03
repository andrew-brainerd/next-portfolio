'use client';

import { Die } from './Die';

interface DiceProps {
  currentRoll: readonly number[];
  currentRollNum: number;
  lockedDice: readonly number[];
  isRolling: boolean;
  canInteract: boolean;
  onToggleLock: (dieIndex: number) => void;
}

export const Dice = ({
  currentRoll,
  currentRollNum,
  lockedDice,
  isRolling,
  canInteract,
  onToggleLock
}: DiceProps) => {
  return (
    <div className="flex gap-2 sm:gap-4 justify-center">
      {currentRoll.map((face, i) => {
        const isLocked = lockedDice.includes(i);
        const isPlaceholder = currentRollNum === 0 || face === 0;
        const disabled = !canInteract || isRolling || currentRollNum === 0;
        return (
          <Die
            key={i}
            face={face}
            isLocked={isLocked}
            isRolling={isRolling}
            isPlaceholder={isPlaceholder}
            disabled={disabled}
            onClick={() => onToggleLock(i)}
            ariaLabel={`Die ${i + 1}: ${isPlaceholder ? 'not rolled' : face}${isLocked ? ' (locked)' : ''}`}
          />
        );
      })}
    </div>
  );
};
