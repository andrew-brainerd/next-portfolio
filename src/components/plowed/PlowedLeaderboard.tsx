import type { PlowedScoreEntry } from '@/types/plowed';

interface PlowedLeaderboardProps {
  scores: PlowedScoreEntry[] | null;
  failed: boolean;
  highlightRank?: number | null;
  limit?: number;
}

export const PlowedLeaderboard = ({ scores, failed, highlightRank = null, limit = 10 }: PlowedLeaderboardProps) => {
  if (failed) return <p className="text-xs text-neutral-400">Leaderboard unavailable</p>;
  if (!scores) return <p className="text-xs text-neutral-400">Loading leaderboard…</p>;
  if (scores.length === 0) return <p className="text-xs text-neutral-400">No scores yet. Be the first!</p>;

  return (
    <div className="w-full max-w-60">
      <p className="mb-1 font-mono text-xs uppercase tracking-widest text-neutral-400">Top shovelers</p>
      <ol className="font-mono text-sm tabular-nums">
        {scores.slice(0, limit).map((entry, index) => (
          <li
            key={`${entry.initials}-${entry.createdAt}-${index}`}
            className={`flex justify-between gap-3 px-1 ${
              highlightRank === index + 1 ? 'rounded bg-amber-300/20 text-amber-200' : 'text-neutral-200'
            }`}
          >
            <span className="w-6 text-right text-neutral-400">{index + 1}</span>
            <span className="tracking-widest">{entry.initials}</span>
            <span className="flex-1 text-right">{entry.score.toLocaleString()}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};
