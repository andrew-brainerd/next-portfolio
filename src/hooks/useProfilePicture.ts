'use client';

import { useState } from 'react';
import { updateProfile, type User } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { useFirebaseUser } from 'hooks/useFirebaseUser';
import { firebaseAuth, firebaseStorage } from '@/utils/firebase';

interface UseProfilePicture {
  user: User | null;
  ready: boolean;
  photoURL: string | null;
  busy: boolean;
  error: string | null;
  upload: (blob: Blob) => Promise<void>;
  remove: () => Promise<void>;
}

// Self-service profile-picture editing, mirroring the tailboard flow: upload the
// (already-cropped) image straight to Firebase Storage at profilePics/{uid} from
// the client, then persist the download URL onto the Firebase Auth user via
// updateProfile({ photoURL }) — no backend endpoint, no cookie re-bake. Re-uploads
// overwrite the same object; the new download token busts the URL cache.
export const useProfilePicture = (): UseProfilePicture => {
  const { user, ready } = useFirebaseUser();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (blob: Blob) => {
    const current = firebaseAuth.currentUser;
    if (!current) return;
    setBusy(true);
    setError(null);
    try {
      const storageRef = ref(firebaseStorage, `profilePics/${current.uid}`);
      await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
      const url = await getDownloadURL(storageRef);
      await updateProfile(current, { photoURL: url });
      await current.reload();
    } catch (err) {
      console.error('Failed to upload profile picture', err);
      setError('Could not upload your picture. Please try again.');
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const current = firebaseAuth.currentUser;
    if (!current) return;
    setBusy(true);
    setError(null);
    try {
      // Clear the photo on the auth profile; leave the storage object (it gets
      // overwritten on the next upload) to avoid a delete-permission dependency.
      await updateProfile(current, { photoURL: '' });
      await current.reload();
    } catch (err) {
      console.error('Failed to remove profile picture', err);
      setError('Could not remove your picture. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return { user, ready, photoURL: user?.photoURL ?? null, busy, error, upload, remove };
};
