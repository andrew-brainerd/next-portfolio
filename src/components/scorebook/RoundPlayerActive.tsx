'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getFrisbeeGolfRound } from '@/api/scorebook';
import { getChannel } from '@/utils/pusher';
import { PlayerScoreEntry } from '@/components/scorebook/PlayerScoreEntry';
import type { FrisbeeGolfRound } from '@/types/scorebook';

const FRISBEE_GOLF_ROUND_UPDATED = 'frisbeeGolfRoundUpdated';

interface RoundPlayerActiveProps {
  initialRound: FrisbeeGolfRound;
  currentUserId: string;
}

export const RoundPlayerActive = ({ initialRound, currentUserId }: RoundPlayerActiveProps) => {
  const router = useRouter();
  const [round, setRound] = useState(initialRound);

  const myPlayer = round.players.find(p => p.kind === 'user' && p.userId === currentUserId);

  useEffect(() => {
    const channel = getChannel(initialRound.id);
    const refetch = async () => {
      const fresh = await getFrisbeeGolfRound(initialRound.id);
      if (!fresh) return;
      // Status change, or being promoted to owner/gamemaster, re-routes via the server.
      const nowControls =
        fresh.ownerUserId === currentUserId || (fresh.gamemasterUserId ?? fresh.ownerUserId) === currentUserId;
      if (fresh.status !== 'active' || nowControls) {
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
  }, [initialRound.id, router, currentUserId]);

  if (!myPlayer) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-neutral-700 bg-neutral-800 p-6 text-center text-neutral-300">
        You’re not listed as a player in this round.
      </div>
    );
  }

  return <PlayerScoreEntry round={round} myPlayer={myPlayer} onRoundUpdate={setRound} />;
};
