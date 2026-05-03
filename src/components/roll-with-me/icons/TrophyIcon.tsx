interface TrophyIconProps {
  className?: string;
}

export const TrophyIcon = ({ className }: TrophyIconProps) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <path
      d="M16 12h32v10c0 8.837-7.163 16-16 16s-16-7.163-16-16V12z"
      className="fill-brand-500/30 stroke-brand-400"
      strokeWidth="2.5"
    />
    <path
      d="M16 16h-6a4 4 0 0 0-4 4v2a8 8 0 0 0 8 8"
      className="fill-none stroke-brand-400"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M48 16h6a4 4 0 0 1 4 4v2a8 8 0 0 1-8 8"
      className="fill-none stroke-brand-400"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path d="M28 38h8v8h4v6H24v-6h4v-8z" className="fill-brand-400" />
  </svg>
);
