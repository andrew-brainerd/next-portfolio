'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { deletePantry, renamePantry, transferOwnership } from '@/api/oishii';
import { OISHII_ROUTE } from '@/constants/routes';
import { brandButtonSx, brandContainedButtonSx, lightFieldSx } from '@/components/scorebook/fieldStyles';
import type { PantryDetail } from '@/types/oishii';

interface PantrySettingsProps {
  pantry: PantryDetail;
  onChanged: () => void | Promise<void>;
}

export const PantrySettings = ({ pantry, onChanged }: PantrySettingsProps) => {
  const router = useRouter();
  const [nameDraft, setNameDraft] = useState(pantry.name);
  const [transferTo, setTransferTo] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameDirty = nameDraft.trim() !== pantry.name && nameDraft.trim().length > 0;
  const otherMembers = pantry.members.filter(member => member.userId !== pantry.ownerUserId);

  const handleRename = async () => {
    setPending(true);
    setError(null);
    try {
      await renamePantry(pantry.id, nameDraft.trim());
      await onChanged();
    } catch (err) {
      console.error(err);
      setError('Could not rename the pantry.');
    } finally {
      setPending(false);
    }
  };

  const handleTransfer = async () => {
    const target = pantry.members.find(member => member.userId === transferTo);
    if (!target) return;
    if (!window.confirm(`Make ${target.displayName} the owner? You will remain a member.`)) return;
    setPending(true);
    setError(null);
    try {
      await transferOwnership(pantry.id, transferTo);
      setTransferTo('');
      await onChanged();
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Could not transfer ownership.');
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete “${pantry.name}”? This permanently removes it for everyone.`)) return;
    setPending(true);
    setError(null);
    try {
      await deletePantry(pantry.id);
      router.push(OISHII_ROUTE);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Could not delete the pantry.');
      setPending(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8 rounded-xl border border-brand-200 bg-white p-6 text-neutral-900 shadow-sm">
      <section>
        <h3 className="mb-2 text-lg font-semibold text-neutral-900">Rename</h3>
        <div className="flex items-center gap-2">
          <TextField
            value={nameDraft}
            onChange={e => setNameDraft(e.target.value)}
            size="small"
            fullWidth
            disabled={pending}
            sx={lightFieldSx}
          />
          <Button variant="outlined" onClick={handleRename} disabled={!nameDirty || pending} sx={brandButtonSx}>
            Save
          </Button>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-lg font-semibold text-neutral-900">Transfer ownership</h3>
        {otherMembers.length === 0 ? (
          <p className="text-sm text-neutral-500">Invite another member first to transfer ownership.</p>
        ) : (
          <div className="flex items-center gap-2">
            <select
              value={transferTo}
              onChange={e => setTransferTo(e.target.value)}
              disabled={pending}
              aria-label="New owner"
              className="flex-1 rounded border border-brand-300 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-brand-600 disabled:opacity-60"
            >
              <option value="" disabled>
                Choose a member…
              </option>
              {otherMembers.map(member => (
                <option key={member.userId} value={member.userId}>
                  {member.displayName}
                </option>
              ))}
            </select>
            <Button
              variant="contained"
              onClick={handleTransfer}
              disabled={pending || !transferTo}
              sx={brandContainedButtonSx}
            >
              Transfer
            </Button>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-lg font-semibold text-red-700">Danger zone</h3>
        <p className="mb-3 text-sm text-neutral-500">
          Deleting the pantry removes all of its items and members for everyone.
        </p>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDelete}
          disabled={pending}
          sx={{ textTransform: 'none' }}
        >
          Delete pantry
        </Button>
      </section>

      {error && <Alert severity="error">{error}</Alert>}
    </div>
  );
};
