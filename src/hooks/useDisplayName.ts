'use client';

import { useEffect, useState } from 'react';
import { updateProfile, type User } from 'firebase/auth';

import { useFirebaseUser } from 'hooks/useFirebaseUser';
import { firebaseAuth } from '@/utils/firebase';

interface UseDisplayName {
  user: User | null;
  ready: boolean;
  name: string;
  setName: (value: string) => void;
  canSave: boolean;
  saving: boolean;
  saved: boolean;
  error: string | null;
  save: () => Promise<void>;
}

// Self-service Firebase Auth display-name editing, shared by the classic Settings
// hub and the Win95 Control Panel so both surfaces behave identically. Updates the
// profile via the client SDK (no cookie re-bake — displayName isn't in the session
// cookie) and reloads the user so the new value reads back.
export const useDisplayName = (): UseDisplayName => {
  const { user, ready } = useFirebaseUser();
  const [name, setNameState] = useState('');
  const [savedName, setSavedName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset the field whenever the signed-in user changes (login/logout).
  useEffect(() => {
    const current = user?.displayName ?? '';
    setNameState(current);
    setSavedName(current);
  }, [user]);

  const setName = (value: string) => {
    setNameState(value);
    setSaved(false);
    setError(null);
  };

  const trimmed = name.trim();
  const canSave = trimmed !== savedName && !!trimmed && !saving;

  const save = async () => {
    if (!firebaseAuth.currentUser || !canSave) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile(firebaseAuth.currentUser, { displayName: trimmed });
      await firebaseAuth.currentUser.reload();
      setSavedName(trimmed);
      setSaved(true);
    } catch (err) {
      console.error('Failed to update display name', err);
      setError('Could not update your display name. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return { user, ready, name, setName, canSave, saving, saved, error, save };
};
