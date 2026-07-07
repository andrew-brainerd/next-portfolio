'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import { disconnectGmail } from '@/api/oishii';
import { brandContainedButtonSx } from '@/components/scorebook/fieldStyles';

interface GmailConnectCardProps {
  connected: boolean;
  notice?: 'connected' | 'error' | null;
}

// Connect is a full-page navigation to brainerd-api's Gmail OAuth entry point
// (the server-side flow that stores a long-lived refresh token). Disconnect is
// a normal authenticated XHR.
export const GmailConnectCard = ({ connected, notice }: GmailConnectCardProps) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const connectUrl = `${process.env.NEXT_PUBLIC_BRAINERD_API_URL}/oishii/gmail/auth`;

  const handleDisconnect = async () => {
    setBusy(true);
    try {
      await disconnectGmail();
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex max-w-xl flex-col gap-3 rounded-xl border border-neutral-700 bg-neutral-800 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Gmail</h2>
          <p className="mt-1 text-sm text-neutral-300">
            {connected
              ? 'Connected — you can scan your inbox for Instacart receipts.'
              : 'Connect your Gmail to scan Instacart receipts into a pantry.'}
          </p>
        </div>
        {connected ? (
          <Button variant="outlined" color="inherit" onClick={handleDisconnect} disabled={busy}>
            {busy ? 'Disconnecting…' : 'Disconnect'}
          </Button>
        ) : (
          <Button variant="contained" href={connectUrl} sx={brandContainedButtonSx}>
            Connect Gmail
          </Button>
        )}
      </div>

      {notice === 'connected' && <Alert severity="success">Gmail connected.</Alert>}
      {notice === 'error' && <Alert severity="error">Couldn&apos;t connect Gmail. Please try again.</Alert>}
    </section>
  );
};
