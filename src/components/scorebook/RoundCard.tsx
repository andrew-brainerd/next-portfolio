import Link from 'next/link';

import type { FrisbeeGolfRound } from '@/types/scorebook';
import { SCOREBOOK_FRISBEE_GOLF_ROUTE } from 'constants/routes';

interface RoundCardProps {
  round: FrisbeeGolfRound;
}

const STATUS_LABEL: Record<FrisbeeGolfRound['status'], string> = {
  setup: 'Setup',
  active: 'In progress',
  completed: 'Completed'
};

const STATUS_CLASS: Record<FrisbeeGolfRound['status'], string> = {
  setup: 'bg-yellow-700 text-yellow-100',
  active: 'bg-green-700 text-green-100',
  completed: 'bg-neutral-700 text-neutral-300'
};

export const RoundCard = ({ round }: RoundCardProps) => {
  return (
    <Link
      href={`${SCOREBOOK_FRISBEE_GOLF_ROUTE}/${round.id}`}
      className="block rounded-lg border border-neutral-700 bg-neutral-800 p-5 transition hover:border-brand-500 hover:bg-neutral-700"
    >
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xl font-semibold text-white">{round.name}</h2>
        <span className={`text-xs uppercase tracking-wider px-2 py-1 rounded ${STATUS_CLASS[round.status]}`}>
          {STATUS_LABEL[round.status]}
        </span>
      </div>
      <p className="text-sm text-neutral-300">
        {round.holes.length} holes · {round.players.length} player{round.players.length === 1 ? '' : 's'}
      </p>
      <p className="text-xs text-neutral-500 mt-2">{new Date(round.createdAt).toLocaleDateString()}</p>
    </Link>
  );
};
