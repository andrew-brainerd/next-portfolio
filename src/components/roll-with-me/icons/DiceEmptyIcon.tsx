interface DiceEmptyIconProps {
  className?: string;
}

export const DiceEmptyIcon = ({ className }: DiceEmptyIconProps) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
    <rect x="14" y="14" width="72" height="72" rx="14" className="fill-neutral-800 stroke-neutral-600" strokeWidth="3" />
    <circle cx="34" cy="34" r="6" className="fill-neutral-500" />
    <circle cx="66" cy="34" r="6" className="fill-neutral-500" />
    <circle cx="50" cy="50" r="6" className="fill-neutral-500" />
    <circle cx="34" cy="66" r="6" className="fill-neutral-500" />
    <circle cx="66" cy="66" r="6" className="fill-neutral-500" />
  </svg>
);
