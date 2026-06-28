'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';

import {
  addFrisbeeGolfPlayer,
  lookupFrisbeeGolfUser,
  removeFrisbeeGolfPlayer,
  startFrisbeeGolfRound,
  updateFrisbeeGolfHoles,
  updateFrisbeeGolfRoundName,
  type FrisbeeGolfUserLookup
} from '@/api/scorebook';
import { SCOREBOOK_FRISBEE_GOLF_ROUTE } from 'constants/routes';
import { darkFieldSx } from '@/components/scorebook/fieldStyles';
import type { FrisbeeGolfRound } from '@/types/scorebook';

interface RoundSetupProps {
  initialRound: FrisbeeGolfRound;
}

export const RoundSetup = ({ initialRound }: RoundSetupProps) => {
  const router = useRouter();
  const [round, setRound] = useState(initialRound);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [nameDraft, setNameDraft] = useState(round.name);
  const nameDirty = nameDraft.trim() !== round.name;

  const [parDrafts, setParDrafts] = useState<Record<number, number>>(
    () => Object.fromEntries(round.holes.map(h => [h.number, h.par]))
  );
  const parDirty = useMemo(
    () => round.holes.some(h => parDrafts[h.number] !== h.par),
    [round.holes, parDrafts]
  );

  const [emailDraft, setEmailDraft] = useState('');
  const [lookupResult, setLookupResult] = useState<FrisbeeGolfUserLookup | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupPending, setLookupPending] = useState(false);

  const [guestDraft, setGuestDraft] = useState('');

  const runAction = async (action: () => Promise<FrisbeeGolfRound | undefined>) => {
    setPending(true);
    setError(null);
    try {
      const updated = await action();
      if (updated) setRound(updated);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  };

  const handleSaveName = () => runAction(() => updateFrisbeeGolfRoundName(round.id, nameDraft.trim()));

  const handleSavePars = () => {
    const nextHoles = round.holes.map(h => ({ ...h, par: Math.max(1, parDrafts[h.number] || h.par) }));
    return runAction(() => updateFrisbeeGolfHoles(round.id, nextHoles));
  };

  const handleLookup = async () => {
    setLookupError(null);
    setLookupResult(null);
    const email = emailDraft.trim();
    if (!email) {
      setLookupError('Enter an email');
      return;
    }
    setLookupPending(true);
    try {
      const result = await lookupFrisbeeGolfUser(email);
      if (!result) {
        setLookupError('No account with that email');
      } else {
        setLookupResult(result);
      }
    } catch {
      setLookupError('Lookup failed');
    } finally {
      setLookupPending(false);
    }
  };

  const handleAddLookedUpUser = async () => {
    if (!lookupResult) return;
    await runAction(() =>
      addFrisbeeGolfPlayer(round.id, {
        kind: 'user',
        userId: lookupResult.uid,
        displayName: lookupResult.displayName
      })
    );
    setEmailDraft('');
    setLookupResult(null);
  };

  const handleAddGuest = async () => {
    const name = guestDraft.trim();
    if (!name) return;
    await runAction(() => addFrisbeeGolfPlayer(round.id, { kind: 'guest', displayName: name }));
    setGuestDraft('');
  };

  const handleRemovePlayer = async (playerId: string) => {
    setPending(true);
    setError(null);
    try {
      await removeFrisbeeGolfPlayer(round.id, playerId);
      setRound(r => ({
        ...r,
        players: r.players.filter(p => p.id !== playerId)
      }));
    } catch (err) {
      console.error(err);
      setError('Could not remove player');
    } finally {
      setPending(false);
    }
  };

  const handleStart = async () => {
    setPending(true);
    setError(null);
    try {
      const started = await startFrisbeeGolfRound(round.id);
      setRound(started);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Could not start round');
      setPending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <section>
        <h2 className="text-xl font-semibold text-white mb-2">Name</h2>
        <div className="flex items-center gap-2">
          <TextField
            value={nameDraft}
            onChange={e => setNameDraft(e.target.value)}
            size="small"
            fullWidth
            disabled={pending}
            sx={darkFieldSx}
          />
          <Button variant="outlined" disabled={!nameDirty || pending} onClick={handleSaveName}>
            Save
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-2">Holes</h2>
        <ul className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2">
          {round.holes.map(hole => (
            <li key={hole.number} className="rounded border border-neutral-700 bg-neutral-800 p-2 text-center">
              <div className="text-xs text-neutral-400 mb-1">Hole {hole.number}</div>
              <TextField
                type="number"
                value={parDrafts[hole.number] ?? hole.par}
                onChange={e =>
                  setParDrafts(prev => ({ ...prev, [hole.number]: Math.max(1, Number(e.target.value) || 1) }))
                }
                size="small"
                slotProps={{ htmlInput: { min: 1, style: { textAlign: 'center' } } }}
                disabled={pending}
                sx={darkFieldSx}
              />
            </li>
          ))}
        </ul>
        {parDirty && (
          <Button variant="outlined" onClick={handleSavePars} disabled={pending} sx={{ mt: 2 }}>
            Save par changes
          </Button>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-2">Players</h2>
        <ul className="space-y-2 mb-4">
          {round.players.map(player => {
            const isOwner = player.userId === round.ownerUserId;
            return (
              <li
                key={player.id}
                className="flex items-center justify-between rounded border border-neutral-700 bg-neutral-800 p-2"
              >
                <div>
                  <span className="text-white">{player.displayName}</span>
                  <span className="text-xs text-neutral-500 ml-2">
                    {isOwner ? 'owner' : player.kind}
                  </span>
                </div>
                {!isOwner && (
                  <IconButton
                    aria-label={`Remove ${player.displayName}`}
                    onClick={() => handleRemovePlayer(player.id)}
                    disabled={pending}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </li>
            );
          })}
        </ul>

        <div className="space-y-4">
          <div className="rounded border border-neutral-700 bg-neutral-800 p-3">
            <h3 className="text-sm font-semibold text-neutral-300 mb-2">Invite by email</h3>
            <div className="flex flex-wrap items-center gap-2">
              <TextField
                value={emailDraft}
                onChange={e => {
                  setEmailDraft(e.target.value);
                  setLookupResult(null);
                  setLookupError(null);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleLookup();
                }}
                size="small"
                placeholder="player@example.com"
                disabled={pending || lookupPending}
                sx={darkFieldSx}
              />
              <Button variant="outlined" onClick={handleLookup} disabled={pending || lookupPending}>
                {lookupPending ? 'Looking up...' : 'Look up'}
              </Button>
            </div>
            {lookupError && <p className="text-sm text-red-400 mt-2">{lookupError}</p>}
            {lookupResult && (
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-neutral-300">
                  Found <span className="text-white">{lookupResult.displayName}</span>{' '}
                  <span className="text-neutral-500">({lookupResult.email})</span>
                </p>
                <Button variant="contained" size="small" onClick={handleAddLookedUpUser} disabled={pending}>
                  Add
                </Button>
              </div>
            )}
          </div>

          <div className="rounded border border-neutral-700 bg-neutral-800 p-3">
            <h3 className="text-sm font-semibold text-neutral-300 mb-2">Add a guest</h3>
            <div className="flex items-center gap-2">
              <TextField
                value={guestDraft}
                onChange={e => setGuestDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddGuest();
                }}
                size="small"
                placeholder="Guest name"
                disabled={pending}
                sx={darkFieldSx}
              />
              <Button variant="outlined" onClick={handleAddGuest} disabled={pending || !guestDraft.trim()}>
                Add guest
              </Button>
            </div>
          </div>
        </div>
      </section>

      {error && <Alert severity="error">{error}</Alert>}

      <div className="flex gap-2">
        <Button
          variant="contained"
          onClick={handleStart}
          disabled={pending || round.players.length === 0}
          sx={{
            backgroundColor: 'var(--color-brand-600)',
            '&:hover': { backgroundColor: 'var(--color-brand-700)' }
          }}
        >
          {pending ? 'Working...' : 'Start round'}
        </Button>
        <Button
          variant="text"
          onClick={() => {
            router.push(SCOREBOOK_FRISBEE_GOLF_ROUTE);
            router.refresh();
          }}
          disabled={pending}
        >
          Back to rounds
        </Button>
      </div>
    </div>
  );
};
