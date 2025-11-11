'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOutUser } from '@/utils/firebase';

interface NavigationProps {
  isLoggedIn: boolean;
  pathname: string;
}

export default function Navigation({ isLoggedIn, pathname }: NavigationProps) {
  const router = useRouter();
  const isZillowPage = pathname === '/zillow';

  const handleLogout = async () => {
    try {
      await signOutUser();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav
      className={
        isZillowPage
          ? 'bg-gradient-to-r from-orange-900 to-amber-800 border-b border-amber-600'
          : 'bg-brand-700 border-b border-brand-600'
      }
    >
      <div className="container mx-auto px-6 py-4">
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

          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className={
                isZillowPage
                  ? 'bg-orange-800 hover:bg-orange-700 px-4 py-2 rounded transition-colors text-amber-50'
                  : 'bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded transition-colors'
              }
              type="button"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
