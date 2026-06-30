'use client';

import { useRef, useState } from 'react';

import { useProfilePicture } from 'hooks/useProfilePicture';
import { UserAvatar } from 'components/UserAvatar';
import { AvatarCropDialog } from 'components/settings/AvatarCropDialog';

export const ProfilePictureSettings = () => {
  const { user, ready, photoURL, busy, error, upload, remove } = useProfilePicture();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // The Account section's DisplayNameSettings already renders the signed-out
  // prompt, so stay quiet here when there's no user.
  if (!ready || !user) return null;

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = ''; // allow re-picking the same file later
  };

  const handleCropped = async (blob: Blob) => {
    await upload(blob);
    setPendingFile(null);
  };

  return (
    <div className="mb-6 flex items-center gap-4">
      <UserAvatar
        photoURL={photoURL}
        displayName={user.displayName}
        email={user.email}
        size={64}
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Working…' : photoURL ? 'Change picture' : 'Upload picture'}
          </button>
          {photoURL && (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="rounded-lg px-4 py-2 text-sm text-neutral-300 transition-colors hover:text-white disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-sm text-neutral-500">JPG or PNG. Square works best.</p>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handlePick}
      />

      {pendingFile && (
        <AvatarCropDialog
          file={pendingFile}
          onCancel={() => setPendingFile(null)}
          onCropped={handleCropped}
        />
      )}
    </div>
  );
};
