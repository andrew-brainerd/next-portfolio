import Link from 'next/link';

import { listFrisbeeGolfRounds } from '@/api/scorebook';
import { SCOREBOOK_FRISBEE_GOLF_NEW_ROUTE } from 'constants/routes';
import { RoundCard } from 'components/scorebook/RoundCard';

export const RoundsList = async () => {
  const rounds = await listFrisbeeGolfRounds();

  const active = rounds.filter(r => r.status !== 'completed');
  const completed = rounds.filter(r => r.status === 'completed');

  if (rounds.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-700 p-10 text-center">
        <p className="text-neutral-300 mb-4">No rounds yet.</p>
        <Link
          href={SCOREBOOK_FRISBEE_GOLF_NEW_ROUTE}
          className="inline-block bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded transition-colors"
        >
          Start your first round
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {active.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Active</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {active.map(round => (
              <li key={round.id}>
                <RoundCard round={round} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Completed</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map(round => (
              <li key={round.id}>
                <RoundCard round={round} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
