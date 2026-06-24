'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import TextField from '@mui/material/TextField';

import { useSignInForm } from 'hooks/useAuthForms';

const INPUT_WIDTH = 300;

interface SignInProps {
  redirectRoute: string;
}

export const SignIn = ({ redirectRoute }: SignInProps) => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    isLoading,
    authResponse,
    handleSignIn,
    goToForgotPassword
  } = useSignInForm(redirectRoute);

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleSignIn();
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
                  <IconButton className="relative left-[2px]" onClick={toggleShowPassword}>
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
          onClick={goToForgotPassword}
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
