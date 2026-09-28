'use client';

import { useGuideMe } from '@/hooks/useGuideMe';
import type { SeatingTable } from '@/types/wedding';
import { seatLabel } from '@/utils/weddingGuide';

interface YourTableCardProps {
  tables: SeatingTable[];
}

// Pinned under now/next once the guest has said "This is me"
export const YourTableCard = ({ tables }: YourTableCardProps) => {
  const [me] = useGuideMe();
  const table = me && tables.find(candidate => candidate.id === me.tableId);
  if (!me || !table) return null;

  const tablemates = table.guests.map(seatLabel).filter(label => label && label !== me.name);

  return (
    <a
      href="#seating"
      className="block rounded-xl border-2 border-[var(--sb-gold)] bg-[var(--sb-white)] p-4 shadow-sm"
    >
      <p className="font-garamond text-xs uppercase tracking-[0.3em] text-[var(--sb-crimson)]">Your table</p>
      <p className="font-garamond text-2xl">{table.name}</p>
      {tablemates.length > 0 && (
        <p className="mt-1 text-sm opacity-80">
          With {tablemates.slice(0, 4).join(', ')}
          {tablemates.length > 4 && ` and ${tablemates.length - 4} more`}
        </p>
      )}
    </a>
  );
};
