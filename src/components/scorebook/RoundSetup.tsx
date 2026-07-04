'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';

import {
  addFrisbeeGolfPlayer,
  getFrisbeeGolfFamily,
  getFrisbeeGolfRound,
  removeFrisbeeGolfPlayer,
  setFrisbeeGolfGamemaster,
  startFrisbeeGolfRound,
  updateFrisbeeGolfHoles,
  updateFrisbeeGolfRoundName
} from '@/api/scorebook';
import { SCOREBOOK_FRISBEE_GOLF_ROUTE } from 'constants/routes';
import { getChannel } from '@/utils/pusher';
import { lightFieldSx, brandButtonSx, brandContainedButtonSx } from '@/components/scorebook/fieldStyles';
import { NumberInput } from '@/components/scorebook/NumberInput';
import { PlayerAvatar } from '@/components/scorebook/PlayerAvatar';
import type { FrisbeeGolfFamilyMember, FrisbeeGolfRound } from '@/types/scorebook';

const FRISBEE_GOLF_ROUND_UPDATED = 'frisbeeGolfRoundUpdated';

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

  const [parDrafts, setParDrafts] = useState<Record<number, number>>(() =>
    Object.fromEntries(round.holes.map(h => [h.number, h.par]))
  );
  const parDirty = useMemo(() => round.holes.some(h => parDrafts[h.number] !== h.par), [round.holes, parDrafts]);

  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [family, setFamily] = useState<FrisbeeGolfFamilyMember[]>([]);

  useEffect(() => {
    getFrisbeeGolfFamily()
      .then(setFamily)
      .catch(() => setFamily([]));
  }, []);

  // Family members not already in the round (the owner is already a player).
  const availableFamily = useMemo(
    () => family.filter(member => !round.players.some(p => p.userId === member.userId)),
    [family, round.players]
  );

  // The gamemaster may be the owner (even when they aren't playing) or any user player.
  const userPlayers = round.players.filter(p => p.kind === 'user' && p.userId);
  const gamemasterChoices = userPlayers.some(p => p.userId === round.ownerUserId)
    ? userPlayers
    : [{ id: 'owner', kind: 'user' as const, userId: round.ownerUserId, displayName: 'You' }, ...userPlayers];

  useEffect(() => {
    // Prefer the short link; fall back to the full join URL for legacy rounds with no join code.
    const path = round.joinCode
      ? `/j/${round.joinCode}`
      : `${SCOREBOOK_FRISBEE_GOLF_ROUTE}/${round.id}/join`;
    setInviteUrl(`${window.location.origin}${path}`);
  }, [round.id, round.joinCode]);

  // Live-refresh the roster as people join via the invite link.
  useEffect(() => {
    const channel = getChannel(initialRound.id);
    const refetch = async () => {
      const fresh = await getFrisbeeGolfRound(initialRound.id);
      if (fresh) setRound(fresh);
    };
    channel.bind(FRISBEE_GOLF_ROUND_UPDATED, refetch);
    return () => {
      channel.unbind(FRISBEE_GOLF_ROUND_UPDATED, refetch);
      channel.unsubscribe();
    };
  }, [initialRound.id]);

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy the link. Copy it manually.');
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(round.joinCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setError('Could not copy the code. Copy it manually.');
    }
  };

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

  const handleSetGamemaster = (userId: string) => runAction(() => setFrisbeeGolfGamemaster(round.id, userId));

  const handleAddFamily = (userId: string) => {
    const member = family.find(m => m.userId === userId);
    if (!member) return;
    return runAction(() =>
      addFrisbeeGolfPlayer(round.id, { kind: 'user', userId: member.userId, displayName: member.displayName })
    );
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
    <div className="max-w-2xl space-y-8 rounded-xl border border-brand-200 bg-white p-6 text-neutral-900 shadow-sm">
      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">Name</h2>
        <div className="flex items-center gap-2">
          <TextField
            value={nameDraft}
            onChange={e => setNameDraft(e.target.value)}
            size="small"
            fullWidth
            disabled={pending}
            sx={lightFieldSx}
          />
          <Button variant="outlined" disabled={!nameDirty || pending} onClick={handleSaveName} sx={brandButtonSx}>
            Save
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">Holes</h2>
        <ul className="grid grid-cols-3 gap-2">
          {round.holes.map(hole => (
            <li key={hole.number} className="rounded border border-brand-200 bg-brand-100 p-2 text-center">
              <div className="text-xs text-neutral-500 mb-1">Hole {hole.number}</div>
              <NumberInput
                value={parDrafts[hole.number] ?? hole.par}
                onChange={n => setParDrafts(prev => ({ ...prev, [hole.number]: n }))}
                min={1}
                max={9}
                disabled={pending}
                fullWidth
                ariaLabel={`Par for hole ${hole.number}`}
              />
            </li>
          ))}
        </ul>
        {parDirty && (
          <Button variant="outlined" onClick={handleSavePars} disabled={pending} sx={{ ...brandButtonSx, mt: 2 }}>
            Save par changes
          </Button>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">Players</h2>
        <ul className="space-y-2 mb-4">
          {round.players.map(player => {
            const isOwner = player.userId === round.ownerUserId;
            return (
              <li
                key={player.id}
                className="flex items-center justify-between rounded border border-brand-200 bg-brand-100 p-2"
              >
                <div className="flex items-center gap-2">
                  <PlayerAvatar
                    userId={player.userId}
                    displayName={player.displayName}
                    photoURL={player.photoURL}
                    color={player.color}
                  />
                  <span className="text-neutral-900">{player.displayName}</span>
                  <span className="text-xs text-neutral-500 ml-2">{isOwner ? 'owner' : player.kind}</span>
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
          {availableFamily.length > 0 && (
            <div className="rounded border border-brand-200 bg-brand-100 p-3">
              <h3 className="text-sm font-semibold text-neutral-700 mb-1">Add family</h3>
              <p className="text-xs text-neutral-500 mb-2">
                Family members can be added directly — no invite link needed.
              </p>
              <select
                value=""
                onChange={e => handleAddFamily(e.target.value)}
                disabled={pending}
                aria-label="Add family member"
                className="w-full rounded border border-brand-300 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-brand-600 disabled:opacity-60"
              >
                <option value="" disabled>
                  Add a family member…
                </option>
                {availableFamily.map(member => (
                  <option key={member.userId} value={member.userId}>
                    {member.displayName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="rounded border border-brand-200 bg-brand-100 p-3">
            <h3 className="text-sm font-semibold text-neutral-700 mb-1">Invite with a link</h3>
            <p className="text-xs text-neutral-500 mb-2">
              Anyone with this link can sign in and join the round before it starts.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <TextField
                value={inviteUrl}
                size="small"
                fullWidth
                slotProps={{ input: { readOnly: true } }}
                onFocus={e => e.target.select()}
                sx={lightFieldSx}
              />
              <Button variant="contained" onClick={handleCopyInvite} sx={brandContainedButtonSx}>
                {copied ? 'Copied!' : 'Copy link'}
              </Button>
            </div>
            {round.joinCode && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-neutral-500">Or share this code:</span>
                <span className="font-mono text-lg font-bold tracking-[0.3em] text-neutral-900">{round.joinCode}</span>
                <Button variant="outlined" size="small" onClick={handleCopyCode} sx={brandButtonSx}>
                  {copiedCode ? 'Copied!' : 'Copy code'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-1">Gamemaster</h2>
        <p className="text-sm text-neutral-500 mb-2">
          The gamemaster runs the round live — controlling the current hole and entering scores. Defaults to you.
        </p>
        <select
          value={round.gamemasterUserId ?? round.ownerUserId}
          onChange={e => handleSetGamemaster(e.target.value)}
          disabled={pending}
          aria-label="Gamemaster"
          className="rounded border border-brand-300 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-brand-600 disabled:opacity-60"
        >
          {gamemasterChoices.map(p => (
            <option key={p.userId} value={p.userId}>
              {p.displayName}
              {p.userId === round.ownerUserId ? ' (owner)' : ''}
            </option>
          ))}
        </select>
      </section>

      {error && <Alert severity="error">{error}</Alert>}

      <div className="flex gap-2">
        <Button
          variant="contained"
          onClick={handleStart}
          disabled={pending || round.players.length === 0}
          sx={brandContainedButtonSx}
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
          sx={{ color: 'var(--color-brand-700)' }}
        >
          Back to rounds
        </Button>
      </div>
    </div>
  );
};
