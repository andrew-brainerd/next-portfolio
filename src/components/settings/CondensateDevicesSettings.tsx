'use client';

import { useEffect, useState } from 'react';

import { getCondensateDevices, revokeCondensateDevice } from '@/api/condensateDevices';
import { useFirebaseUser } from 'hooks/useFirebaseUser';
import type { CondensateDevice } from 'types/condensateDevice';
import { deviceTitle, isSteamUid, lastUsedLabel } from 'utils/condensateDevices';

const LOAD_ERROR = 'Couldn’t load your devices. Try again in a moment.';
const REVOKE_ERROR = 'Couldn’t sign that device out. Try again in a moment.';

export const CondensateDevicesSettings = () => {
  const { user, ready } = useFirebaseUser();
  const steamUser = ready && isSteamUid(user?.uid);
  const [devices, setDevices] = useState<CondensateDevice[] | null>(null);
  const [error, setError] = useState('');
  const [revoking, setRevoking] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (!steamUser) return;
    getCondensateDevices().then(list => {
      setDevices(list);
      setError(list ? '' : LOAD_ERROR);
    });
  }, [steamUser]);

  if (!steamUser) return null;

  const revoke = async (id: string) => {
    setRevoking(id);
    setError('');
    await revokeCondensateDevice(id);
    const list = await getCondensateDevices();
    setDevices(list);
    if (!list || list.some(d => d.id === id)) setError(REVOKE_ERROR);
    setRevoking(null);
  };

  return (
    <section className="mb-10">
      <h2 className="mb-2 text-xl font-semibold text-neutral-200">Condensate devices</h2>
      <p className="mb-4 text-sm text-neutral-400">
        Computers and Steam Decks signed in to Condensate with your Steam account. A device you sign out has to sign in
        again.
      </p>
      {devices?.length === 0 && <p className="text-sm text-neutral-500">No devices are signed in.</p>}
      {devices && devices.length > 0 && (
        <ul className="max-w-md divide-y divide-neutral-700 rounded-lg border border-neutral-700">
          {devices.map(device => (
            <li key={device.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-white">{deviceTitle(device)}</p>
                <p className="text-xs text-neutral-500">{lastUsedLabel(device, now)}</p>
              </div>
              <button
                type="button"
                onClick={() => revoke(device.id)}
                disabled={revoking !== null}
                className="shrink-0 rounded-lg border border-neutral-600 px-3 py-1.5 text-sm text-neutral-200 transition-colors hover:border-red-500 hover:text-red-400 disabled:opacity-50"
              >
                {revoking === device.id ? 'Signing out…' : 'Sign out'}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </section>
  );
};
