import { initializeApp } from 'firebase/app';
import {
  type AuthError,
  confirmPasswordReset,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

import type { AuthResponse } from 'types/firebase';
import { bakeCookie } from 'api/authentication';

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

export const signOutUser = async (): Promise<void> => {
  await fetch('/api/auth', { method: 'DELETE' });
  await signOut(firebaseAuth);
};
