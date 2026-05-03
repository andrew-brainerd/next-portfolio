'use client';

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
    <div className="flex gap-3 justify-center my-6">
      {currentRoll.map((face, i) => {
        const isLocked = lockedDice.includes(i);
        const isPlaceholder = currentRollNum === 0 || face === 0;
        const disabled = !canInteract || isRolling || currentRollNum === 0;
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onToggleLock(i)}
            aria-label={`Die ${i + 1}: ${isPlaceholder ? 'not rolled' : face}${isLocked ? ' (locked)' : ''}`}
            className={[
              'w-14 h-14 sm:w-16 sm:h-16 rounded-md flex items-center justify-center text-2xl font-bold border transition-colors',
              isLocked
                ? 'bg-brand-700 border-brand-400 text-white'
                : 'bg-neutral-800 border-neutral-600 text-white',
              disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-brand-400'
            ].join(' ')}
          >
            {isPlaceholder ? '·' : face}
          </button>
        );
      })}
    </div>
  );
};
