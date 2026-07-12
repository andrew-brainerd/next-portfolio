import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE } from '@/constants/authentication';
import { BUZZED_NEW_ROUTE, BUZZED_ROUTE, LOGIN_ROUTE } from '@/constants/routes';
import { NewGameForm } from '@/components/buzzed/NewGameForm';

export const metadata = {
  title: 'New Buzzed game'
};

export default async function NewBuzzedGamePage() {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(BUZZED_NEW_ROUTE)}`);
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-4">
        <Link href={BUZZED_ROUTE} className="text-sm text-neutral-400 hover:text-white">
          ← Back to games
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-white sm:text-3xl">New game</h1>

      <NewGameForm />
    </div>
  );
}
