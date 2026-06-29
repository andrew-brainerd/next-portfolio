'use client';

import { useState } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  fullWidth?: boolean;
  ariaLabel?: string;
}

const STEP_BUTTON =
  'flex w-8 shrink-0 items-center justify-center text-lg leading-none text-brand-700 transition-colors ' +
  'hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ' +
  'disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent';

/**
 * Themed numeric stepper used by the scorebook forms. Replaces the native
 * number input (whose spinner controls crowd the value in narrow tiles) with
 * brand-styled −/+ buttons and a clamped, directly-editable field.
 */
export const NumberInput = ({
  value,
  onChange,
  min = 1,
  max = 9,
  disabled,
  fullWidth,
  ariaLabel
}: NumberInputProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  const commit = (raw: string) => {
    const parsed = parseInt(raw, 10);
    onChange(Number.isNaN(parsed) ? value : clamp(parsed));
    setDraft(null);
  };

  return (
    <div
      className={`${
        fullWidth ? 'flex w-full' : 'inline-flex'
      } h-9 items-stretch overflow-hidden rounded-md border border-brand-300 bg-white focus-within:border-brand-600 ${
        disabled ? 'opacity-60' : ''
      }`}
    >
      <button
        type="button"
        aria-label="Decrease"
        className={STEP_BUTTON}
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        role="spinbutton"
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        value={draft ?? String(value)}
        disabled={disabled}
        onChange={e => {
          const raw = e.target.value.replace(/[^0-9]/g, '');
          setDraft(raw);
          if (raw !== '') onChange(clamp(parseInt(raw, 10)));
        }}
        onBlur={e => commit(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') commit((e.target as HTMLInputElement).value);
        }}
        className={`${
          fullWidth ? 'min-w-0 flex-1' : 'w-9'
        } border-x border-brand-200 bg-transparent text-center text-neutral-900 outline-none disabled:cursor-not-allowed`}
      />
      <button
        type="button"
        aria-label="Increase"
        className={STEP_BUTTON}
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || value >= max}
      >
        +
      </button>
    </div>
  );
};
