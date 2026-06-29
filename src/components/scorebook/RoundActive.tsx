'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  setFrisbeeGolfCurrentHole,
  setFrisbeeGolfGamemaster,
  setFrisbeeGolfScore
} from '@/api/scorebook';
import { getChannel } from '@/utils/pusher';
import { brandContainedButtonSx } from '@/components/scorebook/fieldStyles';
import { computeLeaderboard, formatOverUnder, medalForRank } from '@/utils/frisbeeGolfLeaderboard';
import type { FrisbeeGolfRound } from '@/types/scorebook';

const FRISBEE_GOLF_ROUND_UPDATED = 'frisbeeGolfRoundUpdated';

interface RoundActiveProps {
  initialRound: FrisbeeGolfRound;
  isOwner: boolean;
  currentUserId: string;
}

export const RoundActive = ({ initialRound, isOwner, currentUserId }: RoundActiveProps) => {
  const router = useRouter();
  const [round, setRound] = useState(initialRound);
  const [viewedHole, setViewedHole] = useState(initialRound.currentHole ?? initialRound.holes[0]?.number ?? 1);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [holePending, setHolePending] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const channel = getChannel(initialRound.id);
    const refetch = async () => {
      const fresh = await getFrisbeeGolfRound(initialRound.id);
      if (!fresh) return;
      // Status change (completed) or losing control (gamemaster reassigned) re-routes via the server.
      const stillControls =
        fresh.ownerUserId === currentUserId || (fresh.gamemasterUserId ?? fresh.ownerUserId) === currentUserId;
      if (fresh.status !== 'active' || !stillControls) {
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

  const leaderboard = useMemo(() => computeLeaderboard(round), [round]);

  // The "live" hole drives every player's screen; "viewed" is the gamemaster's local
  // cursor for reviewing/fixing any hole without moving the group.
  const liveHole = round.currentHole ?? round.holes[0]?.number ?? 1;
  const viewedIndexRaw = round.holes.findIndex(h => h.number === viewedHole);
  const viewedIndex = viewedIndexRaw < 0 ? 0 : viewedIndexRaw;
  const hole = round.holes[viewedIndex];
  const isFirstHole = viewedIndex <= 0;
  const isLastHole = viewedIndex >= round.holes.length - 1;
  const viewingLive = hole.number === liveHole;
  const nextHoleNumber = round.holes[viewedIndex + 1]?.number;

  const userPlayers = round.players.filter(p => p.kind === 'user' && p.userId);
  const gamemasterUserId = round.gamemasterUserId ?? round.ownerUserId;
  const gamemasterName = userPlayers.find(p => p.userId === gamemasterUserId)?.displayName ?? 'Owner';

  // Move the shared live hole (what players score) and follow it with the local view.
  const setLiveHole = async (holeNumber: number) => {
    setHolePending(true);
    try {
      const updated = await setFrisbeeGolfCurrentHole(round.id, holeNumber);
      if (updated) setRound(updated);
      setViewedHole(holeNumber);
    } catch (err) {
      console.error(err);
    } finally {
      setHolePending(false);
    }
  };

  const handleSetGamemaster = async (userId: string) => {
    try {
      const updated = await setFrisbeeGolfGamemaster(round.id, userId);
      if (updated) setRound(updated);
    } catch (err) {
      console.error(err);
    }
  };

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
      await completeFrisbeeGolfRound(round.id);
      router.refresh();
    } catch (err) {
      console.error(err);
      setCompleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <section className="flex items-center justify-between gap-3 rounded border border-neutral-700 bg-neutral-800 p-3">
        <span className="text-sm text-neutral-400">Gamemaster</span>
        {isOwner ? (
          <select
            value={gamemasterUserId}
            onChange={e => handleSetGamemaster(e.target.value)}
            aria-label="Gamemaster"
            className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm text-white outline-none focus:border-brand-500"
          >
            {userPlayers.map(p => (
              <option key={p.userId} value={p.userId}>
                {p.displayName}
                {p.userId === round.ownerUserId ? ' (owner)' : ''}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm font-medium text-white">{gamemasterName}</span>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">Leaderboard</h2>
        <ol className="rounded border border-neutral-700 bg-neutral-800 divide-y divide-neutral-700">
          {leaderboard.map((entry, index) => {
            const medal = entry.holesPlayed > 0 ? medalForRank(index) : null;
            return (
              <li key={entry.playerId} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-right text-neutral-500">{medal ?? `${index + 1}.`}</span>
                  <span className="text-white font-medium">{entry.displayName}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-mono">{entry.total}</div>
                  <div className="text-xs text-neutral-400">
                    {formatOverUnder(entry.overUnder)} · {entry.holesPlayed}/{round.holes.length} holes
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <IconButton
            aria-label="Previous hole"
            onClick={() => setViewedHole(round.holes[viewedIndex - 1].number)}
            disabled={isFirstHole}
          >
            <ChevronLeftIcon />
          </IconButton>
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-neutral-400">
              Hole {hole.number} of {round.holes.length}
            </div>
            <div className="text-2xl text-white">Par {hole.par}</div>
            {viewingLive ? (
              <span className="mt-1 inline-block rounded bg-green-600/20 px-2 py-0.5 text-xs font-medium text-green-400">
                Live hole
              </span>
            ) : (
              <span className="mt-1 inline-block text-xs text-neutral-400">
                Reviewing · players are on hole {liveHole}
              </span>
            )}
          </div>
          <IconButton
            aria-label="Next hole"
            onClick={() => setViewedHole(round.holes[viewedIndex + 1].number)}
            disabled={isLastHole}
          >
            <ChevronRightIcon />
          </IconButton>
        </div>

        <div className="mb-3 flex items-center justify-center gap-3">
          {viewingLive ? (
            !isLastHole && (
              <Button
                variant="contained"
                onClick={() => setLiveHole(nextHoleNumber)}
                disabled={holePending}
                sx={brandContainedButtonSx}
              >
                Advance group to hole {nextHoleNumber} →
              </Button>
            )
          ) : (
            <>
              <Button
                variant="text"
                onClick={() => setViewedHole(liveHole)}
                sx={{ color: 'var(--color-brand-400)', textTransform: 'none' }}
              >
                Jump to live hole
              </Button>
              <Button
                variant="contained"
                onClick={() => setLiveHole(hole.number)}
                disabled={holePending}
                sx={brandContainedButtonSx}
              >
                Set hole {hole.number} as current
              </Button>
            </>
          )}
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
            'backgroundColor': 'var(--color-brand-600)',
            '&:hover': { backgroundColor: 'var(--color-brand-700)' }
          }}
        >
          {completing ? 'Completing...' : 'Complete round'}
        </Button>
      </div>
    </div>
  );
};
