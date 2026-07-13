'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';

import {
  clearFrisbeeGolfScore,
  completeFrisbeeGolfRound,
  getFrisbeeGolfRound,
  setFrisbeeGolfCurrentHole,
  setFrisbeeGolfScore
} from '@/api/scorebook';
import { getChannel, leaveChannel } from '@/utils/pusher';
import { brandButtonSx, brandContainedButtonSx } from '@/components/scorebook/fieldStyles';
import { computeLeaderboard, formatOverUnder, medalForRank } from '@/utils/frisbeeGolfLeaderboard';
import { PlayerAvatar } from '@/components/scorebook/PlayerAvatar';
import { PlayerScoreEntry } from '@/components/scorebook/PlayerScoreEntry';
import { ScorecardGrid } from '@/components/scorebook/ScorecardGrid';
import { RoundControlsModal } from '@/components/scorebook/RoundControlsModal';
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
  const [showSettings, setShowSettings] = useState(false);
  const [view, setView] = useState<'manage' | 'grid' | 'mine'>('manage');

  // The gamemaster is only "playing" if they're also on the roster; that gates the My Score tab.
  const myPlayer = round.players.find(p => p.kind === 'user' && p.userId === currentUserId);

  const tabClass = (active: boolean) =>
    `rounded-md px-4 py-1.5 transition-colors ${
      active ? 'bg-brand-600 font-medium text-white' : 'text-neutral-300 hover:text-white'
    }`;

  useEffect(() => {
    const channelName = initialRound.id;
    const channel = getChannel(channelName);
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
      leaveChannel(channelName);
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

  const gamemasterUserId = round.gamemasterUserId ?? round.ownerUserId;
  const gamemasterName =
    round.players.find(p => p.kind === 'user' && p.userId === gamemasterUserId)?.displayName ?? 'Owner';

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
    <div className="space-y-6 max-w-2xl sm:space-y-8">
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-neutral-700 bg-neutral-800 p-1 text-sm">
          <button type="button" onClick={() => setView('manage')} className={tabClass(view === 'manage')}>
            Manage Round
          </button>
          <button type="button" onClick={() => setView('grid')} className={tabClass(view === 'grid')}>
            Scorecard
          </button>
          {myPlayer && (
            <button type="button" onClick={() => setView('mine')} className={tabClass(view === 'mine')}>
              My Score
            </button>
          )}
        </div>
      </div>

      {view === 'mine' && myPlayer ? (
        <PlayerScoreEntry round={round} myPlayer={myPlayer} onRoundUpdate={setRound} />
      ) : view === 'grid' ? (
        <ScorecardGrid round={round} canEdit onRoundUpdate={setRound} />
      ) : (
        <>
      <section className="flex flex-wrap items-center justify-between gap-2 rounded border border-neutral-700 bg-neutral-800 p-3">
        <span className="min-w-0 truncate text-sm text-neutral-400">
          Gamemaster: <span className="font-medium text-white">{gamemasterName}</span>
        </span>
        <Button
          variant="outlined"
          size="small"
          startIcon={<SettingsIcon />}
          onClick={() => setShowSettings(true)}
          sx={brandButtonSx}
        >
          Round settings
        </Button>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">Leaderboard</h2>
        <ol className="rounded border border-neutral-700 bg-neutral-800 divide-y divide-neutral-700">
          {leaderboard.map((entry, index) => {
            const medal = !entry.disqualified && entry.holesPlayed > 0 ? medalForRank(index) : null;
            return (
              <li key={entry.playerId} className="flex items-center justify-between gap-3 p-3">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <span className="w-5 shrink-0 text-right text-sm text-neutral-500">
                    {entry.disqualified ? '' : (medal ?? `${index + 1}.`)}
                  </span>
                  <PlayerAvatar
                    userId={entry.userId}
                    displayName={entry.displayName}
                    photoURL={entry.photoURL}
                    color={entry.color}
                  />
                  <span
                    className={`truncate font-medium ${
                      entry.disqualified ? 'text-neutral-500 line-through' : 'text-white'
                    }`}
                  >
                    {entry.displayName}
                  </span>
                  {entry.disqualified && (
                    <span className="shrink-0 rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-400">
                      DQ
                    </span>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono text-white">{entry.total}</div>
                  <div className="whitespace-nowrap text-xs text-neutral-400">
                    {formatOverUnder(entry.overUnder)} · {entry.holesPlayed}/{round.holes.length}
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

        <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
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
                className="flex items-center justify-between gap-2 rounded border border-neutral-700 bg-neutral-800 p-3"
              >
                <span className="flex min-w-0 items-center gap-2 font-medium text-white">
                  <PlayerAvatar
                    userId={player.userId}
                    displayName={player.displayName}
                    photoURL={player.photoURL}
                    color={player.color}
                  />
                  <span className="truncate">{player.displayName}</span>
                </span>
                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
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

      <RoundControlsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        round={round}
        isOwner={isOwner}
        onRoundUpdate={setRound}
      />

      {isLastHole && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 pt-6">
          <div className="min-w-0 flex-1 text-sm text-neutral-400">
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
      )}
        </>
      )}
    </div>
  );
};
