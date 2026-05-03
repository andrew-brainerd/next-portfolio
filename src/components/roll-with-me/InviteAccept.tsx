'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { joinGame } from '@/api/rollWithMe';
import { ROLL_WITH_ME_ROUTE } from '@/constants/routes';

interface InviteAcceptProps {
  gameId: string;
}

export const InviteAccept = ({ gameId }: InviteAcceptProps) => {
  const router = useRouter();
  const { user, ready } = useFirebaseUser();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    const name = user.displayName || user.email || 'Player';
    joinGame(gameId, name)
      .then(game => {
        if (!game) {
          setError('Could not join the game.');
          return;
        }
        router.replace(`${ROLL_WITH_ME_ROUTE}/${gameId}`);
      })
      .catch(() => setError('Could not join the game.'));
  }, [gameId, ready, user, router]);

  if (!ready) return null;
  if (!user) {
    return (
      <div className="container mx-auto p-6 text-neutral-300">
        Please sign in to accept the invite.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-md text-center">
      <h1 className="text-2xl font-bold mb-3">Joining game…</h1>
      {error ? (
        <>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => router.push(ROLL_WITH_ME_ROUTE)}
            className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-md cursor-pointer"
          >
            Back to menu
          </button>
        </>
      ) : (
        <p className="text-neutral-400">Hang tight, this only takes a moment.</p>
      )}
    </div>
  );
};
