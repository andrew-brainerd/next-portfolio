'use client';

import { useEffect, useId, useState } from 'react';

import { useGuideMe } from '@/hooks/useGuideMe';
import type { SeatMatch, SeatingTable } from '@/types/wedding';
import { searchGuests } from '@/utils/guestSearch';
import { seatLabel } from '@/utils/weddingGuide';
import { GuideSection } from '../GuideSection';

interface TableCardProps {
  table: SeatingTable;
  highlight?: string;
}

const TableCard = ({ table, highlight }: TableCardProps) => (
  <div className="rounded-lg border border-[var(--sb-gold)] bg-[var(--sb-cream)]/60 p-4">
    <h3 className="font-garamond text-xl text-[var(--sb-crimson)]">{table.name}</h3>
    {table.description && <p className="font-garamond italic opacity-80">{table.description}</p>}
    <ul className="mt-3 space-y-2">
      {table.guests.map((guest, index) => {
        const label = seatLabel(guest);
        const isHighlighted = label === highlight;
        return (
          <li
            key={`${label}-${index}`}
            className={`rounded-md px-2 py-1 ${isHighlighted ? 'bg-[var(--sb-gold)]/30 ring-1 ring-[var(--sb-gold)]' : ''}`}
          >
            <p className="font-semibold">
              {label}
              {isHighlighted && <span className="ml-2 text-xs font-normal text-[var(--sb-crimson)]">(you)</span>}
            </p>
            {guest.blurb && <p className="text-sm opacity-80">{guest.blurb}</p>}
          </li>
        );
      })}
    </ul>
  </div>
);

interface SeatingSectionProps {
  tables: SeatingTable[];
  initialTableId?: string;
}

export const SeatingSection = ({ tables, initialTableId }: SeatingSectionProps) => {
  const inputId = useId();
  const [me, setMe] = useGuideMe();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<SeatMatch | undefined>();
  const [openTableId, setOpenTableId] = useState(
    tables.some(table => table.id === initialTableId) ? initialTableId : undefined
  );

  // A table-card tag lands here via ?table= — bring the section into view
  useEffect(() => {
    if (initialTableId && tables.some(table => table.id === initialTableId)) {
      document.getElementById('seating')?.scrollIntoView({ block: 'start' });
    }
  }, [initialTableId, tables]);

  const results = searchGuests(tables, query);
  const shownTableId = openTableId ?? me?.tableId;
  const shownTable = tables.find(table => table.id === shownTableId);
  const highlight = picked?.tableId === shownTableId ? picked?.label : me?.tableId === shownTableId ? me?.name : undefined;

  const pick = (match: SeatMatch) => {
    setPicked(match);
    setOpenTableId(match.tableId);
    setQuery('');
  };

  return (
    <GuideSection id="seating" title="Your seat">
      <label htmlFor={inputId} className="block font-garamond text-base">
        Find your name
      </label>
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={event => setQuery(event.target.value)}
        autoComplete="off"
        placeholder="Start typing your name"
        className="mt-1 w-full rounded-lg border border-[var(--sb-gold)] bg-[var(--sb-white)] px-4 py-3 text-base focus:border-[var(--sb-crimson)] focus:outline-none"
      />

      {query.trim().length >= 2 && (
        <div aria-live="polite" className="mt-2">
          {results.length === 0 ? (
            <p className="text-sm opacity-80">Can&apos;t find yourself? Ask anyone in the wedding party.</p>
          ) : (
            <ul className="divide-y divide-[var(--sb-gold)]/40 rounded-lg border border-[var(--sb-gold)]/60">
              {results.map(match => (
                <li key={`${match.tableId}-${match.guestIndex}`}>
                  <button
                    type="button"
                    onClick={() => pick(match)}
                    className="flex min-h-11 w-full items-center justify-between px-4 py-2 text-left"
                  >
                    <span>{match.label}</span>
                    <span className="font-garamond text-[var(--sb-crimson)]">{match.tableName} →</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {shownTable && (
        <div className="mt-4 space-y-3">
          <TableCard table={shownTable} highlight={highlight} />
          {picked && picked.tableId === shownTable.id && me?.name !== picked.label && (
            <button
              type="button"
              onClick={() => setMe({ tableId: picked.tableId, name: picked.label })}
              className="min-h-11 w-full rounded-lg bg-[var(--sb-crimson)] px-4 py-2 font-garamond text-lg text-[var(--sb-white)]"
            >
              This is me — remember my table
            </button>
          )}
          {me && me.tableId === shownTable.id && !picked && (
            <button
              type="button"
              onClick={() => setMe(undefined)}
              className="text-sm text-[var(--sb-crimson)] underline underline-offset-4"
            >
              Not {me.name}?
            </button>
          )}
        </div>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer font-garamond text-[var(--sb-crimson)]">Browse all tables</summary>
        <ul className="mt-2 flex flex-wrap gap-2">
          {tables.map(table => (
            <li key={table.id}>
              <button
                type="button"
                onClick={() => {
                  setPicked(undefined);
                  setOpenTableId(table.id);
                }}
                aria-pressed={table.id === shownTableId}
                className="min-h-11 rounded-full border border-[var(--sb-gold)] px-4 font-garamond aria-pressed:bg-[var(--sb-gold)]/30"
              >
                {table.name}
              </button>
            </li>
          ))}
        </ul>
      </details>
    </GuideSection>
  );
};
