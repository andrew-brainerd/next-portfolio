'use client';

import { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

import {
  addFrisbeeGolfPlayer,
  getFrisbeeGolfFamily,
  removeFrisbeeGolfPlayer,
  setFrisbeeGolfGamemaster,
  updateFrisbeeGolfHoles
} from '@/api/scorebook';
import { SCOREBOOK_FRISBEE_GOLF_ROUTE } from 'constants/routes';
import { brandButtonSx, brandContainedButtonSx } from '@/components/scorebook/fieldStyles';
import { NumberInput } from '@/components/scorebook/NumberInput';
import { PlayerAvatar } from '@/components/scorebook/PlayerAvatar';
import type { FrisbeeGolfFamilyMember, FrisbeeGolfRound } from '@/types/scorebook';

interface RoundControlsProps {
  round: FrisbeeGolfRound;
  isOwner: boolean;
  onRoundUpdate: (round: FrisbeeGolfRound) => void;
}

const darkSelectClass =
  'w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none ' +
  'focus:border-brand-500 disabled:opacity-60';

// Mid-round tools for the owner/gamemaster: reassign the gamemaster, adjust par,
// invite late joiners, and manage the roster once play is underway. Rendered
// inside the round-settings modal, which only controllers ever reach.
export const RoundControls = ({ round, isOwner, onRoundUpdate }: RoundControlsProps) => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [parDrafts, setParDrafts] = useState<Record<number, number>>(() =>
    Object.fromEntries(round.holes.map(h => [h.number, h.par]))
  );
  const parDirty = useMemo(() => round.holes.some(h => parDrafts[h.number] !== h.par), [round.holes, parDrafts]);

  const [family, setFamily] = useState<FrisbeeGolfFamilyMember[]>([]);
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    getFrisbeeGolfFamily()
      .then(setFamily)
      .catch(() => setFamily([]));
  }, []);

  const availableFamily = useMemo(
    () => family.filter(member => !round.players.some(p => p.userId === member.userId)),
    [family, round.players]
  );

  const userPlayers = round.players.filter(p => p.kind === 'user' && p.userId);
  const gamemasterUserId = round.gamemasterUserId ?? round.ownerUserId;
  const gamemasterName = userPlayers.find(p => p.userId === gamemasterUserId)?.displayName ?? 'Owner';

  useEffect(() => {
    const path = round.joinCode ? `/j/${round.joinCode}` : `${SCOREBOOK_FRISBEE_GOLF_ROUTE}/${round.id}/join`;
    setInviteUrl(`${window.location.origin}${path}`);
  }, [round.id, round.joinCode]);

  const runAction = async (action: () => Promise<FrisbeeGolfRound | undefined>) => {
    setPending(true);
    setError(null);
    try {
      const updated = await action();
      if (updated) onRoundUpdate(updated);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  };

  const handleSetGamemaster = (userId: string) => runAction(() => setFrisbeeGolfGamemaster(round.id, userId));

  const handleSavePars = () => {
    const nextHoles = round.holes.map(h => ({ ...h, par: Math.max(1, parDrafts[h.number] || h.par) }));
    return runAction(() => updateFrisbeeGolfHoles(round.id, nextHoles));
  };

  const handleAddFamily = (userId: string) => {
    const member = family.find(m => m.userId === userId);
    if (!member) return;
    return runAction(() =>
      addFrisbeeGolfPlayer(round.id, { kind: 'user', userId: member.userId, displayName: member.displayName })
    );
  };

  const handleRemovePlayer = async (playerId: string) => {
    setPending(true);
    setError(null);
    try {
      await removeFrisbeeGolfPlayer(round.id, playerId);
      onRoundUpdate({ ...round, players: round.players.filter(p => p.id !== playerId) });
    } catch (err) {
      console.error(err);
      setError('Could not remove player');
    } finally {
      setPending(false);
    }
  };

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

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-1 text-base font-semibold text-white">Gamemaster</h3>
        <p className="mb-2 text-xs text-neutral-500">
          The gamemaster runs the round live — controlling the current hole and entering scores.
        </p>
        {isOwner ? (
          <select
            value={gamemasterUserId}
            onChange={e => handleSetGamemaster(e.target.value)}
            disabled={pending}
            aria-label="Gamemaster"
            className={darkSelectClass}
          >
            {userPlayers.map(p => (
              <option key={p.userId} value={p.userId}>
                {p.displayName}
                {p.userId === round.ownerUserId ? ' (owner)' : ''}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm font-medium text-white">{gamemasterName}</p>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">Adjust par</h3>
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
        <h3 className="mb-2 text-base font-semibold text-white">Players &amp; invites</h3>
        <ul className="space-y-2">
          {round.players.map(player => {
            const isRoundOwner = player.userId === round.ownerUserId;
            return (
              <li
                key={player.id}
                className="flex items-center justify-between rounded border border-neutral-700 bg-neutral-800 p-2"
              >
                <div className="flex items-center gap-2">
                  <PlayerAvatar
                    userId={player.userId}
                    displayName={player.displayName}
                    photoURL={player.photoURL}
                    color={player.color}
                  />
                  <span className="text-white">{player.displayName}</span>
                  <span className="ml-2 text-xs text-neutral-500">{isRoundOwner ? 'owner' : player.kind}</span>
                </div>
                {!isRoundOwner && (
                  <IconButton
                    aria-label={`Remove ${player.displayName}`}
                    onClick={() => handleRemovePlayer(player.id)}
                    disabled={pending}
                    size="small"
                    sx={{ color: 'var(--color-neutral-400)' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </li>
            );
          })}
        </ul>

        {availableFamily.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-1 text-sm font-semibold text-neutral-300">Add family</h4>
            <select
              value=""
              onChange={e => handleAddFamily(e.target.value)}
              disabled={pending}
              aria-label="Add family member"
              className={darkSelectClass}
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

        <div className="mt-4">
          <h4 className="mb-1 text-sm font-semibold text-neutral-300">Invite with a link</h4>
          <p className="mb-2 text-xs text-neutral-500">
            Anyone with this link can sign in and join — even now that the round has started.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={inviteUrl}
              readOnly
              onFocus={e => e.target.select()}
              aria-label="Invite link"
              className="min-w-0 flex-1 rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
            />
            <Button variant="contained" onClick={handleCopyInvite} sx={brandContainedButtonSx}>
              {copied ? 'Copied!' : 'Copy link'}
            </Button>
          </div>
          {round.joinCode && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-500">Or share this code:</span>
              <span className="font-mono text-lg font-bold tracking-[0.3em] text-white">{round.joinCode}</span>
              <Button variant="outlined" size="small" onClick={handleCopyCode} sx={brandButtonSx}>
                {copiedCode ? 'Copied!' : 'Copy code'}
              </Button>
            </div>
          )}
        </div>
      </section>

      {error && <Alert severity="error">{error}</Alert>}
    </div>
  );
};
