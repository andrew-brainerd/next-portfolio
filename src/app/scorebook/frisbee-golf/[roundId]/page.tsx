import Link from 'next/link';
import { cookies } from 'next/headers';

import { TOKEN_COOKIE, USER_COOKIE } from '@/constants/authentication';
import { getFrisbeeGolfRound } from '@/api/scorebook';
import { LOGIN_ROUTE, SCOREBOOK_FRISBEE_GOLF_ROUTE } from 'constants/routes';
import { RoundActive } from '@/components/scorebook/RoundActive';
import { RoundCompleted } from '@/components/scorebook/RoundCompleted';
import { RoundSetup } from '@/components/scorebook/RoundSetup';

export const metadata = {
  title: 'Frisbee Golf round'
};

interface RoundDetailPageProps {
  params: Promise<{ roundId: string }>;
}

export default async function FrisbeeGolfRoundPage({ params }: RoundDetailPageProps) {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  const userId = cookieJar.get(USER_COOKIE)?.value;
  const { roundId } = await params;

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-y-4">
        <p className="text-white text-xl">Please log in to view this round.</p>
        <Link
          href={`${LOGIN_ROUTE}?returnTo=${SCOREBOOK_FRISBEE_GOLF_ROUTE}/${roundId}`}
          className="text-brand-400 underline hover:text-brand-300"
        >
          Go to login
        </Link>
      </div>
    );
  }

  const round = await getFrisbeeGolfRound(roundId);

  if (!round) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-white">Round not found.</p>
        <Link href={SCOREBOOK_FRISBEE_GOLF_ROUTE} className="text-brand-400 underline hover:text-brand-300">
          Back to rounds
        </Link>
      </div>
    );
  }

  const isOwner = userId === round.ownerUserId;
  const isSetup = round.status === 'setup';

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Link href={SCOREBOOK_FRISBEE_GOLF_ROUTE} className="text-sm text-neutral-400 hover:text-white">
          ← Back to rounds
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">{round.name}</h1>
      <p className="text-neutral-400 mb-6">
        Status: {round.status} · {round.holes.length} holes · {round.players.length} players
      </p>

      {isSetup && isOwner ? (
        <RoundSetup initialRound={round} />
      ) : round.status === 'active' ? (
        <RoundActive initialRound={round} isOwner={isOwner} />
      ) : round.status === 'completed' ? (
        <RoundCompleted round={round} />
      ) : (
        <>
          <p className="text-neutral-400 italic mb-4">Waiting for the owner to start the round.</p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Players</h2>
            <ul className="text-neutral-300 list-disc list-inside">
              {round.players.map(player => (
                <li key={player.id}>
                  {player.displayName} <span className="text-xs text-neutral-500">({player.kind})</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Holes</h2>
            <ul className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2 text-center">
              {round.holes.map(hole => (
                <li key={hole.number} className="rounded border border-neutral-700 bg-neutral-800 p-2">
                  <div className="text-xs text-neutral-400">Hole {hole.number}</div>
                  <div className="text-lg text-white">Par {hole.par}</div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
