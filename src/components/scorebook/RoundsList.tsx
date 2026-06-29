import { listFrisbeeGolfRounds } from '@/api/scorebook';
import { RoundCard } from 'components/scorebook/RoundCard';

export const RoundsList = async () => {
  const rounds = await listFrisbeeGolfRounds();

  const active = rounds.filter(r => r.status !== 'completed');
  const completed = rounds.filter(r => r.status === 'completed');

  if (rounds.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-700 p-10 text-center">
        <p className="text-neutral-300">No rounds yet. Start one with “New round” above.</p>
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
