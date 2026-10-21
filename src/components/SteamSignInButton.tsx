'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import { startSteamSignIn } from 'utils/firebase';
import { STEAM_REDIRECT_KEY, STEAM_STATE_KEY, safeRedirect } from 'utils/steamSignIn';

interface SteamSignInButtonProps {
  redirectRoute: string;
  width?: number;
}

export const SteamSignInButton = ({ redirectRoute, width }: SteamSignInButtonProps) => {
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async (): Promise<void> => {
    setIsStarting(true);
    setError('');
    const started = await startSteamSignIn();
    if (!started) {
      setError('Could not reach Steam sign-in. Please try again.');
      setIsStarting(false);
      return;
    }
    try {
      sessionStorage.setItem(STEAM_STATE_KEY, started.state);
      sessionStorage.setItem(STEAM_REDIRECT_KEY, safeRedirect(redirectRoute));
    } catch {
      setError('Steam sign-in needs browser storage turned on.');
      setIsStarting(false);
      return;
    }
    window.location.href = started.url;
  };

  return (
    <div className="flex flex-col gap-y-2" style={{ width }}>
      <Button
        variant="outlined"
        onClick={handleClick}
        disabled={isStarting}
        data-testid="steamSignInButton"
        sx={{ width, color: 'var(--color-brand-700)', borderColor: 'var(--color-brand-700)' }}
      >
        Sign in with Steam
      </Button>
      {error && <Alert severity="error">{error}</Alert>}
    </div>
  );
};
