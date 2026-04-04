import type { SVGAttributes } from 'react';

type IconProps = SVGAttributes<SVGElement> & { size?: string };

const defaults = (size = 'w-6 h-6', className?: string) =>
  `${size} transition-transform duration-150 active:scale-75 ${className || ''}`.trim();

export function HeartIcon({ size, className, fill = 'none', ...props }: IconProps) {
  return (
    <svg
      className={defaults(size, className)}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function PlusIcon({ size, className, ...props }: IconProps) {
  return (
    <svg
      className={defaults(size, className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function CloseIcon({ size, className, ...props }: IconProps) {
  return (
    <svg
      className={defaults(size, className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function PlayIcon({ size, className, ...props }: IconProps) {
  return (
    <svg className={defaults(size, className)} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

export function PauseIcon({ size, className, ...props }: IconProps) {
  return (
    <svg className={defaults(size, className)} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

export function NextIcon({ size, className, ...props }: IconProps) {
  return (
    <svg className={defaults(size, className)} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <polygon points="4,4 15,12 4,20" />
      <rect x="17" y="4" width="3" height="16" />
    </svg>
  );
}

export function BackIcon({ size, className, ...props }: IconProps) {
  return (
    <svg
      className={defaults(size, className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function PersonIcon({ size, className, ...props }: IconProps) {
  return (
    <svg
      className={defaults(size, className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function DiscIcon({ size, className, ...props }: IconProps) {
  return (
    <svg
      className={defaults(size, className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function CheckIcon({ size, className, ...props }: IconProps) {
  return (
    <svg
      className={defaults(size, className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function PencilIcon({ size, className, ...props }: IconProps) {
  return (
    <svg
      className={defaults(size, className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}
