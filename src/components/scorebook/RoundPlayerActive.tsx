'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getFrisbeeGolfRound } from '@/api/scorebook';
import { useFrisbeeGolfRoundSync } from '@/hooks/useFrisbeeGolfRoundSync';
import { PlayerScoreEntry } from '@/components/scorebook/PlayerScoreEntry';
import { ScorecardGrid } from '@/components/scorebook/ScorecardGrid';
import type { FrisbeeGolfRound } from '@/types/scorebook';

interface RoundPlayerActiveProps {
  initialRound: FrisbeeGolfRound;
  currentUserId: string;
}

export const RoundPlayerActive = ({ initialRound, currentUserId }: RoundPlayerActiveProps) => {
  const router = useRouter();
  const [round, setRound] = useState(initialRound);

  const isPlayer = (r: FrisbeeGolfRound) => r.players.some(p => p.kind === 'user' && p.userId === currentUserId);
  // Non-players still get to view the scorecard, so default them straight to it.
  const [view, setView] = useState<'mine' | 'grid'>(() => (isPlayer(initialRound) ? 'mine' : 'grid'));

  const myPlayer = round.players.find(p => p.kind === 'user' && p.userId === currentUserId);

  useFrisbeeGolfRoundSync(initialRound.id, fresh => {
    // Status change, or being promoted to owner/gamemaster, re-routes via the server.
    const nowControls =
      fresh.ownerUserId === currentUserId || (fresh.gamemasterUserId ?? fresh.ownerUserId) === currentUserId;
    if (fresh.status !== 'active' || nowControls) {
      router.refresh();
      return;
    }
    setRound(fresh);
  });

  const tabClass = (active: boolean) =>
    `rounded-md px-4 py-1.5 transition-colors ${
      active ? 'bg-brand-600 font-medium text-white' : 'text-neutral-300 hover:text-white'
    }`;

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-neutral-700 bg-neutral-800 p-1 text-sm">
          {myPlayer && (
            <button type="button" onClick={() => setView('mine')} className={tabClass(view === 'mine')}>
              My Score
            </button>
          )}
          <button type="button" onClick={() => setView('grid')} className={tabClass(view === 'grid')}>
            Scorecard
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <ScorecardGrid round={round} canEdit={false} />
      ) : myPlayer ? (
        <PlayerScoreEntry round={round} myPlayer={myPlayer} onRoundUpdate={setRound} />
      ) : (
        <div className="mx-auto max-w-md rounded-xl border border-neutral-700 bg-neutral-800 p-6 text-center text-neutral-300">
          You’re not listed as a player in this round.
        </div>
      )}
    </div>
  );
};
