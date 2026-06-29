import { initializeApp } from 'firebase/app';
import {
  type AuthError,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth';

import type { AuthResponse } from 'types/firebase';
import { bakeCookie } from 'api/authentication';
import { TOKEN_COOKIE, USER_COOKIE } from 'constants/authentication';

const friendlyAuthError = (code: string | undefined, fallback: string): string => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account already exists for that email';
    case 'auth/invalid-email':
      return 'Please enter a valid email';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in cancelled';
    case 'auth/popup-blocked':
      return 'Pop-up blocked by your browser';
    case 'auth/account-exists-with-different-credential':
      return 'An account with that email exists with a different sign-in method';
    default:
      return fallback;
  }
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL
};

if (!firebaseConfig.apiKey) {
  console.error('Invalid Firebase Configuration Provided');
}

const firebaseApp = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);

export const resetPassword = (code: string, newPassword: string): Promise<void> => {
  return confirmPasswordReset(firebaseAuth, code, newPassword);
};

export const sendForgotPasswordEmail = (email: string): Promise<void> => {
  return sendPasswordResetEmail(firebaseAuth, email);
};

export const signInUser = (email: string, password: string): Promise<AuthResponse> => {
  return signInWithEmailAndPassword(firebaseAuth, email, password)
    .then(async userCredential => {
      const idToken = await userCredential.user.getIdToken();

      await bakeCookie(idToken);

      return {
        isError: false,
        message: 'Login successful'
      };
    })
    .catch(error => {
      const err = error as AuthError;
      console.error('Login error', err.message);

      return {
        isError: true,
        message: 'Login failed. Please try again.'
      };
    });
};

export const signUpUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const idToken = await userCredential.user.getIdToken();

    await bakeCookie(idToken);

    return {
      isError: false,
      message: 'Account created'
    };
  } catch (error) {
    const err = error as AuthError;
    console.error('Sign-up error', err.message);

    return {
      isError: true,
      message: friendlyAuthError(err.code, 'Sign-up failed. Please try again.')
    };
  }
};

export const signInWithGoogle = async (): Promise<AuthResponse> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(firebaseAuth, provider);
    const idToken = await userCredential.user.getIdToken();

    await bakeCookie(idToken);

    return {
      isError: false,
      message: 'Sign-in successful'
    };
  } catch (error) {
    const err = error as AuthError;
    console.error('Google sign-in error', err.message);

    return {
      isError: true,
      message: friendlyAuthError(err.code, 'Google sign-in failed. Please try again.')
    };
  }
};

export const validateInviteCode = async (code: string): Promise<AuthResponse> => {
  const BASE_URL = process.env.NEXT_PUBLIC_BRAINERD_API_URL;

  try {
    const response = await fetch(`${BASE_URL}/register/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    if (response.ok) {
      return { isError: false, message: 'Invite code accepted' };
    }

    if (response.status === 401) {
      return { isError: true, message: 'Invalid invite code' };
    }

    const body = (await response.json().catch(() => ({}))) as { message?: string };
    return {
      isError: true,
      message: body.message || 'Could not verify invite code'
    };
  } catch (error) {
    console.error('Invite code validation error', error);

    return {
      isError: true,
      message: 'Could not verify invite code'
    };
  }
};

// Clear a non-httpOnly cookie across every scope it might have been set with
// during local dev (host-only and the shared `.brainerd.dev` parent domain).
const clearClientCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  const expiry = 'Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  const host = window.location.hostname;
  const parent = host.split('.').slice(-2).join('.'); // e.g. brainerd.dev
  for (const domainAttr of ['', `; domain=${host}`, `; domain=.${parent}`]) {
    document.cookie = `${name}=; path=/${domainAttr}; ${expiry}`;
  }
};

export const signOutUser = async (): Promise<void> => {
  await fetch('/api/auth', { method: 'DELETE' });
  clearClientCookie(TOKEN_COOKIE);
  clearClientCookie(USER_COOKIE);
  await signOut(firebaseAuth);
};
