'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOutUser } from '@/utils/firebase';
import SettingsIcon from '@/components/icons/SettingsIcon';

interface NavigationProps {
  isLoggedIn: boolean;
  pathname: string;
}

export default function Navigation({ isLoggedIn, pathname }: NavigationProps) {
  const router = useRouter();
  const isZillowPage = pathname === '/zillow';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await signOutUser();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const iconColor = isZillowPage ? 'text-amber-50 hover:text-amber-200' : 'text-white hover:text-brand-300';

  return (
    <nav className={isZillowPage ? 'bg-gradient-to-r from-orange-900 to-amber-800' : 'bg-brand-700'}>
      <div className="container mx-auto px-3 py-4">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className={
              isZillowPage
                ? 'text-xl font-bold hover:text-amber-200 transition-colors text-amber-50'
                : 'text-xl font-bold hover:text-brand-300 transition-colors'
            }
          >
            Home
          </Link>

          <div className="flex items-center gap-5">
            <Link href="/peapod" className={`${iconColor} text-sm transition-colors`}>
              Peapod
            </Link>
            <Link href="/steam" className={`${iconColor} text-sm transition-colors`}>
              Steam
            </Link>
            <Link href="/keiken" className={`${iconColor} text-sm transition-colors`}>
              Keiken
            </Link>
            {isLoggedIn ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(prev => !prev)}
                  className={`${iconColor} transition-colors cursor-pointer`}
                  type="button"
                  aria-label="User menu"
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-40 bg-neutral-800 border border-neutral-600 rounded-lg shadow-lg overflow-hidden z-50">
                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-neutral-700 transition-colors"
                    >
                      <SettingsIcon className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-neutral-700 transition-colors w-full cursor-pointer"
                      type="button"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={`/login?from=${encodeURIComponent(pathname)}`}
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
}
