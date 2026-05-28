'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import type { AuthResponse } from 'types/firebase';
import { signInWithGoogle, signUpUser, validateInviteCode } from 'utils/firebase';
import { useAppLoading } from 'hooks/useAppLoading';
import { Separator } from 'components/Separator';

const INPUT_WIDTH = 300;

interface SignUpProps {
  redirectRoute: string;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.97v2.33A9 9 0 0 0 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.97A9 9 0 0 0 0 9c0 1.45.35 2.83.97 4.05l3-2.33z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .97 4.95l3 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

export const SignUp = ({ redirectRoute }: SignUpProps) => {
  const { isLoading, setIsLoading } = useAppLoading();
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authResponse, setAuthResponse] = useState<AuthResponse>({ isError: false, message: '' });

  const handleSuccess = (message: string) => {
    setAuthResponse({ isError: false, message });
    window.location.href = redirectRoute;
  };

  const handleFailure = (message: string) => {
    setAuthResponse({ isError: true, message });
    setIsLoading(false);
  };

  const verifyInvite = async (): Promise<boolean> => {
    if (!inviteCode.trim()) {
      handleFailure('Invite code is required');
      return false;
    }

    const result = await validateInviteCode(inviteCode);
    if (result.isError) {
      handleFailure(result.message);
      return false;
    }
    return true;
  };

  const handleEmailSignUp = async (): Promise<void> => {
    setIsLoading(true);
    setAuthResponse({ isError: false, message: '' });

    if (!(await verifyInvite())) return;

    const response = await signUpUser(email, password);
    if (response.isError) {
      handleFailure(response.message);
    } else {
      handleSuccess(response.message);
    }
  };

  const handleGoogleSignUp = async (): Promise<void> => {
    setIsLoading(true);
    setAuthResponse({ isError: false, message: '' });

    if (!(await verifyInvite())) return;

    const response = await signInWithGoogle();
    if (response.isError) {
      handleFailure(response.message);
    } else {
      handleSuccess(response.message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleEmailSignUp();
    }
  };

  return (
    <div className="flex flex-col gap-y-2">
      <div className="mb-3">
        <TextField
          label="Invite code"
          value={inviteCode}
          onChange={e => setInviteCode(e.target.value)}
          onKeyDown={handleKeyPress}
          data-testid="inviteCodeInput"
          autoCapitalize="off"
          disabled={isLoading}
          size="small"
          sx={{ width: INPUT_WIDTH }}
        />
      </div>
      <div className="mb-3">
        <TextField
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyPress}
          data-testid="signUpEmailInput"
          autoCapitalize="off"
          disabled={isLoading}
          size="small"
          sx={{ width: INPUT_WIDTH }}
        />
      </div>
      <div className="mb-5">
        <TextField
          type={showPassword ? 'text' : 'password'}
          label="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyPress}
          data-testid="signUpPasswordInput"
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
      </div>
      <Button
        variant="contained"
        onClick={handleEmailSignUp}
        disabled={isLoading}
        data-testid="signUpButton"
        sx={{
          width: INPUT_WIDTH,
          backgroundColor: 'var(--color-brand-600)',
          '&:hover': { backgroundColor: 'var(--color-brand-700)' }
        }}
      >
        Create Account
      </Button>
      <Separator text="or" />
      <Button
        variant="outlined"
        onClick={handleGoogleSignUp}
        disabled={isLoading}
        data-testid="googleSignUpButton"
        startIcon={<GoogleIcon />}
        sx={{
          width: INPUT_WIDTH,
          color: 'var(--color-brand-700)',
          borderColor: 'var(--color-brand-700)',
          '&:hover': { borderColor: 'var(--color-brand-700)', backgroundColor: 'rgba(0,0,0,0.04)' }
        }}
      >
        Continue with Google
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
