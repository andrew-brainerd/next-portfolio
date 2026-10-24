'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { LOGIN_ROUTE, SETTINGS_ROUTE } from 'constants/routes';
import { linkSteamAccount } from '@/api/steamLink';
import { completeSteamSignIn } from 'utils/firebase';
import {
  STEAM_LINK_RESULT_KEY,
  STEAM_MODE_KEY,
  STEAM_REDIRECT_KEY,
  STEAM_STATE_KEY,
  openIdParams,
  safeRedirect,
  steamCallbackProblem,
  steamProblemMessage
} from 'utils/steamSignIn';

const readAndClear = (key: string): string | null => {
  try {
    const value = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
    return value;
  } catch {
    return null;
  }
};

const finishSteamSignIn = async (params: URLSearchParams): Promise<{ redirect: string } | { error: string }> => {
  const expectedState = readAndClear(STEAM_STATE_KEY);
  const redirect = safeRedirect(readAndClear(STEAM_REDIRECT_KEY));
  const linking = readAndClear(STEAM_MODE_KEY) === 'link';
  const problem = steamCallbackProblem(params, expectedState);
  if (problem) return { error: steamProblemMessage(problem) };

  if (linking) {
    const outcome = await linkSteamAccount(openIdParams(params));
    try {
      sessionStorage.setItem(STEAM_LINK_RESULT_KEY, outcome);
    } catch {}
    return { redirect: SETTINGS_ROUTE };
  }

  const response = await completeSteamSignIn(openIdParams(params));
  return response.isError ? { error: response.message } : { redirect };
};

export const SteamSignInCallback = () => {
  const search = useSearchParams();
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    finishSteamSignIn(new URLSearchParams(search.toString())).then(result => {
      if ('error' in result) setError(result.error);
      // Hard navigation so server components re-render with the new auth state.
      else window.location.replace(result.redirect);
    });
  }, [search]);

  return (
    <div className="container mx-auto max-w-md p-6 text-center">
      {error ? (
        <>
          <p className="mb-4 text-neutral-300">{error}</p>
          <Link className="underline" href={LOGIN_ROUTE}>
            Back to sign in
          </Link>
        </>
      ) : (
        <p className="text-neutral-400">Signing you in with Steam…</p>
      )}
    </div>
  );
};
