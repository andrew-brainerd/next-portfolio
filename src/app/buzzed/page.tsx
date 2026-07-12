import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE } from '@/constants/authentication';
import { listBuzzedGames } from '@/api/buzzed';
import { BUZZED_ROUTE, LOGIN_ROUTE } from '@/constants/routes';
import { GamesList } from '@/components/buzzed/GamesList';

export const metadata = {
  title: 'Buzzed'
};

export default async function BuzzedPage() {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(BUZZED_ROUTE)}`);
  }

  const games = await listBuzzedGames();

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="mb-1 text-2xl font-bold text-white sm:text-3xl">Buzzed</h1>
      <p className="mb-6 text-neutral-400">Ring in first. Name the anime.</p>

      <GamesList games={games} />
    </div>
  );
}
