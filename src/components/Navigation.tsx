'use client';

import { useRouter } from 'next/navigation';
import { signOutUser } from '@/utils/firebase';

interface NavigationProps {
  isLoggedIn: boolean;
}

export default function Navigation({ isLoggedIn }: NavigationProps) {
  const router = useRouter();

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
    <nav className="bg-brand-700 border-b border-brand-600">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <a href="/" className="text-xl font-bold hover:text-brand-300 transition-colors">
            Home
          </a>

          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded transition-colors"
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
