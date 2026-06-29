'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getFrisbeeGolfRound } from '@/api/scorebook';
import { getChannel } from '@/utils/pusher';
import { PlayerColorDot } from '@/components/scorebook/PlayerColorDot';
import type { FrisbeeGolfRound } from '@/types/scorebook';

const FRISBEE_GOLF_ROUND_UPDATED = 'frisbeeGolfRoundUpdated';

interface RoundWaitingProps {
  initialRound: FrisbeeGolfRound;
}

export const RoundWaiting = ({ initialRound }: RoundWaitingProps) => {
  const router = useRouter();
  const [round, setRound] = useState(initialRound);

  useEffect(() => {
    const channel = getChannel(initialRound.id);
    const refetch = async () => {
      const fresh = await getFrisbeeGolfRound(initialRound.id);
      if (!fresh) return;
      // Once the gamemaster starts (or the round otherwise leaves setup), re-route
      // via the server so this player lands on the score-entry view.
      if (fresh.status !== 'setup') {
        router.refresh();
        return;
      }
      setRound(fresh);
    };
    channel.bind(FRISBEE_GOLF_ROUND_UPDATED, refetch);
    return () => {
      channel.unbind(FRISBEE_GOLF_ROUND_UPDATED, refetch);
      channel.unsubscribe();
    };
  }, [initialRound.id, router]);

  return (
    <>
      <p className="text-neutral-400 italic mb-4">Waiting for the gamemaster to start the round.</p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Players</h2>
        <ul className="space-y-1 text-neutral-300">
          {round.players.map(player => (
            <li key={player.id} className="flex items-center gap-2">
              <PlayerColorDot color={player.color} />
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
  );
};
