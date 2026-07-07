'use client';

import { useState } from 'react';
import Link from 'next/link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import { scanPantry } from '@/api/oishii';
import { OISHII_ROUTE } from '@/constants/routes';
import { brandContainedButtonSx } from '@/components/scorebook/fieldStyles';
import type { ScanSummary } from '@/types/oishii';

interface ScanButtonProps {
  pantryId: string;
  gmailConnected: boolean;
  onScanned: () => void | Promise<void>;
}

// Scans the current user's own Gmail for Instacart receipts into this pantry.
// When Gmail isn't connected, points the user to the connect card on the home page.
export const ScanButton = ({ pantryId, gmailConnected, onScanned }: ScanButtonProps) => {
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setBusy(true);
    setError(null);
    setSummary(null);
    try {
      const result = await scanPantry(pantryId);
      setSummary(result);
      await onScanned();
    } catch (err) {
      console.error(err);
      setError('Scan failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!gmailConnected) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-700 p-4 text-sm text-neutral-300">
        Connect your Gmail on the{' '}
        <Link href={OISHII_ROUTE} className="text-brand-400 underline hover:text-brand-300">
          Oishii home page
        </Link>{' '}
        to scan your Instacart receipts into this pantry.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button variant="contained" onClick={handleScan} disabled={busy} sx={brandContainedButtonSx}>
        {busy ? 'Scanning…' : 'Scan Gmail for receipts'}
      </Button>

      {summary && (
        <Alert severity="success">
          Found {summary.emailsFound} receipt{summary.emailsFound === 1 ? '' : 's'} — {summary.itemsAdded} new item
          {summary.itemsAdded === 1 ? '' : 's'}, {summary.itemsMerged} merged
          {summary.skippedAlreadySeen > 0 ? `, ${summary.skippedAlreadySeen} already imported` : ''}.
        </Alert>
      )}
      {error && <Alert severity="error">{error}</Alert>}
    </div>
  );
};
