'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import { signOutUser } from '@/utils/firebase';
import { useFirebaseUser } from 'hooks/useFirebaseUser';
import { UserAvatar } from 'components/UserAvatar';
import { SettingsIcon } from 'components/icons/SettingsIcon';
import {
  BOARD_ROUTE,
  BUZZED_ROUTE,
  KALSHME_ROUTE,
  KEIKEN_ROUTE,
  LINK_ROUTE,
  MANGA_ROUTE,
  OISHII_ROUTE,
  RSVP_ROUTE,
  SETTINGS_ROUTE,
  US_ROUTE,
  WATCH_ROUTE,
  WEDDING_ROUTE,
  ZILLOW_ROUTE
} from 'constants/routes';

// Pages not linked from the top nav or home tabs
const PAGE_LINKS = [
  { href: BOARD_ROUTE, label: 'Board' },
  { href: BUZZED_ROUTE, label: 'Buzzed' },
  { href: KALSHME_ROUTE, label: 'Kalshme' },
  { href: KEIKEN_ROUTE, label: 'Keiken' },
  { href: LINK_ROUTE, label: 'Link a device' },
  { href: MANGA_ROUTE, label: 'Manga' },
  { href: OISHII_ROUTE, label: 'Oishii' },
  { href: RSVP_ROUTE, label: 'RSVP' },
  { href: US_ROUTE, label: 'Us' },
  { href: WATCH_ROUTE, label: 'Watch' },
  { href: WEDDING_ROUTE, label: 'Wedding' },
  { href: ZILLOW_ROUTE, label: 'Zillow' }
];

// Avatar-triggered account menu. Assumes the caller only renders it when signed
// in (the cookie-based `isLoggedIn` gate); reads the live Firebase user for the
// picture/name. Surfaced in the nav and the home corner so settings + logout are
// reachable on every route.
export const UserMenu = () => {
  const { user } = useFirebaseUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await signOutUser();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex cursor-pointer items-center rounded-full ring-white/40 transition hover:ring-2"
        aria-label="User menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <UserAvatar
          photoURL={user?.photoURL}
          displayName={user?.displayName}
          email={user?.email}
          size={32}
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 w-56 overflow-hidden rounded-lg border border-neutral-600 bg-neutral-800 shadow-lg"
        >
          <div className="border-b border-neutral-700 px-4 py-3">
            <p className="truncate text-sm text-white">{user?.displayName || 'Account'}</p>
            {user?.email && <p className="truncate text-xs text-neutral-400">{user.email}</p>}
          </div>
          <div className="grid grid-cols-2 border-b border-neutral-700 py-1">
            {PAGE_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="truncate px-4 py-2 text-sm text-white transition-colors hover:bg-neutral-700"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href={SETTINGS_ROUTE}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-sm text-white transition-colors hover:bg-neutral-700"
          >
            <SettingsIcon className="h-4 w-4" />
            Settings
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-sm text-white transition-colors hover:bg-neutral-700"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
