'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { getSteamLink, unlinkSteamAccount } from '@/api/steamLink';
import { SteamSignInButton } from 'components/SteamSignInButton';
import { CONDENSATE_ROUTE, SETTINGS_ROUTE } from 'constants/routes';
import { useFirebaseUser } from 'hooks/useFirebaseUser';
import { isSteamOnlyUid } from 'utils/steamOnly';
import { STEAM_LINK_RESULT_KEY, steamLinkMessage, type SteamLinkOutcome } from 'utils/steamSignIn';

const LOAD_ERROR = 'Couldn’t check your Steam link. Try again in a moment.';
const UNLINK_ERROR = 'Couldn’t unlink Steam. Try again in a moment.';

type Notice = { text: string; ok: boolean } | null;

// The outcome the Steam callback left for this page, read once.
const takeLinkNotice = (): Notice => {
  try {
    const value = sessionStorage.getItem(STEAM_LINK_RESULT_KEY) as SteamLinkOutcome | null;
    sessionStorage.removeItem(STEAM_LINK_RESULT_KEY);
    return value ? { text: steamLinkMessage(value), ok: value === 'linked' } : null;
  } catch {
    return null;
  }
};

// Link Steam to an email or Google account (condensate spec AC-24.11). Steam-only accounts don't see it.
export const SteamLinkSettings = () => {
  const { user, ready } = useFirebaseUser();
  const show = ready && !!user && !isSteamOnlyUid(user.uid);
  const [steamId, setSteamId] = useState<string | null | undefined>(undefined);
  const [notice, setNotice] = useState<Notice>(takeLinkNotice);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!show) return;
    getSteamLink().then(id => {
      setSteamId(id);
      if (id === undefined) setNotice({ text: LOAD_ERROR, ok: false });
    });
  }, [show]);

  if (!show) return null;

  const unlink = async () => {
    setBusy(true);
    await unlinkSteamAccount();
    const id = await getSteamLink();
    setSteamId(id);
    setNotice(id === null ? { text: 'Steam is unlinked.', ok: true } : { text: UNLINK_ERROR, ok: false });
    setConfirming(false);
    setBusy(false);
  };

  return (
    <section className="mb-10">
      <h2 className="mb-2 text-xl font-semibold text-neutral-200">Steam</h2>
      {steamId ? (
        <>
          <p className="mb-4 text-sm text-neutral-400">
            Linked to Steam account <span className="font-mono text-neutral-200">{steamId}</span>. Sign in with Steam
            signs in to this account, and your{' '}
            <Link href={CONDENSATE_ROUTE} className="underline">
              Condensate
            </Link>{' '}
            devices and polls live here.
          </p>
          {confirming ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-neutral-300">Unlinking signs out your Condensate devices.</p>
              <button
                type="button"
                onClick={unlink}
                disabled={busy}
                className="rounded-lg border border-red-500 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
              >
                {busy ? 'Unlinking…' : 'Unlink Steam'}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={busy}
                className="rounded-lg border border-neutral-600 px-3 py-1.5 text-sm text-neutral-200 transition-colors hover:border-neutral-400 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-lg border border-neutral-600 px-3 py-1.5 text-sm text-neutral-200 transition-colors hover:border-red-500 hover:text-red-400"
            >
              Unlink
            </button>
          )}
        </>
      ) : (
        steamId === null && (
          <>
            <p className="mb-4 text-sm text-neutral-400">
              Link your Steam account to use Condensate with this account. If you’ve already signed in with Steam, its
              Condensate devices move here.
            </p>
            <SteamSignInButton redirectRoute={SETTINGS_ROUTE} width={220} link />
          </>
        )
      )}
      {notice && <p className={`mt-3 text-sm ${notice.ok ? 'text-emerald-400' : 'text-red-400'}`}>{notice.text}</p>}
    </section>
  );
};
