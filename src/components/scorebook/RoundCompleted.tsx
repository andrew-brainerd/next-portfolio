import { computeLeaderboard, formatOverUnder } from '@/utils/frisbeeGolfLeaderboard';
import type { FrisbeeGolfRound } from '@/types/scorebook';

interface RoundCompletedProps {
  round: FrisbeeGolfRound;
}

export const RoundCompleted = ({ round }: RoundCompletedProps) => {
  const leaderboard = computeLeaderboard(round);
  const completedDate = round.completedAt
    ? new Date(round.completedAt).toLocaleDateString()
    : null;

  return (
    <div className="space-y-8">
      {completedDate && (
        <p className="text-sm text-neutral-400">Completed {completedDate}</p>
      )}

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">Final standings</h2>
        <ol className="rounded border border-neutral-700 bg-neutral-800 divide-y divide-neutral-700">
          {leaderboard.map((entry, index) => {
            const isWinner = index === 0 && entry.holesPlayed > 0;
            return (
              <li
                key={entry.playerId}
                className={`flex items-center justify-between p-3 ${isWinner ? 'bg-brand-900/40' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-neutral-500 w-5 text-right">{index + 1}.</span>
                  <span className={`font-medium ${isWinner ? 'text-brand-300' : 'text-white'}`}>
                    {entry.displayName}
                  </span>
                  {isWinner && <span className="text-xs uppercase tracking-wider text-brand-400">Winner</span>}
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
                return (
                  <tr key={player.id} className="text-neutral-200">
                    <td className="sticky left-0 bg-neutral-900 px-3 py-2 font-medium border border-neutral-700">
                      {player.displayName}
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
    </div>
  );
};
