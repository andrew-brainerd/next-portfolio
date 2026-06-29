'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { joinFrisbeeGolfRound } from '@/api/scorebook';
import { SCOREBOOK_FRISBEE_GOLF_ROUTE } from 'constants/routes';

interface JoinRoundProps {
  roundId: string;
}

export const JoinRound = ({ roundId }: JoinRoundProps) => {
  const router = useRouter();
  const { user, ready } = useFirebaseUser();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;

    joinFrisbeeGolfRound(roundId)
      .then(round => {
        if (cancelled) return;
        if (!round) {
          setError('Could not join this round.');
          return;
        }
        router.replace(`${SCOREBOOK_FRISBEE_GOLF_ROUTE}/${roundId}`);
      })
      .catch(() => {
        if (!cancelled) setError('This round could not be joined — it may have already started.');
      });

    return () => {
      cancelled = true;
    };
  }, [roundId, ready, user, router]);

  if (!ready) return null;
  if (!user) {
    return <div className="container mx-auto p-6 text-neutral-300">Please sign in to join this round.</div>;
  }

  return (
    <div className="container mx-auto max-w-md p-6 text-center">
      <h1 className="mb-3 text-2xl font-bold text-white">Joining round…</h1>
      {error ? (
        <>
          <p className="mb-4 text-red-400">{error}</p>
          <button
            type="button"
            onClick={() => router.push(SCOREBOOK_FRISBEE_GOLF_ROUTE)}
            className="cursor-pointer rounded-md bg-neutral-700 px-4 py-2 text-white hover:bg-neutral-600"
          >
            Back to rounds
          </button>
        </>
      ) : (
        <p className="text-neutral-400">Hang tight, this only takes a moment.</p>
      )}
    </div>
  );
};
