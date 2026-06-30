// Derive up to two initials from a display name, falling back to the email
// local-part, for use as an avatar placeholder when there's no profile picture.
export const getUserInitials = (
  displayName?: string | null,
  email?: string | null
): string => {
  const name = displayName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  const local = email?.trim().split('@')[0];
  if (local) {
    return local.slice(0, 2).toUpperCase();
  }

  return '';
};
