'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import TextField from '@mui/material/TextField';

import type { AuthResponse } from 'types/firebase';
import { resetPassword } from 'utils/firebase';
import { LOGIN_ROUTE } from 'constants/routes';
import { useAppLoading } from 'hooks/useAppLoading';

const LOGO_SIZE = 125;
const INPUT_WIDTH = 300;

export const ResetPassword = () => {
  const { isLoading, setIsLoading } = useAppLoading();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive validation state from password values - useMemo avoids setState in effect
  const authResponse = useMemo<AuthResponse>(() => {
    if (!confirmPassword) {
      return { isError: false, message: '' };
    }

    if (password !== confirmPassword) {
      return { isError: true, message: 'Passwords do not match' };
    }

    return { isError: false, message: 'Looks good' };
  }, [password, confirmPassword]);

  const handleResetPassword = async (): Promise<void> => {
    const code = searchParams.get('code');

    if (!code) {
      return;
    }

    try {
      await resetPassword(code, password);
      router.replace(LOGIN_ROUTE);
    } catch (error) {
      console.error('Password reset failed:', error);
      // Error will be shown in Firebase auth UI
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleResetPassword();
    }
  };

  return (
    <div className="mt-[5%] flex flex-col items-center gap-y-6 sm:bg-inherit">
      <Image src="/tailboard-blue.svg" height={LOGO_SIZE} width={LOGO_SIZE} alt="Tailboard Logo" />
      <div className="input-box flex max-w-[572px] flex-col gap-y-2 rounded bg-white shadow">
        <h1 className="mb-7 overflow-visible text-2xl">Reset Password</h1>
        <div className="mb-3 flex flex-col">
          <TextField
            className="w-[300px]"
            type={showPasswords ? 'text' : 'password'}
            label="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            data-testid="passwordInput"
            autoCapitalize="off"
            autoComplete="off"
            disabled={isLoading}
            size="small"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton className="relative left-[2px]" onClick={() => setShowPasswords(show => !show)}>
                      {showPasswords ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
        </div>
        <div className="mb-5 flex flex-col">
          <TextField
            className="w-[300px]"
            label="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            onKeyDown={handleKeyPress}
            data-testid="passwordInput"
            autoCapitalize="off"
            autoComplete="off"
            disabled={isLoading}
            size="small"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton className="relative left-[2px]" onClick={() => setShowPasswords(show => !show)}>
                      {showPasswords ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
            type={showPasswords ? 'text' : 'password'}
          />
        </div>
        <Button
          color="info"
          variant="contained"
          onClick={handleResetPassword}
          disabled={isLoading}
          data-testid="signInButton"
          sx={{ width: INPUT_WIDTH }}
        >
          Confirm
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
