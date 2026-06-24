import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthResponse } from 'types/firebase';
import { signInUser, signUpUser, signInWithGoogle, validateInviteCode } from 'utils/firebase';
import { FORGOT_PASSWORD_ROUTE } from 'constants/routes';
import { useAppLoading } from 'hooks/useAppLoading';

const EMPTY: AuthResponse = { isError: false, message: '' };

/** Sign-in form state + handlers, shared by the MUI and Win95 presentations. */
export const useSignInForm = (redirectRoute: string) => {
  const { isLoading, setIsLoading } = useAppLoading();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authResponse, setAuthResponse] = useState<AuthResponse>(EMPTY);

  const handleSignIn = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await signInUser(email, password);
      setAuthResponse(response);
      if (!response.isError) {
        // Hard navigation so server components re-render with the new auth state.
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

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword: () => setShowPassword(s => !s),
    isLoading,
    authResponse,
    handleSignIn,
    goToForgotPassword: () => router.push(FORGOT_PASSWORD_ROUTE)
  };
};

/** Sign-up form state + handlers (invite code, email, Google), shared across presentations. */
export const useSignUpForm = (redirectRoute: string) => {
  const { isLoading, setIsLoading } = useAppLoading();
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authResponse, setAuthResponse] = useState<AuthResponse>(EMPTY);

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
    setAuthResponse(EMPTY);
    if (!(await verifyInvite())) return;
    const response = await signUpUser(email, password);
    if (response.isError) handleFailure(response.message);
    else handleSuccess(response.message);
  };

  const handleGoogleSignUp = async (): Promise<void> => {
    setIsLoading(true);
    setAuthResponse(EMPTY);
    if (!(await verifyInvite())) return;
    const response = await signInWithGoogle();
    if (response.isError) handleFailure(response.message);
    else handleSuccess(response.message);
  };

  return {
    inviteCode,
    setInviteCode,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword: () => setShowPassword(s => !s),
    isLoading,
    authResponse,
    handleEmailSignUp,
    handleGoogleSignUp
  };
};
