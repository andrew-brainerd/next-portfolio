'use client';

import { useState } from 'react';

import type { WeddingQuizEntry } from '@/types/wedding';
import { deleteWeddingQuizEntry } from '@/api/wedding';

interface QuizEntriesAdminProps {
  initialEntries: WeddingQuizEntry[];
}

export const QuizEntriesAdmin = ({ initialEntries }: QuizEntriesAdminProps) => {
  const [entries, setEntries] = useState(initialEntries);
  const counting = entries.filter(entry => entry.eligible);
  const practice = entries.filter(entry => !entry.eligible);

  const remove = async (entry: WeddingQuizEntry) => {
    if (!entry.id || !window.confirm(`Remove ${entry.name}'s quiz entry?`)) return;
    await deleteWeddingQuizEntry(entry.id);
    setEntries(current => current.filter(existing => existing.id !== entry.id));
  };

  const renderEntry = (entry: WeddingQuizEntry, rank?: number) => (
    <li key={entry.id ?? entry.clientId} className="flex items-center justify-between gap-3 text-sm text-neutral-200">
      <span>
        {rank !== undefined && <span className="mr-2 font-mono text-neutral-500">#{rank}</span>}
        {entry.name}
        <span className="ml-2 font-mono text-neutral-400">
          {entry.score}/{entry.total}
        </span>
        <span className="ml-2 text-xs text-neutral-500">
          {new Date(entry.submittedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </span>
      </span>
      <button
        type="button"
        onClick={() => remove(entry)}
        aria-label={`Remove ${entry.name}'s entry`}
        className="rounded border border-neutral-700 px-2 py-1 text-xs text-neutral-300 transition-colors hover:border-warning-700 hover:text-warning-100"
      >
        ✕
      </button>
    </li>
  );

  return (
    <section className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-5">
      <h2 className="text-lg font-semibold text-neutral-100">Quiz entries</h2>
      <p className="mt-1 text-sm text-neutral-400">
        {counting.length} official · {practice.length} practice
      </p>
      <div className="mt-4 space-y-4">
        {counting.length === 0 ? (
          <p className="text-sm text-neutral-500">No official entries yet.</p>
        ) : (
          <ol className="space-y-1">{counting.map((entry, index) => renderEntry(entry, index + 1))}</ol>
        )}
        {practice.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Practice runs</h3>
            <ul className="mt-1 space-y-1">{practice.map(entry => renderEntry(entry))}</ul>
          </div>
        )}
      </div>
    </section>
  );
};
