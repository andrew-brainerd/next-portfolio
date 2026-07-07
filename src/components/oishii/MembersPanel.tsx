'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';

import { inviteByEmail, removeMember, revokeInvite } from '@/api/oishii';
import { OISHII_ROUTE } from '@/constants/routes';
import { brandContainedButtonSx, lightFieldSx } from '@/components/scorebook/fieldStyles';
import type { PantryDetail } from '@/types/oishii';

interface MembersPanelProps {
  pantry: PantryDetail;
  currentUserId: string;
  isOwner: boolean;
  onChanged: () => void | Promise<void>;
}

// Best-effort extraction of a server-provided message (e.g. the 409 "already a member").
const errorMessage = (err: unknown, fallback: string): string => {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
};

export const MembersPanel = ({ pantry, currentUserId, isOwner, onChanged }: MembersPanelProps) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const handleInvite = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    setInviting(true);
    setInviteError(null);
    setInviteNotice(null);
    try {
      await inviteByEmail(pantry.id, trimmed);
      setEmail('');
      setInviteNotice(`Invite sent to ${trimmed}.`);
      await onChanged();
    } catch (err) {
      console.error(err);
      setInviteError(errorMessage(err, 'Could not send invite. Please try again.'));
    } finally {
      setInviting(false);
    }
  };

  const handleRevoke = async (inviteId: string) => {
    setPendingAction(inviteId);
    try {
      await revokeInvite(pantry.id, inviteId);
      await onChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setPendingAction(null);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    const member = pantry.members.find(m => m.userId === userId);
    if (!window.confirm(`Remove ${member?.displayName ?? 'this member'} from the pantry?`)) return;
    setPendingAction(userId);
    try {
      await removeMember(pantry.id, userId);
      await onChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setPendingAction(null);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Leave this pantry? You will lose access to it.')) return;
    setPendingAction(currentUserId);
    try {
      await removeMember(pantry.id, currentUserId);
      router.push(OISHII_ROUTE);
      router.refresh();
    } catch (err) {
      console.error(err);
      setPendingAction(null);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 rounded-xl border border-neutral-700 bg-neutral-800 p-6">
      <ul className="space-y-2">
        {pantry.members.map(member => {
          const isSelf = member.userId === currentUserId;
          return (
            <li
              key={member.userId}
              className="flex items-center justify-between gap-3 rounded border border-neutral-700 bg-neutral-900 p-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-white">{member.displayName}</span>
                  {member.isOwner && (
                    <span className="shrink-0 rounded bg-brand-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-100">
                      Owner
                    </span>
                  )}
                  {isSelf && <span className="shrink-0 text-xs text-neutral-500">you</span>}
                </div>
                <p className="truncate text-xs text-neutral-400">{member.email}</p>
              </div>
              {isOwner && !member.isOwner && (
                <IconButton
                  aria-label={`Remove ${member.displayName}`}
                  onClick={() => handleRemoveMember(member.userId)}
                  disabled={pendingAction === member.userId}
                  size="small"
                >
                  <DeleteIcon fontSize="small" sx={{ color: 'var(--color-neutral-400)' }} />
                </IconButton>
              )}
              {!isOwner && isSelf && (
                <Button
                  variant="text"
                  size="small"
                  onClick={handleLeave}
                  disabled={pendingAction === currentUserId}
                  sx={{ color: 'var(--color-neutral-300)', textTransform: 'none' }}
                >
                  Leave
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      {isOwner && (
        <>
          {pantry.pendingInvites.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-neutral-300">Pending invites</h3>
              <ul className="space-y-2">
                {pantry.pendingInvites.map(invite => (
                  <li
                    key={invite.id}
                    className="flex items-center justify-between gap-3 rounded border border-neutral-700 bg-neutral-900 p-3"
                  >
                    <span className="truncate text-sm text-neutral-200">{invite.email}</span>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleRevoke(invite.id)}
                      disabled={pendingAction === invite.id}
                      sx={{ color: 'var(--color-neutral-300)', textTransform: 'none' }}
                    >
                      Revoke
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded border border-brand-200 bg-white p-4 text-neutral-900">
            <h3 className="mb-2 text-sm font-semibold text-neutral-700">Invite by email</h3>
            <div className="flex items-center gap-2">
              <TextField
                label="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleInvite();
                }}
                type="email"
                size="small"
                fullWidth
                disabled={inviting}
                sx={lightFieldSx}
              />
              <Button
                variant="contained"
                onClick={handleInvite}
                disabled={inviting || !email.trim()}
                sx={brandContainedButtonSx}
              >
                {inviting ? 'Sending...' : 'Invite'}
              </Button>
            </div>
            {inviteError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {inviteError}
              </Alert>
            )}
            {inviteNotice && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {inviteNotice}
              </Alert>
            )}
          </div>
        </>
      )}
    </div>
  );
};
