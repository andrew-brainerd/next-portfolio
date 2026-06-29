'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { createFrisbeeGolfRound } from '@/api/scorebook';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { SCOREBOOK_FRISBEE_GOLF_ROUTE } from 'constants/routes';
import { lightFieldSx, brandContainedButtonSx } from '@/components/scorebook/fieldStyles';
import { NumberInput } from '@/components/scorebook/NumberInput';
import type { CreateFrisbeeGolfRoundInput } from '@/types/scorebook';

const DEFAULT_HOLE_COUNT = 9;
const DEFAULT_PAR = 3;
const MAX_HOLES = 27;

export const NewRoundForm = () => {
  const router = useRouter();
  const { user, ready } = useFirebaseUser();

  const [name, setName] = useState('');
  const [holeCount, setHoleCount] = useState(DEFAULT_HOLE_COUNT);
  const [defaultPar, setDefaultPar] = useState(DEFAULT_PAR);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default to the account name; once the user edits, their override sticks.
  const defaultName = user?.displayName || user?.email || '';
  const [nicknameInput, setNicknameInput] = useState<string | null>(null);
  const nickname = nicknameInput ?? defaultName;

  const handleSubmit = async () => {
    if (!user) return;
    setError(null);

    const ownerName = nickname.trim() || user.displayName || user.email || 'You';
    const input: CreateFrisbeeGolfRoundInput = {
      name: name.trim() || undefined,
      holeCount,
      defaultPar,
      players: [{ kind: 'user', userId: user.uid, displayName: ownerName }]
    };

    setSubmitting(true);
    try {
      await createFrisbeeGolfRound(input);
      router.push(SCOREBOOK_FRISBEE_GOLF_ROUTE);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Could not create round');
      setSubmitting(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="max-w-xl space-y-6 rounded-xl border border-brand-200 bg-white p-6 text-neutral-900 shadow-sm">
      <div>
        <TextField
          label="Round name (optional)"
          value={name}
          onChange={e => setName(e.target.value)}
          fullWidth
          size="small"
          placeholder="e.g. 4th of July 2026"
          disabled={submitting}
          sx={lightFieldSx}
        />
      </div>

      <div>
        <TextField
          label="Your nickname"
          value={nickname}
          onChange={e => setNicknameInput(e.target.value)}
          fullWidth
          size="small"
          placeholder="The name others will see"
          disabled={submitting}
          sx={lightFieldSx}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-neutral-600">Holes</label>
          <NumberInput
            value={holeCount}
            onChange={setHoleCount}
            min={1}
            max={MAX_HOLES}
            disabled={submitting}
            fullWidth
            ariaLabel="Holes"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-600">Default par</label>
          <NumberInput
            value={defaultPar}
            onChange={setDefaultPar}
            min={1}
            max={9}
            disabled={submitting}
            fullWidth
            ariaLabel="Default par"
          />
        </div>
      </div>

      <p className="text-sm text-neutral-500">
        It’s just you for now — others join from the invite link or code once the round is created.
      </p>

      {error && <Alert severity="error">{error}</Alert>}

      <div className="flex gap-2">
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !user}
          sx={brandContainedButtonSx}
        >
          {submitting ? 'Creating...' : 'Create round'}
        </Button>
        <Button
          variant="text"
          onClick={() => router.back()}
          disabled={submitting}
          sx={{ color: 'var(--color-brand-700)' }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
