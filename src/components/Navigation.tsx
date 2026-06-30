'use client';

import Link from 'next/link';

import { UserMenu } from '@/components/UserMenu';
import { LOGIN_ROUTE } from 'constants/routes';

interface NavigationProps {
  isLoggedIn: boolean;
  pathname: string;
}

export const Navigation = ({ isLoggedIn, pathname }: NavigationProps) => {
  const iconColor = 'text-white hover:text-brand-300';

  return (
    <nav className="bg-[var(--color-brand-300)]/10">
      <div className="container mx-auto px-3 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold hover:text-brand-300 transition-colors">
            Home
          </Link>

          <div className="flex items-center gap-5">
            <Link href="/apps" className={`${iconColor} text-sm leading-none transition-colors`}>
              Apps
            </Link>
            <Link href="/peapod" className={`${iconColor} text-sm leading-none transition-colors`}>
              Peapod
            </Link>
            <Link href="/steam" className={`${iconColor} text-sm leading-none transition-colors`}>
              Steam
            </Link>
            <Link href="/roll-with-me" className={`${iconColor} text-sm leading-none transition-colors`}>
              Roll With Me
            </Link>
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
    </nav>
  );
};
