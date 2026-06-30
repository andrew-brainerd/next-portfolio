'use client';

import Link from 'next/link';

import { useDisplayName } from 'hooks/useDisplayName';
import { LOGIN_ROUTE } from 'constants/routes';

export const DisplayNameSettings = () => {
  const { user, ready, name, setName, canSave, saving, saved, error, save } = useDisplayName();

  if (!ready) return null;

  if (!user) {
    return (
      <p className="text-sm text-neutral-400">
        <Link
          href={`${LOGIN_ROUTE}?from=/settings`}
          className="text-brand-400 underline hover:text-brand-300"
        >
          Sign in
        </Link>{' '}
        to manage your account.
      </p>
    );
  }

  return (
    <div className="max-w-md">
      <label htmlFor="displayName" className="mb-1 block text-sm text-neutral-300">
        Display name
      </label>
      <div className="flex items-center gap-2">
        <input
          id="displayName"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="The name others see"
          disabled={saving}
          className="flex-1 rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-brand-500 focus:outline-none disabled:opacity-60"
        />
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      <p className="mt-2 text-sm text-neutral-500">
        Shown on shared pages like Scorebook and Roll With Me.
      </p>
      {saved && <p className="mt-1 text-sm text-green-400">Saved.</p>}
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};
