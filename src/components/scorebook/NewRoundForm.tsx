'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { createFrisbeeGolfRound } from '@/api/scorebook';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { SCOREBOOK_FRISBEE_GOLF_ROUTE } from 'constants/routes';
import { darkFieldSx } from '@/components/scorebook/fieldStyles';
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
  const [guestNames, setGuestNames] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ownerName = user?.displayName || user?.email || 'You';

  const updateGuest = (index: number, value: string) => {
    setGuestNames(prev => prev.map((n, i) => (i === index ? value : n)));
  };

  const addGuest = () => setGuestNames(prev => [...prev, '']);
  const removeGuest = (index: number) => setGuestNames(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!user) return;
    setError(null);

    const trimmedGuests = guestNames.map(n => n.trim()).filter(Boolean);

    const input: CreateFrisbeeGolfRoundInput = {
      name: name.trim() || undefined,
      holeCount,
      defaultPar,
      players: [
        { kind: 'user', userId: user.uid, displayName: ownerName },
        ...trimmedGuests.map(guestName => ({ kind: 'guest' as const, displayName: guestName }))
      ]
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
    <div className="max-w-xl space-y-6">
      <div>
        <TextField
          label="Round name (optional)"
          value={name}
          onChange={e => setName(e.target.value)}
          fullWidth
          size="small"
          placeholder="e.g. 4th of July 2026"
          disabled={submitting}
          sx={darkFieldSx}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Holes"
          type="number"
          value={holeCount}
          onChange={e => setHoleCount(Math.max(1, Math.min(MAX_HOLES, Number(e.target.value) || 1)))}
          size="small"
          slotProps={{ htmlInput: { min: 1, max: MAX_HOLES } }}
          disabled={submitting}
          sx={darkFieldSx}
        />
        <TextField
          label="Default par"
          type="number"
          value={defaultPar}
          onChange={e => setDefaultPar(Math.max(1, Number(e.target.value) || 1))}
          size="small"
          slotProps={{ htmlInput: { min: 1 } }}
          disabled={submitting}
          sx={darkFieldSx}
        />
      </div>

      <section>
        <h3 className="text-white font-semibold mb-2">Players</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <TextField value={ownerName} disabled fullWidth size="small" label="You" sx={darkFieldSx} />
          </li>
          {guestNames.map((guestName, index) => (
            <li key={index} className="flex items-center gap-2">
              <TextField
                value={guestName}
                onChange={e => updateGuest(index, e.target.value)}
                fullWidth
                size="small"
                label={`Guest ${index + 1}`}
                placeholder="Name"
                disabled={submitting}
                sx={darkFieldSx}
              />
              <IconButton
                aria-label="Remove guest"
                onClick={() => removeGuest(index)}
                disabled={submitting || guestNames.length === 1}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </li>
          ))}
        </ul>
        <Button startIcon={<AddIcon />} onClick={addGuest} disabled={submitting} sx={{ mt: 1 }}>
          Add player
        </Button>
      </section>

      {error && <Alert severity="error">{error}</Alert>}

      <div className="flex gap-2">
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !user}
          sx={{
            backgroundColor: 'var(--color-brand-600)',
            '&:hover': { backgroundColor: 'var(--color-brand-700)' }
          }}
        >
          {submitting ? 'Creating...' : 'Create round'}
        </Button>
        <Button variant="text" onClick={() => router.back()} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
