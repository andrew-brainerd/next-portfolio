'use client';

import { useFirebaseUser } from 'hooks/useFirebaseUser';
import { UserAvatar } from 'components/UserAvatar';

interface PlayerAvatarProps {
  userId?: string;
  displayName: string;
  photoURL?: string | null;
  color?: string;
  size?: number;
}

// Avatar for a Scorebook player: their stored photo (or, for the current user, their
// live photo so it never looks stale), falling back to initials tinted with their
// frisbee color. Guests have no userId/photo and just get color-tinted initials.
export const PlayerAvatar = ({ userId, displayName, photoURL, color, size = 24 }: PlayerAvatarProps) => {
  const { user } = useFirebaseUser();
  const isSelf = !!userId && user?.uid === userId;
  const effectivePhoto = isSelf ? (user?.photoURL ?? photoURL ?? null) : (photoURL ?? null);

  const avatar = (
    <UserAvatar
      photoURL={effectivePhoto}
      displayName={displayName}
      tintColor={color}
      size={size}
      className="shrink-0"
    />
  );

  // Initials already use the frisbee color as their background; when a photo replaces
  // them, keep the color visible as a ring around the picture.
  if (effectivePhoto && color) {
    return (
      <span className="inline-flex shrink-0 rounded-full" style={{ boxShadow: `0 0 0 2px ${color}` }}>
        {avatar}
      </span>
    );
  }

  return avatar;
};
