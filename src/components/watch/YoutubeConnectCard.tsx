'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import { disconnectYoutube } from 'api/youtube';
import { brandContainedButtonSx } from 'components/scorebook/fieldStyles';
import { YoutubePlaylists } from 'components/watch/YoutubePlaylists';

interface YoutubeConnectCardProps {
  connected: boolean;
  notice?: 'connected' | 'error' | null;
}

// Connect is a full-page navigation to brainerd-api's YouTube OAuth entry point (the server-side flow
// that stores a long-lived refresh token). Disconnect is a normal authenticated XHR. Mirrors
// components/oishii/GmailConnectCard.tsx.
export const YoutubeConnectCard = ({ connected, notice }: YoutubeConnectCardProps) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const connectUrl = `${process.env.NEXT_PUBLIC_BRAINERD_API_URL}/watch/youtube/auth`;

  const handleDisconnect = async () => {
    setBusy(true);
    try {
      await disconnectYoutube();
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-neutral-700 bg-neutral-800 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">YouTube</h2>
          <p className="mt-1 text-sm text-neutral-300">
            {connected
              ? 'Connected — browse your playlists below.'
              : 'Connect your YouTube account to browse your playlists and import videos.'}
          </p>
        </div>
        {connected ? (
          <Button variant="outlined" color="inherit" onClick={handleDisconnect} disabled={busy}>
            {busy ? 'Disconnecting…' : 'Disconnect'}
          </Button>
        ) : (
          <Button variant="contained" href={connectUrl} sx={brandContainedButtonSx}>
            Connect YouTube
          </Button>
        )}
      </div>

      {notice === 'connected' && <Alert severity="success">YouTube connected.</Alert>}
      {notice === 'error' && <Alert severity="error">Couldn&apos;t connect YouTube. Please try again.</Alert>}

      {connected && <YoutubePlaylists />}
    </section>
  );
};
