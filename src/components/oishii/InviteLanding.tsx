'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import { acceptInvite } from '@/api/oishii';
import { OISHII_ROUTE } from '@/constants/routes';
import { brandContainedButtonSx } from '@/components/scorebook/fieldStyles';
import type { InvitePreview } from '@/types/oishii';

interface InviteLandingProps {
  token: string;
  invite: InvitePreview;
}

export const InviteLanding = ({ token, invite }: InviteLandingProps) => {
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setAccepting(true);
    setError(null);
    try {
      const result = await acceptInvite(token);
      router.push(`${OISHII_ROUTE}/${result.pantryId}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Could not accept the invite. Please try again.');
      setAccepting(false);
    }
  };

  const isRevoked = invite.status === 'revoked';
  const isUsed = invite.status === 'accepted' && !invite.alreadyMember;
  const canJoin = !isRevoked && !isUsed;

  return (
    <div className="mx-auto max-w-md rounded-xl border border-neutral-700 bg-neutral-800 p-6 text-center">
      <h1 className="mb-2 text-2xl font-bold text-white">You’re invited</h1>
      <p className="mb-1 text-neutral-300">
        <span className="font-semibold text-white">{invite.inviterName}</span> invited you to join
      </p>
      <p className="mb-6 text-xl font-semibold text-brand-400">{invite.pantryName}</p>

      {isRevoked && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          This invite has been revoked.
        </Alert>
      )}
      {isUsed && (
        <Alert severity="info" sx={{ mb: 3 }}>
          This invite has already been used.
        </Alert>
      )}
      {invite.alreadyMember && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You’re already a member of this pantry.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {canJoin ? (
        <Button variant="contained" onClick={handleAccept} disabled={accepting} sx={brandContainedButtonSx}>
          {accepting ? 'Joining...' : invite.alreadyMember ? 'Go to pantry' : 'Accept invite'}
        </Button>
      ) : (
        <Link href={OISHII_ROUTE} className="text-brand-400 underline hover:text-brand-300">
          Go to your pantries
        </Link>
      )}
    </div>
  );
};
