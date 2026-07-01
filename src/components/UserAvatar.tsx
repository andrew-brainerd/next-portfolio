'use client';

import { getUserInitials } from '@/utils/userInitials';

interface UserAvatarProps {
  photoURL?: string | null;
  displayName?: string | null;
  email?: string | null;
  size?: number;
  // Background color for the initials fallback (e.g. a Scorebook player's frisbee color).
  tintColor?: string;
  className?: string;
}

export const UserAvatar = ({
  photoURL,
  displayName,
  email,
  size = 32,
  tintColor,
  className
}: UserAvatarProps) => {
  const dimension = { width: size, height: size };

  if (photoURL) {
    return (
      // Firebase Storage URLs aren't in next.config remotePatterns; a plain <img>
      // matches the rest of the codebase and avoids per-domain config.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoURL}
        alt="Profile picture"
        style={dimension}
        className={`rounded-full object-cover ${className ?? ''}`}
      />
    );
  }

  const initials = getUserInitials(displayName, email);

  return (
    <span
      style={{ ...dimension, fontSize: Math.round(size * 0.4), ...(tintColor ? { backgroundColor: tintColor } : {}) }}
      className={`flex items-center justify-center rounded-full font-medium text-white ${tintColor ? '' : 'bg-brand-600'} ${className ?? ''}`}
      aria-hidden={!initials}
    >
      {initials || (
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: size * 0.6, height: size * 0.6 }}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </svg>
      )}
    </span>
  );
};
