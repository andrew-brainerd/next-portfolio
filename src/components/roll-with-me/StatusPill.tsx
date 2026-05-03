import type { ReactNode } from 'react';

export type StatusVariant = 'your-turn' | 'their-turn' | 'waiting' | 'game-over';

interface StatusPillProps {
  variant: StatusVariant;
  children: ReactNode;
}

const VARIANT_CLASS: Record<StatusVariant, string> = {
  'your-turn': 'bg-brand-500/15 text-brand-300 border-brand-400/40',
  'their-turn': 'bg-neutral-700 text-neutral-300 border-neutral-600',
  'waiting': 'bg-amber-500/15 text-amber-300 border-amber-400/40',
  'game-over': 'bg-slate-700 text-slate-300 border-slate-500/60'
};

export const StatusPill = ({ variant, children }: StatusPillProps) => (
  <span
    className={[
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap',
      VARIANT_CLASS[variant]
    ].join(' ')}
  >
    {children}
  </span>
);
