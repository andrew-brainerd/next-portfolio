import Link from 'next/link';

import { getFrisbeeGolfStats } from '@/api/scorebook';
import { formatOverUnder } from '@/utils/frisbeeGolfLeaderboard';
import { PlayerAvatar } from '@/components/scorebook/PlayerAvatar';
import { SCOREBOOK_FRISBEE_GOLF_ROUTE } from 'constants/routes';

const formatNumber = (value: number | null, digits = 1): string => {
  if (value === null) return '—';
  return value.toFixed(digits);
};

export const StatsView = async () => {
  const stats = await getFrisbeeGolfStats();

  if (!stats || stats.roundsPlayed === 0) {
    return (
      <p className="text-neutral-300">
        No completed rounds yet. Once you finish a round you&apos;ll see your numbers here.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-4">
          <div className="text-xs uppercase tracking-wider text-neutral-400">Rounds played</div>
          <div className="text-2xl text-white font-mono mt-1">{stats.roundsPlayed}</div>
        </div>
        <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-4">
          <div className="text-xs uppercase tracking-wider text-neutral-400">Avg score</div>
          <div className="text-2xl text-white font-mono mt-1">{formatNumber(stats.averageScore)}</div>
        </div>
        <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-4">
          <div className="text-xs uppercase tracking-wider text-neutral-400">Avg +/-</div>
          <div className="text-2xl text-white font-mono mt-1">
            {stats.averageOverUnder === null
              ? '—'
              : stats.averageOverUnder > 0
                ? `+${formatNumber(stats.averageOverUnder)}`
                : formatNumber(stats.averageOverUnder)}
          </div>
        </div>
        <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-4">
          <div className="text-xs uppercase tracking-wider text-neutral-400">Best round</div>
          {stats.bestRound ? (
            <Link
              href={`${SCOREBOOK_FRISBEE_GOLF_ROUTE}/${stats.bestRound.roundId}`}
              className="block mt-1 hover:text-brand-300"
            >
              <div className="text-2xl text-white font-mono">
                {stats.bestRound.total}{' '}
                <span className="text-base text-neutral-400">
                  ({formatOverUnder(stats.bestRound.overUnder)})
                </span>
              </div>
              <div className="text-xs text-neutral-400 truncate">{stats.bestRound.name}</div>
            </Link>
          ) : (
            <div className="text-2xl text-neutral-500 font-mono mt-1">—</div>
          )}
        </div>
      </section>

      {stats.headToHead.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Head-to-head</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-neutral-800 text-neutral-300">
                  <th className="px-3 py-2 text-left font-medium border border-neutral-700">Opponent</th>
                  <th className="px-3 py-2 text-center font-medium border border-neutral-700">Rounds</th>
                  <th className="px-3 py-2 text-center font-medium border border-neutral-700">Wins</th>
                  <th className="px-3 py-2 text-center font-medium border border-neutral-700">Losses</th>
                  <th className="px-3 py-2 text-center font-medium border border-neutral-700">Ties</th>
                </tr>
              </thead>
              <tbody>
                {stats.headToHead.map(entry => (
                  <tr key={entry.opponentUserId} className="text-neutral-200">
                    <td className="px-3 py-2 border border-neutral-700">
                      <span className="flex items-center gap-2">
                        <PlayerAvatar
                          userId={entry.opponentUserId}
                          displayName={entry.opponentName}
                          photoURL={entry.opponentPhotoURL}
                          size={20}
                        />
                        {entry.opponentName}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center border border-neutral-700 font-mono">
                      {entry.sharedRounds}
                    </td>
                    <td className="px-3 py-2 text-center border border-neutral-700 font-mono text-emerald-400">
                      {entry.wins}
                    </td>
                    <td className="px-3 py-2 text-center border border-neutral-700 font-mono text-amber-400">
                      {entry.losses}
                    </td>
                    <td className="px-3 py-2 text-center border border-neutral-700 font-mono">{entry.ties}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
