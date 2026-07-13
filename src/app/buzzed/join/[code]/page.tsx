import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE, USER_COOKIE } from '@/constants/authentication';
import { lookupBuzzedGameByCode } from '@/api/buzzed';
import { BUZZED_ROUTE, LOGIN_ROUTE } from '@/constants/routes';
import { JoinGame } from '@/components/buzzed/JoinGame';

export const metadata = {
  title: 'Join a Buzzed game'
};

interface JoinBuzzedGamePageProps {
  params: Promise<{ code: string }>;
}

export default async function JoinBuzzedGamePage({ params }: JoinBuzzedGamePageProps) {
  const { code } = await params;
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  const userId = cookieJar.get(USER_COOKIE)?.value;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(`${BUZZED_ROUTE}/join/${code}`)}`);
  }

  const game = await lookupBuzzedGameByCode(code);

  if (!game) {
    return (
      <div className="mx-auto w-full max-w-5xl p-6 text-center">
        <p className="mb-2 text-white">That game code doesn’t exist.</p>
        <Link href={BUZZED_ROUTE} className="text-brand-400 underline hover:text-brand-300">
          Back to games
        </Link>
      </div>
    );
  }

  if (game.status === 'completed') {
    redirect(`${BUZZED_ROUTE}/${game.id}`);
  }

  if (userId && game.participantUserIds.includes(userId)) {
    redirect(`${BUZZED_ROUTE}/${game.id}`);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
      <JoinGame game={game} />
    </div>
  );
}
