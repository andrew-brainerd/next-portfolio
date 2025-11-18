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
    <nav className={isZillowPage ? 'bg-gradient-to-r from-orange-900 to-amber-800' : 'bg-brand-700'}>
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

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className={
                isZillowPage
                  ? 'bg-amber-500 hover:bg-amber-400 px-4 py-2 rounded transition-colors text-amber-950 font-semibold select-none cursor-pointer'
                  : 'bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded transition-colors select-none cursor-pointer'
              }
              type="button"
            >
              Logout
            </button>
          ) : (
            <Link
              href={`/login?from=${encodeURIComponent(pathname)}`}
              className={
                isZillowPage
                  ? 'bg-amber-500 hover:bg-amber-400 px-4 py-2 rounded transition-colors text-amber-950 font-semibold select-none cursor-pointer'
                  : 'bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded transition-colors select-none cursor-pointer'
              }
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
