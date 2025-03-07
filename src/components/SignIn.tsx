'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import AppleIcon from '@mui/icons-material/Apple';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import TextField from '@mui/material/TextField';

import type { AuthResponse } from 'types/firebase';
import { signInUser } from 'utils/firebase';
import { FORGOT_PASSWORD_ROUTE } from 'constants/routes';
import { useAppLoading } from 'hooks/useAppLoading';
import Separator from 'components/Separator';

const LOGO_SIZE = 125;
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    signInUser(email, password).then(response => {
      setAuthResponse(response);

      if (!response.isError) {
        router.push(redirectRoute);
      } else {
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-y-6 bg-brand-800 w-full h-screen">
      <div className=" mt-[5%] input-box flex max-w-[572px] flex-col gap-y-2 rounded bg-white shadow p-8">
        <h1 className="mb-7 overflow-visible text-2xl text-brand-700 text-center">Manga Login</h1>
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
          color="info"
          variant="contained"
          onClick={handleSignIn}
          disabled={isLoading}
          data-testid="signInButton"
          sx={{ width: INPUT_WIDTH }}
        >
          Log In
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
