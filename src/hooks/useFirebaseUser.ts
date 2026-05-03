'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { firebaseAuth } from '@/utils/firebase';

interface FirebaseUserState {
  user: User | null;
  ready: boolean;
}

export const useFirebaseUser = (): FirebaseUserState => {
  const [state, setState] = useState<FirebaseUserState>({
    user: firebaseAuth.currentUser,
    ready: !!firebaseAuth.currentUser
  });

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, user => {
      setState({ user, ready: true });
    });
  }, []);

  return state;
};
