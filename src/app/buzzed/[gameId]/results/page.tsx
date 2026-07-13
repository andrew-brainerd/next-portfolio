import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE, USER_COOKIE } from '@/constants/authentication';
import { getBuzzedGame } from '@/api/buzzed';
import { BUZZED_ROUTE, LOGIN_ROUTE, buzzedGameRoute, buzzedResultsRoute } from '@/constants/routes';
import { GameResults } from '@/components/buzzed/GameResults';

export const metadata = {
  title: 'Buzzed results'
};

interface BuzzedResultsPageProps {
  params: Promise<{ gameId: string }>;
}

export default async function BuzzedResultsPage({ params }: BuzzedResultsPageProps) {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  const userId = cookieJar.get(USER_COOKIE)?.value;
  const { gameId } = await params;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(buzzedResultsRoute(gameId))}`);
  }

  const game = await getBuzzedGame(gameId);

  if (!game) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="mb-2 text-white">Game not found.</p>
        <Link href={BUZZED_ROUTE} className="text-brand-400 underline hover:text-brand-300">
          Back to games
        </Link>
      </div>
    );
  }

  // There are no results until the game is over.
  if (game.status !== 'completed') {
    redirect(buzzedGameRoute(gameId));
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-4">
        <Link href={BUZZED_ROUTE} className="text-sm text-neutral-400 hover:text-white">
          ← Back to games
        </Link>
      </div>
      <h1 className="mb-1 text-2xl font-bold text-white sm:text-3xl">{game.name}</h1>
      <p className="mb-6 text-neutral-400">Final results</p>

      <GameResults game={game} currentUserId={userId ?? ''} />
    </div>
  );
}
