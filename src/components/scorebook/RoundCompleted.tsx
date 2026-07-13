'use client';

import { useEffect, useState } from 'react';

import { computeLeaderboard, formatOverUnder, medalForRank } from '@/utils/frisbeeGolfLeaderboard';
import { getFrisbeeGolfRound, setFrisbeeGolfDisqualified } from '@/api/scorebook';
import { useFrisbeeGolfRoundSync } from '@/hooks/useFrisbeeGolfRoundSync';
import { Modal } from '@/components/peapod/Modal';
import { PlayerAvatar } from '@/components/scorebook/PlayerAvatar';
import type { FrisbeeGolfRound } from '@/types/scorebook';

interface RoundCompletedProps {
  round: FrisbeeGolfRound;
  // Owner/gamemaster may still disqualify (or reinstate) players after completion.
  canControl: boolean;
}

export const RoundCompleted = ({ round: initialRound, canControl }: RoundCompletedProps) => {
  const [round, setRound] = useState(initialRound);
  const [pending, setPending] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');

  useFrisbeeGolfRoundSync(initialRound.id, setRound);

  const leaderboard = computeLeaderboard(round);
  const completedDate = round.completedAt ? new Date(round.completedAt).toLocaleDateString() : null;

  const selectedPlayer = round.players.find(p => p.id === selectedPlayerId);
  const selectedDisqualified = selectedPlayer ? round.disqualifiedPlayerIds.includes(selectedPlayer.id) : false;

  const handleToggleDisqualified = async (playerId: string, disqualified: boolean) => {
    setPending(true);
    try {
      const updated = await setFrisbeeGolfDisqualified(round.id, playerId, disqualified);
      if (updated) setRound(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {completedDate && <p className="text-sm text-neutral-400">Completed {completedDate}</p>}
        {canControl && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-lg border border-neutral-700 bg-neutral-900/50 px-4 py-2 text-sm text-neutral-200 transition-colors hover:bg-neutral-800"
          >
            Modify Results
          </button>
        )}
      </div>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">Final standings</h2>
        <ol className="rounded border border-neutral-700 bg-neutral-800 divide-y divide-neutral-700">
          {leaderboard.map((entry, index) => {
            const isWinner = index === 0 && entry.holesPlayed > 0 && !entry.disqualified;
            const medal = !entry.disqualified && entry.holesPlayed > 0 ? medalForRank(index) : null;
            return (
              <li
                key={entry.playerId}
                className={`flex items-center justify-between gap-2 p-3 ${isWinner ? 'bg-brand-900/40' : ''}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-6 text-right text-neutral-500">
                    {entry.disqualified ? '' : (medal ?? `${index + 1}.`)}
                  </span>
                  <span
                    className={`flex items-center gap-2 font-medium ${
                      isWinner ? 'text-brand-300' : entry.disqualified ? 'text-neutral-500 line-through' : 'text-white'
                    }`}
                  >
                    <PlayerAvatar
                      userId={entry.userId}
                      displayName={entry.displayName}
                      photoURL={entry.photoURL}
                      color={entry.color}
                    />
                    {entry.displayName}
                  </span>
                  {entry.disqualified && (
                    <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-400">
                      DQ
                    </span>
                  )}
                  {isWinner && <span className="text-xs uppercase tracking-wider text-brand-400">Winner</span>}
                </div>
                <div className="shrink-0 text-right">
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
        <h2 className="text-xl font-semibold text-white mb-3">Scorecard</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-800 text-neutral-300">
                <th className="sticky left-0 bg-neutral-800 px-3 py-2 text-left font-medium border border-neutral-700">
                  Player
                </th>
                {round.holes.map(hole => (
                  <th key={hole.number} className="px-3 py-2 text-center border border-neutral-700">
                    <div>{hole.number}</div>
                    <div className="text-xs text-neutral-500">Par {hole.par}</div>
                  </th>
                ))}
                <th className="px-3 py-2 text-center border border-neutral-700">Total</th>
                <th className="px-3 py-2 text-center border border-neutral-700">+/-</th>
              </tr>
            </thead>
            <tbody>
              {round.players.map(player => {
                const playerScores = round.scores[player.id] || {};
                const totals = computeLeaderboard({
                  holes: round.holes,
                  players: [player],
                  scores: { [player.id]: playerScores }
                })[0];
                const disqualified = round.disqualifiedPlayerIds.includes(player.id);
                return (
                  <tr key={player.id} className="text-neutral-200">
                    <td className="sticky left-0 bg-neutral-900 px-3 py-2 font-medium border border-neutral-700">
                      <span className="flex items-center gap-2">
                        <PlayerAvatar
                          userId={player.userId}
                          displayName={player.displayName}
                          photoURL={player.photoURL}
                          color={player.color}
                          size={20}
                        />
                        <span className={disqualified ? 'text-neutral-500 line-through' : ''}>{player.displayName}</span>
                        {disqualified && (
                          <span className="rounded bg-red-500/20 px-1 text-[9px] font-semibold uppercase text-red-400">
                            DQ
                          </span>
                        )}
                      </span>
                    </td>
                    {round.holes.map(hole => {
                      const score = playerScores[hole.number];
                      const diff = typeof score === 'number' ? score - hole.par : null;
                      const tone =
                        diff === null
                          ? 'text-neutral-600'
                          : diff < 0
                            ? 'text-emerald-400'
                            : diff > 0
                              ? 'text-amber-400'
                              : 'text-neutral-200';
                      return (
                        <td
                          key={hole.number}
                          className={`px-3 py-2 text-center border border-neutral-700 font-mono ${tone}`}
                        >
                          {typeof score === 'number' ? score : '—'}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center border border-neutral-700 font-mono">
                      {totals.holesPlayed > 0 ? totals.total : '—'}
                    </td>
                    <td className="px-3 py-2 text-center border border-neutral-700 font-mono">
                      {totals.holesPlayed > 0 ? formatOverUnder(totals.overUnder) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-900 p-6 shadow-xl">
          <h3 className="font-oswald text-xl uppercase tracking-wide text-neutral-100">Modify results</h3>
          <p className="mt-1 text-sm text-neutral-400">
            Disqualify or reinstate a player. Disqualified players drop out of the standings and winner, and are
            excluded from stats.
          </p>

          <label htmlFor="dq-player" className="mt-4 block text-sm text-neutral-300">
            Player
          </label>
          <select
            id="dq-player"
            value={selectedPlayerId}
            onChange={e => setSelectedPlayerId(e.target.value)}
            className="mt-1 w-full rounded border border-neutral-700 bg-neutral-950/50 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
          >
            <option value="">Select a player…</option>
            {round.players.map(player => {
              const disqualified = round.disqualifiedPlayerIds.includes(player.id);
              return (
                <option key={player.id} value={player.id}>
                  {player.displayName}
                  {disqualified ? ' — disqualified' : ''}
                </option>
              );
            })}
          </select>

          {selectedPlayer && (
            <button
              type="button"
              onClick={() => handleToggleDisqualified(selectedPlayer.id, !selectedDisqualified)}
              disabled={pending}
              className={`mt-4 w-full rounded-lg px-4 py-2 font-medium text-white transition-colors disabled:opacity-50 ${
                selectedDisqualified ? 'bg-brand-600 hover:bg-brand-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {pending
                ? 'Saving…'
                : selectedDisqualified
                  ? `Reinstate ${selectedPlayer.displayName}`
                  : `Disqualify ${selectedPlayer.displayName}`}
            </button>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
