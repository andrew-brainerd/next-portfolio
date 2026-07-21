'use client';

import type { ReactNode } from 'react';

interface ListEditorProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  makeItem: () => T;
  renderItem: (item: T, update: (item: T) => void, index: number) => ReactNode;
  addLabel: string;
  itemLabel: (index: number) => string;
}

export const ListEditor = <T,>({ items, onChange, makeItem, renderItem, addLabel, itemLabel }: ListEditorProps<T>) => {
  const update = (index: number, item: T) => {
    onChange(items.map((existing, i) => (i === index ? item : existing)));
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-lg border border-neutral-700/70 bg-neutral-950/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-neutral-500">{itemLabel(index)}</p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${itemLabel(index)} up`}
                className="rounded border border-neutral-700 px-2 py-1 text-xs text-neutral-300 transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                aria-label={`Move ${itemLabel(index)} down`}
                className="rounded border border-neutral-700 px-2 py-1 text-xs text-neutral-300 transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`Remove ${itemLabel(index)}`}
                className="rounded border border-neutral-700 px-2 py-1 text-xs text-neutral-300 transition-colors hover:border-warning-700 hover:bg-warning-400/10 hover:text-warning-100"
              >
                ✕
              </button>
            </div>
          </div>
          {renderItem(item, updated => update(index, updated), index)}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, makeItem()])}
        className="rounded-lg border border-dashed border-neutral-600 px-4 py-2 text-sm text-neutral-300 transition-colors hover:border-brand-400 hover:text-neutral-100"
      >
        + {addLabel}
      </button>
    </div>
  );
};
