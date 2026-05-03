interface SoloIconProps {
  className?: string;
}

export const SoloIcon = ({ className }: SoloIconProps) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
    <rect x="22" y="22" width="56" height="56" rx="12" className="fill-brand-500/20 stroke-brand-400" strokeWidth="3" />
    <circle cx="50" cy="50" r="7" className="fill-brand-300" />
  </svg>
);
