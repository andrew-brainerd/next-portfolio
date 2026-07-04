import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE, USER_COOKIE } from '@/constants/authentication';
import { getFrisbeeGolfRound } from '@/api/scorebook';
import { LOGIN_ROUTE, SCOREBOOK_FRISBEE_GOLF_ROUTE } from 'constants/routes';
import { RoundActive } from '@/components/scorebook/RoundActive';
import { RoundPlayerActive } from '@/components/scorebook/RoundPlayerActive';
import { RoundCompleted } from '@/components/scorebook/RoundCompleted';
import { RoundSetup } from '@/components/scorebook/RoundSetup';
import { RoundWaiting } from '@/components/scorebook/RoundWaiting';

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
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(`${SCOREBOOK_FRISBEE_GOLF_ROUTE}/${roundId}`)}`);
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
  const gamemasterUserId = round.gamemasterUserId ?? round.ownerUserId;
  const canControl = isOwner || userId === gamemasterUserId;
  const isSetup = round.status === 'setup';

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-4">
        <Link href={SCOREBOOK_FRISBEE_GOLF_ROUTE} className="text-sm text-neutral-400 hover:text-white">
          ← Back to rounds
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2 sm:text-3xl">{round.name}</h1>
      <p className="text-neutral-400 mb-6">
        Status: {round.status} · {round.holes.length} holes · {round.players.length} players
      </p>

      {isSetup && isOwner ? (
        <RoundSetup initialRound={round} />
      ) : round.status === 'active' ? (
        canControl ? (
          <RoundActive initialRound={round} isOwner={isOwner} currentUserId={userId ?? ''} />
        ) : (
          <RoundPlayerActive initialRound={round} currentUserId={userId ?? ''} />
        )
      ) : round.status === 'completed' ? (
        <RoundCompleted round={round} canControl={canControl} />
      ) : (
        <RoundWaiting initialRound={round} />
      )}
    </div>
  );
}
