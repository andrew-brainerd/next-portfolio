'use client';

import { useEffect, useMemo, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

import {
  clearFrisbeeGolfScore,
  completeFrisbeeGolfRound,
  getFrisbeeGolfRound,
  setFrisbeeGolfScore
} from '@/api/scorebook';
import { getChannel } from '@/utils/pusher';
import { computeLeaderboard, formatOverUnder } from '@/utils/frisbeeGolfLeaderboard';
import type { FrisbeeGolfRound } from '@/types/scorebook';

const FRISBEE_GOLF_ROUND_UPDATED = 'frisbeeGolfRoundUpdated';

interface RoundActiveProps {
  initialRound: FrisbeeGolfRound;
  isOwner: boolean;
}

export const RoundActive = ({ initialRound, isOwner }: RoundActiveProps) => {
  const [round, setRound] = useState(initialRound);
  const [currentHole, setCurrentHole] = useState(initialRound.holes[0]?.number ?? 1);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const channel = getChannel(initialRound.id);
    const refetch = async () => {
      const fresh = await getFrisbeeGolfRound(initialRound.id);
      if (fresh) setRound(fresh);
    };
    channel.bind(FRISBEE_GOLF_ROUND_UPDATED, refetch);
    return () => {
      channel.unbind(FRISBEE_GOLF_ROUND_UPDATED, refetch);
      channel.unsubscribe();
    };
  }, [initialRound.id]);

  const leaderboard = useMemo(() => computeLeaderboard(round), [round]);

  const hole = round.holes.find(h => h.number === currentHole) ?? round.holes[0];
  const currentIndex = round.holes.findIndex(h => h.number === hole.number);
  const isFirstHole = currentIndex <= 0;
  const isLastHole = currentIndex >= round.holes.length - 1;

  const adjustScore = async (playerId: string, delta: number) => {
    const existing = round.scores[playerId]?.[hole.number];
    const next = Math.max(1, (typeof existing === 'number' ? existing : hole.par) + delta);
    if (existing === next) return;
    const key = `${playerId}-${hole.number}`;
    setPendingKey(key);
    try {
      const updated = await setFrisbeeGolfScore(round.id, playerId, hole.number, next);
      if (updated) setRound(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setPendingKey(null);
    }
  };

  const clearScore = async (playerId: string) => {
    if (round.scores[playerId]?.[hole.number] === undefined) return;
    const key = `${playerId}-${hole.number}`;
    setPendingKey(key);
    try {
      await clearFrisbeeGolfScore(round.id, playerId, hole.number);
      const fresh = await getFrisbeeGolfRound(round.id);
      if (fresh) setRound(fresh);
    } catch (err) {
      console.error(err);
    } finally {
      setPendingKey(null);
    }
  };

  const missingScores = round.players.reduce((acc, player) => {
    const playerScores = round.scores[player.id] || {};
    const missing = round.holes.filter(h => typeof playerScores[h.number] !== 'number').length;
    return acc + missing;
  }, 0);

  const handleComplete = async () => {
    if (missingScores > 0) {
      const ok = window.confirm(
        `${missingScores} score${missingScores === 1 ? ' is' : 's are'} still missing. Complete the round anyway?`
      );
      if (!ok) return;
    }
    setCompleting(true);
    try {
      const updated = await completeFrisbeeGolfRound(round.id);
      setRound(updated);
    } catch (err) {
      console.error(err);
      setCompleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">Leaderboard</h2>
        <ol className="rounded border border-neutral-700 bg-neutral-800 divide-y divide-neutral-700">
          {leaderboard.map((entry, index) => (
            <li key={entry.playerId} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <span className="text-neutral-500 w-5 text-right">{index + 1}.</span>
                <span className="text-white font-medium">{entry.displayName}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-mono">{entry.total}</div>
                <div className="text-xs text-neutral-400">
                  {formatOverUnder(entry.overUnder)} · {entry.holesPlayed}/{round.holes.length} holes
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <IconButton
            aria-label="Previous hole"
            onClick={() => setCurrentHole(round.holes[currentIndex - 1].number)}
            disabled={isFirstHole}
          >
            <ChevronLeftIcon />
          </IconButton>
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-neutral-400">
              Hole {hole.number} of {round.holes.length}
            </div>
            <div className="text-2xl text-white">Par {hole.par}</div>
          </div>
          <IconButton
            aria-label="Next hole"
            onClick={() => setCurrentHole(round.holes[currentIndex + 1].number)}
            disabled={isLastHole}
          >
            <ChevronRightIcon />
          </IconButton>
        </div>

        <ul className="space-y-2">
          {round.players.map(player => {
            const score = round.scores[player.id]?.[hole.number];
            const key = `${player.id}-${hole.number}`;
            const isPending = pendingKey === key;
            return (
              <li
                key={player.id}
                className="flex items-center justify-between rounded border border-neutral-700 bg-neutral-800 p-3"
              >
                <span className="text-white font-medium truncate mr-3">{player.displayName}</span>
                <div className="flex items-center gap-2">
                  <IconButton
                    aria-label="Decrease score"
                    onClick={() => adjustScore(player.id, -1)}
                    disabled={isPending || score === 1}
                    size="small"
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <span className="text-2xl text-white font-mono min-w-[2ch] text-center">
                    {typeof score === 'number' ? score : '—'}
                  </span>
                  <IconButton
                    aria-label="Increase score"
                    onClick={() => adjustScore(player.id, 1)}
                    disabled={isPending}
                    size="small"
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                  {typeof score === 'number' && (
                    <Button
                      size="small"
                      variant="text"
                      color="inherit"
                      onClick={() => clearScore(player.id)}
                      disabled={isPending}
                      sx={{ color: 'var(--color-neutral-400)', textTransform: 'none', ml: 1 }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {isOwner && (
        <div className="flex items-center justify-between gap-3 border-t border-neutral-800 pt-6">
          <div className="text-sm text-neutral-400">
            {missingScores === 0
              ? 'All scores entered. Ready to complete the round.'
              : `${missingScores} score${missingScores === 1 ? '' : 's'} still missing.`}
          </div>
          <Button
            variant="contained"
            onClick={handleComplete}
            disabled={completing}
            sx={{
              backgroundColor: 'var(--color-brand-600)',
              '&:hover': { backgroundColor: 'var(--color-brand-700)' }
            }}
          >
            {completing ? 'Completing...' : 'Complete round'}
          </Button>
        </div>
      )}
    </div>
  );
};
