export const DEFAULT_DISC_COLOR = '#f59e0b';

interface PlayerColorDotProps {
  color?: string;
  className?: string;
}

/** Small swatch shown next to a player's name to identify their frisbee color. */
export const PlayerColorDot = ({ color, className }: PlayerColorDotProps) => (
  <span
    className={`inline-block h-3 w-3 shrink-0 rounded-full border border-black/20 ${className ?? ''}`}
    style={{ backgroundColor: color || DEFAULT_DISC_COLOR }}
    aria-hidden="true"
  />
);
