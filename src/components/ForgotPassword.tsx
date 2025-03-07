'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import type { AuthResponse } from 'types/firebase';
import { sendForgotPasswordEmail } from 'utils/firebase';
import { useAppLoading } from 'hooks/useAppLoading';
import TextField from '@mui/material/TextField';

const LOGO_SIZE = 125;
const INPUT_WIDTH = 300;

export const ForgotPassword = () => {
  const { isLoading, setIsLoading } = useAppLoading();
  const [email, setEmail] = useState('');
  const [authResponse, setAuthResponse] = useState<AuthResponse>({ isError: false, message: '' });
  const router = useRouter();

  const handleForgotPassword = async () => {
    sendForgotPasswordEmail(email).then(response => {
      setAuthResponse({ isError: false, message: 'Password reset email sent' });
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleForgotPassword();
    }
  };

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
