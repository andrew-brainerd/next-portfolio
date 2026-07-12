'use client';

import { BUZZED_PLAYER_COLORS } from '@/constants/buzzed';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  taken?: string[];
}

export const ColorPicker = ({ value, onChange, taken = [] }: ColorPickerProps) => (
  <div className="flex flex-wrap gap-2">
    {BUZZED_PLAYER_COLORS.map(color => {
      const isTaken = taken.includes(color) && color !== value;

      return (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          disabled={isTaken}
          aria-label={isTaken ? `Colour taken` : `Pick colour ${color}`}
          aria-pressed={value === color}
          style={{ backgroundColor: color }}
          className={`h-9 w-9 rounded-full transition-all ${
            value === color
              ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-950'
              : 'hover:scale-110'
          } ${isTaken ? 'cursor-not-allowed opacity-25' : ''}`}
        />
      );
    })}
  </div>
);
