'use client';

import { signOutUser } from '@/utils/firebase';

const PILL =
  'rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-medium text-white ' +
  'backdrop-blur-sm transition-colors hover:bg-white/20 focus:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-white cursor-pointer';

export const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      await signOutUser();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button type="button" onClick={handleLogout} className={PILL}>
      Logout
    </button>
  );
};
