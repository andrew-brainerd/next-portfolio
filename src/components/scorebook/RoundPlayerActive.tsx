'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

import { getFrisbeeGolfRound, setFrisbeeGolfScore } from '@/api/scorebook';
import { getChannel } from '@/utils/pusher';
import { golfTermForScore } from '@/utils/frisbeeGolfTerms';
import { playScoreError, playScoreSuccess } from '@/utils/scorebookSound';
import { speak } from '@/utils/speech';
import { brandContainedButtonSx } from '@/components/scorebook/fieldStyles';
import { NumberInput } from '@/components/scorebook/NumberInput';
import { ScoreCelebration, type Celebration } from '@/components/scorebook/ScoreCelebration';
import type { FrisbeeGolfRound } from '@/types/scorebook';

const FRISBEE_GOLF_ROUND_UPDATED = 'frisbeeGolfRoundUpdated';
const MAX_SCORE = 15;

interface RoundPlayerActiveProps {
  initialRound: FrisbeeGolfRound;
  currentUserId: string;
}

export const RoundPlayerActive = ({ initialRound, currentUserId }: RoundPlayerActiveProps) => {
  const router = useRouter();
  const [round, setRound] = useState(initialRound);
  const [saving, setSaving] = useState(false);
  const [showScorecard, setShowScorecard] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const celebrationId = useRef(0);

  const myPlayer = round.players.find(p => p.kind === 'user' && p.userId === currentUserId);
  const currentHoleNumber = round.currentHole ?? round.holes[0]?.number ?? 1;
  const hole = round.holes.find(h => h.number === currentHoleNumber) ?? round.holes[0];
  const savedScore = myPlayer ? round.scores[myPlayer.id]?.[hole.number] : undefined;

  const [draft, setDraft] = useState(savedScore ?? hole.par);

  // When the gamemaster moves to a new hole, reset the input to that hole's saved score (or par).
  useEffect(() => {
    setDraft(savedScore ?? hole.par);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hole.number]);

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

  useEffect(() => {
    if (!celebration) return;
    const timer = setTimeout(() => setCelebration(null), 2600);
    return () => clearTimeout(timer);
  }, [celebration]);

  if (!myPlayer) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-neutral-700 bg-neutral-800 p-6 text-center text-neutral-300">
        You’re not listed as a player in this round.
      </div>
    );
  }

  const isDirty = draft !== savedScore;

  const handleSubmit = async () => {
    if (!isDirty) return;
    setSaving(true);
    try {
      const updated = await setFrisbeeGolfScore(round.id, myPlayer.id, hole.number, draft);
      if (updated) setRound(updated);
      const term = golfTermForScore(draft, hole.par);
      celebrationId.current += 1;
      setCelebration({ ...term, id: celebrationId.current });
      playScoreSuccess();
      speak(term.term);
    } catch (err) {
      console.error(err);
      playScoreError();
    } finally {
      setSaving(false);
    }
  };

  const submitLabel = saving ? 'Saving…' : isDirty ? 'Submit score' : 'Saved ✓';

  return (
    <>
      <ScoreCelebration celebration={celebration} />
      <div className="mx-auto max-w-md space-y-6">
        <div className="rounded-xl border border-brand-200 bg-white p-6 text-center text-neutral-900 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-neutral-500">
            Hole {hole.number} of {round.holes.length}
          </div>
          <div className="text-3xl font-bold">Par {hole.par}</div>

          <p className="mt-4 text-sm text-neutral-500">Your score</p>
          <div className="mt-2 flex justify-center">
            <NumberInput value={draft} onChange={setDraft} min={1} max={MAX_SCORE} ariaLabel="Your score" />
          </div>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || !isDirty}
            sx={{ ...brandContainedButtonSx, mt: 3 }}
          >
            {submitLabel}
          </Button>

          <p className="mt-3 text-xs text-neutral-500">
            You can update this until the gamemaster moves to the next hole.
          </p>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowScorecard(s => !s)}
            className="text-sm text-brand-400 underline-offset-2 hover:underline"
          >
            {showScorecard ? 'Hide my scorecard' : 'My scorecard'}
          </button>
        </div>

        {showScorecard && (
          <div className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700 text-neutral-400">
                  <th className="p-2 text-left font-medium">Hole</th>
                  <th className="p-2 text-right font-medium">Par</th>
                  <th className="p-2 text-right font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {round.holes.map(h => {
                  const score = round.scores[myPlayer.id]?.[h.number];
                  const isCurrent = h.number === hole.number;
                  return (
                    <tr
                      key={h.number}
                      className={`border-b border-neutral-800 last:border-0 ${isCurrent ? 'bg-neutral-700/40' : ''}`}
                    >
                      <td className="p-2 text-left text-white">
                        {h.number}
                        {isCurrent && <span className="ml-2 text-xs text-brand-400">current</span>}
                      </td>
                      <td className="p-2 text-right text-neutral-400">{h.par}</td>
                      <td className="p-2 text-right font-mono text-white">{typeof score === 'number' ? score : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};
