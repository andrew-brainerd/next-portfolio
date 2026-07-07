'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { createPantry, listPantries } from '@/api/oishii';
import { OISHII_ROUTE } from '@/constants/routes';
import { brandContainedButtonSx, lightFieldSx } from '@/components/scorebook/fieldStyles';
import type { Pantry } from '@/types/oishii';

interface PantryListProps {
  initialPantries: Pantry[];
}

export const PantryList = ({ initialPantries }: PantryListProps) => {
  const router = useRouter();
  const [pantries, setPantries] = useState(initialPantries);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    try {
      await createPantry(trimmed);
      setName('');
      setPantries(await listPantries());
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Could not create pantry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="max-w-xl rounded-xl border border-brand-200 bg-white p-6 text-neutral-900 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-neutral-900">New pantry</h2>
        <div className="flex items-center gap-2">
          <TextField
            label="Pantry name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreate();
            }}
            size="small"
            fullWidth
            placeholder="e.g. Home kitchen"
            disabled={submitting}
            sx={lightFieldSx}
          />
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={submitting || !name.trim()}
            sx={brandContainedButtonSx}
          >
            {submitting ? 'Creating...' : 'Create'}
          </Button>
        </div>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </section>

      {pantries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-700 p-10 text-center">
          <p className="text-neutral-300">No pantries yet. Create one above to get started.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pantries.map(pantry => (
            <li key={pantry.id}>
              <Link
                href={`${OISHII_ROUTE}/${pantry.id}`}
                className="block h-full rounded-lg border border-neutral-700 bg-neutral-800 p-5 transition hover:border-brand-500 hover:bg-neutral-700"
              >
                <h2 className="mb-2 text-xl font-semibold text-white">{pantry.name}</h2>
                <p className="text-sm text-neutral-300">
                  {pantry.memberUserIds.length} member{pantry.memberUserIds.length === 1 ? '' : 's'}
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  Updated {new Date(pantry.updatedAt).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
