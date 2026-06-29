'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { joinFrisbeeGolfRound } from '@/api/scorebook';
import { SCOREBOOK_FRISBEE_GOLF_ROUTE } from 'constants/routes';
import { lightFieldSx, brandContainedButtonSx } from '@/components/scorebook/fieldStyles';

interface JoinRoundProps {
  roundId: string;
}

export const JoinRound = ({ roundId }: JoinRoundProps) => {
  const router = useRouter();
  const { user, ready } = useFirebaseUser();
  const [nicknameInput, setNicknameInput] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nickname = nicknameInput ?? user?.displayName ?? user?.email ?? '';

  const handleJoin = async () => {
    setJoining(true);
    setError(null);
    try {
      const round = await joinFrisbeeGolfRound(roundId, nickname.trim() || undefined);
      if (!round) {
        setError('Could not join this round.');
        setJoining(false);
        return;
      }
      router.replace(`${SCOREBOOK_FRISBEE_GOLF_ROUTE}/${roundId}`);
    } catch {
      setError('This round could not be joined — it may have already started.');
      setJoining(false);
    }
  };

  if (!ready) return null;
  if (!user) {
    return <div className="container mx-auto p-6 text-neutral-300">Please sign in to join this round.</div>;
  }

  return (
    <div className="container mx-auto max-w-md p-6">
      <div className="rounded-xl border border-brand-200 bg-white p-6 text-neutral-900 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold">Join the round</h1>
        <p className="mb-4 text-sm text-neutral-500">
          Pick the name the group will see on the scoreboard.
        </p>
        <TextField
          label="Your nickname"
          value={nickname}
          onChange={e => setNicknameInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleJoin();
          }}
          fullWidth
          size="small"
          disabled={joining}
          sx={lightFieldSx}
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex gap-2">
          <Button
            variant="contained"
            onClick={handleJoin}
            disabled={joining || !nickname.trim()}
            sx={brandContainedButtonSx}
          >
            {joining ? 'Joining…' : 'Join round'}
          </Button>
          <Button
            variant="text"
            onClick={() => router.push(SCOREBOOK_FRISBEE_GOLF_ROUTE)}
            disabled={joining}
            sx={{ color: 'var(--color-brand-700)' }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
