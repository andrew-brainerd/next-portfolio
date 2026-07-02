'use client';

import { useState } from 'react';
import Link from 'next/link';

import { UserMenu } from '@/components/UserMenu';
import { MobileNavMenu } from '@/components/MobileNavMenu';
import { HomeIcon } from '@/components/icons/HomeIcon';
import { MenuIcon } from '@/components/icons/MenuIcon';
import { AppsIcon } from '@/components/icons/AppsIcon';
import { PeapodIcon } from '@/components/icons/PeapodIcon';
import { SteamIcon } from '@/components/icons/SteamIcon';
import { RollWithMeIcon } from '@/components/icons/RollWithMeIcon';
import type { NavLink } from '@/types/navigation';
import { LOGIN_ROUTE } from 'constants/routes';

const NAV_LINKS: NavLink[] = [
  { href: '/apps', label: 'Apps', Icon: AppsIcon },
  { href: '/peapod', label: 'Peapod', Icon: PeapodIcon },
  { href: '/steam', label: 'Steam', Icon: SteamIcon },
  { href: '/roll-with-me', label: 'Roll With Me', Icon: RollWithMeIcon }
];

interface NavigationProps {
  isLoggedIn: boolean;
  pathname: string;
}

export const Navigation = ({ isLoggedIn, pathname }: NavigationProps) => {
  const iconColor = 'text-white hover:text-brand-300';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[var(--color-brand-300)]/10">
      <div className="container mx-auto px-3 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" aria-label="Home" className="hover:text-brand-300 transition-colors">
            <HomeIcon className="w-7 h-7" />
          </Link>

          <div className="flex items-center gap-5">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`${iconColor} hidden nav:block text-sm leading-none transition-colors`}
              >
                {link.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className={`${iconColor} flex cursor-pointer items-center transition-colors nav:hidden`}
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
            >
              <MenuIcon className="w-7 h-7" />
            </button>

            {isLoggedIn ? (
              <UserMenu />
            ) : (
              <Link
                href={`${LOGIN_ROUTE}?from=${encodeURIComponent(pathname)}`}
                className={`${iconColor} transition-colors`}
                aria-label="Login"
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21c0-3.31-3.58-6-8-6s-8 2.69-8 6" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="nav:hidden">
        <MobileNavMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={NAV_LINKS} />
      </div>
    </nav>
  );
};
