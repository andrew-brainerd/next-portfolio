'use client';

import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';

import { removeItem, updateItem } from '@/api/oishii';
import type { PantryDetail, PantryItem } from '@/types/oishii';

interface ItemGridProps {
  pantry: PantryDetail;
  onChanged: () => void | Promise<void>;
}

const SOURCE_LABEL: Record<PantryItem['source'], string> = {
  'manual': 'Manual',
  'instacart-scan': 'Instacart scan'
};

const SOURCE_CLASS: Record<PantryItem['source'], string> = {
  'manual': 'bg-neutral-700 text-neutral-200',
  'instacart-scan': 'bg-brand-700 text-brand-100'
};

export const ItemGrid = ({ pantry, onChanged }: ItemGridProps) => {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const memberName = (userId: string) =>
    pantry.members.find(member => member.userId === userId)?.displayName ?? 'Someone';

  const adjustQuantity = async (item: PantryItem, delta: number) => {
    const next = Math.max(0, item.quantity + delta);
    if (next === item.quantity) return;
    setPendingId(item.id);
    try {
      await updateItem(pantry.id, item.id, { quantity: next });
      await onChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setPendingId(null);
    }
  };

  const handleRemove = async (item: PantryItem) => {
    if (!window.confirm(`Remove “${item.name}” from the pantry?`)) return;
    setPendingId(item.id);
    try {
      await removeItem(pantry.id, item.id);
      await onChanged();
    } catch (err) {
      console.error(err);
      setPendingId(null);
    }
  };

  if (pantry.items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-700 p-10 text-center">
        <p className="text-neutral-300">No items yet. Add the first one above.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {pantry.items.map(item => {
        const isPending = pendingId === item.id;
        return (
          <li
            key={item.id}
            className="flex flex-col justify-between rounded-lg border border-neutral-700 bg-neutral-800 p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-white">{item.name}</h3>
                {item.category && <p className="mt-0.5 text-xs text-neutral-400">{item.category}</p>}
              </div>
              <IconButton
                aria-label={`Remove ${item.name}`}
                onClick={() => handleRemove(item)}
                disabled={isPending}
                size="small"
              >
                <DeleteIcon fontSize="small" sx={{ color: 'var(--color-neutral-400)' }} />
              </IconButton>
            </div>

            <div className="mb-3 flex items-center gap-2">
              <IconButton
                aria-label={`Decrease quantity of ${item.name}`}
                onClick={() => adjustQuantity(item, -1)}
                disabled={isPending || item.quantity <= 0}
                size="small"
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <span className="min-w-[3ch] text-center font-mono text-lg text-white">{item.quantity}</span>
              <IconButton
                aria-label={`Increase quantity of ${item.name}`}
                onClick={() => adjustQuantity(item, 1)}
                disabled={isPending}
                size="small"
              >
                <AddIcon fontSize="small" />
              </IconButton>
              {item.unit && <span className="text-sm text-neutral-400">{item.unit}</span>}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${SOURCE_CLASS[item.source]}`}
              >
                {SOURCE_LABEL[item.source]}
              </span>
              <span className="rounded bg-neutral-700 px-1.5 py-0.5 text-[10px] text-neutral-300">
                Added by {memberName(item.addedByUserId)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
