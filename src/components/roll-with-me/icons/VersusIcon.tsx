interface VersusIconProps {
  className?: string;
}

export const VersusIcon = ({ className }: VersusIconProps) => (
  <svg viewBox="0 0 120 100" className={className} aria-hidden="true">
    <rect x="6" y="22" width="56" height="56" rx="12" className="fill-brand-500/20 stroke-brand-400" strokeWidth="3" />
    <circle cx="22" cy="38" r="5" className="fill-brand-300" />
    <circle cx="46" cy="62" r="5" className="fill-brand-300" />
    <rect x="58" y="22" width="56" height="56" rx="12" className="fill-neutral-700 stroke-neutral-500" strokeWidth="3" />
    <circle cx="74" cy="38" r="5" className="fill-neutral-300" />
    <circle cx="98" cy="38" r="5" className="fill-neutral-300" />
    <circle cx="74" cy="62" r="5" className="fill-neutral-300" />
    <circle cx="98" cy="62" r="5" className="fill-neutral-300" />
  </svg>
);
