'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import TextField from '@mui/material/TextField';

import type { AuthResponse } from 'types/firebase';
import { signInUser } from 'utils/firebase';
import { FORGOT_PASSWORD_ROUTE } from 'constants/routes';
import { useAppLoading } from 'hooks/useAppLoading';

const INPUT_WIDTH = 300;

interface SignInProps {
  redirectRoute: string;
}

export const SignIn = ({ redirectRoute }: SignInProps) => {
  const { isLoading, setIsLoading } = useAppLoading();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authResponse, setAuthResponse] = useState<AuthResponse>({ isError: false, message: '' });
  const router = useRouter();

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
  };

  const handleSignIn = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await signInUser(email, password);
      setAuthResponse(response);

      if (!response.isError) {
        // Use hard navigation to ensure server components re-render with new auth state
        window.location.href = redirectRoute;
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setAuthResponse({
        isError: true,
        message: error instanceof Error ? error.message : 'Sign in failed'
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-2">
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
      <div className="mb-5 flex flex-col">
        <TextField
          type={showPassword ? 'text' : 'password'}
          label="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyPress}
          data-testid="passwordInput"
          autoCapitalize="off"
          disabled={isLoading}
          size="small"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton className="relative left-[2px]" onClick={() => setShowPassword(show => !show)}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }
          }}
          sx={{ width: INPUT_WIDTH }}
        />
        <Button
          className="self-end"
          variant="text"
          size="small"
          color="info"
          onClick={() => router.push(FORGOT_PASSWORD_ROUTE)}
        >
          Forgot password?
        </Button>
      </div>
      <Button
        variant="contained"
        onClick={handleSignIn}
        disabled={isLoading}
        data-testid="signInButton"
        sx={{
          width: INPUT_WIDTH,
          backgroundColor: 'var(--color-brand-600)',
          '&:hover': { backgroundColor: 'var(--color-brand-700)' }
        }}
      >
        Log In
      </Button>
      {authResponse.message && (
        <div className="mt-4" style={{ width: INPUT_WIDTH }}>
          {authResponse.isError ? (
            <Alert severity="error">{authResponse.message}</Alert>
          ) : (
            <Alert severity="success">{authResponse.message}</Alert>
          )}
        </div>
      )}
    </div>
  );
};
