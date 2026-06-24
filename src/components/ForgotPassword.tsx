'use client';

import { useState } from 'react';
import Image from 'next/image';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import type { AuthResponse } from 'types/firebase';
import { sendForgotPasswordEmail } from 'utils/firebase';
import { useAppLoading } from 'hooks/useAppLoading';
import { useWin95Mode } from 'hooks/useWin95Mode';
import { Win95Dialog } from 'components/win95/Win95Dialog';
import TextField from '@mui/material/TextField';

const LOGO_SIZE = 125;
const INPUT_WIDTH = 300;

export const ForgotPassword = () => {
  const { isLoading } = useAppLoading();
  const [email, setEmail] = useState('');
  const [authResponse, setAuthResponse] = useState<AuthResponse>({ isError: false, message: '' });
  const win95 = useWin95Mode(s => s.enabled);

  const handleForgotPassword = async (): Promise<void> => {
    try {
      await sendForgotPasswordEmail(email);
      setAuthResponse({ isError: false, message: 'Password reset email sent' });
    } catch (error) {
      setAuthResponse({
        isError: true,
        message: error instanceof Error ? error.message : 'Failed to send reset email'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleForgotPassword();
    }
  };

  if (win95) {
    return (
      <Win95Dialog title="Forgot Password">
        <div className="flex flex-col gap-3">
          <p>Enter your email and we&apos;ll send a reset link.</p>
          <label className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-right">Email:</span>
            <input
              className="win95-field flex-1"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus
              autoCapitalize="off"
              disabled={isLoading}
            />
          </label>
          {authResponse.message && (
            <div className={authResponse.isError ? 'text-[#a00000]' : 'text-[#007000]'}>
              {authResponse.isError ? '⚠ ' : '✓ '}
              {authResponse.message}
            </div>
          )}
          <div className="flex justify-end">
            <button type="button" className="win95-btn" onClick={handleForgotPassword} disabled={isLoading}>
              Send Reset Email
            </button>
          </div>
        </div>
      </Win95Dialog>
    );
  }

  return (
    <div className="mt-[5%] flex flex-col items-center gap-y-6 sm:bg-inherit">
      <Image src="/tailboard-blue.svg" height={LOGO_SIZE} width={LOGO_SIZE} alt="Tailboard Logo" />
      <div className="input-box flex max-w-[572px] flex-col gap-y-2 rounded bg-white shadow">
        <h1 className="mb-7 overflow-visible text-2xl">Forgot Password</h1>
        <div className="mb-3">
          <TextField
            label="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus={true}
            onKeyDown={handleKeyPress}
            data-testid="emailInput"
            autoCapitalize="off"
            disabled={isLoading}
            size="small"
            sx={{ width: INPUT_WIDTH }}
          />
        </div>
        <Button
          color="info"
          variant="contained"
          onClick={handleForgotPassword}
          disabled={isLoading}
          data-testid="sendResetEmailButton"
          sx={{ width: INPUT_WIDTH }}
        >
          Send Reset Email
        </Button>
        {authResponse.message && (
          <div className="mt-4">
            {authResponse.isError ? (
              <Alert severity="error">{authResponse.message}</Alert>
            ) : (
              <Alert severity="success">{authResponse.message}</Alert>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
