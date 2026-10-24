'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import { beginSteamSignIn } from 'utils/steamSignInFlow';

interface SteamSignInButtonProps {
  redirectRoute: string;
  width?: number;
  link?: boolean;
}

export const SteamSignInButton = ({ redirectRoute, width, link = false }: SteamSignInButtonProps) => {
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async (): Promise<void> => {
    setIsStarting(true);
    setError('');
    const problem = await beginSteamSignIn(redirectRoute, link ? 'link' : 'signIn');
    if (problem) {
      setError(problem);
      setIsStarting(false);
    }
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
        {link ? 'Link Steam' : 'Sign in with Steam'}
      </Button>
      {error && <Alert severity="error">{error}</Alert>}
    </div>
  );
};
