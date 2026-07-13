import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE, USER_COOKIE } from '@/constants/authentication';
import { getBuzzedGame } from '@/api/buzzed';
import { BUZZED_ROUTE, LOGIN_ROUTE, buzzedResultsRoute } from '@/constants/routes';
import { GameActive } from '@/components/buzzed/GameActive';
import { GameLobby } from '@/components/buzzed/GameLobby';

export const metadata = {
  title: 'Buzzed game'
};

interface BuzzedGamePageProps {
  params: Promise<{ gameId: string }>;
}

export default async function BuzzedGamePage({ params }: BuzzedGamePageProps) {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  const userId = cookieJar.get(USER_COOKIE)?.value;
  const { gameId } = await params;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(`${BUZZED_ROUTE}/${gameId}`)}`);
  }

  const game = await getBuzzedGame(gameId);

  // A finished game only has results — never the play surface, and never a still-running video.
  if (game?.status === 'completed') {
    redirect(buzzedResultsRoute(gameId));
  }

  if (!game) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-white">Game not found.</p>
        <Link href={BUZZED_ROUTE} className="text-brand-400 underline hover:text-brand-300">
          Back to games
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-4">
        <Link href={BUZZED_ROUTE} className="text-sm text-neutral-400 hover:text-white">
          ← Back to games
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-white sm:text-3xl">{game.name}</h1>

      {game.status === 'lobby' ? (
        <GameLobby initialGame={game} currentUserId={userId ?? ''} />
      ) : (
        <GameActive initialGame={game} currentUserId={userId ?? ''} />
      )}
    </div>
  );
}
