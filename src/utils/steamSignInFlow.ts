import { startSteamSignIn } from 'utils/firebase';
import { STEAM_MODE_KEY, STEAM_REDIRECT_KEY, STEAM_STATE_KEY, safeRedirect } from 'utils/steamSignIn';

// Sends the browser to Steam; returns a message instead when it can't.
export const beginSteamSignIn = async (redirectRoute: string, mode: 'signIn' | 'link'): Promise<string | null> => {
  const started = await startSteamSignIn();
  if (!started) return 'Could not reach Steam sign-in. Please try again.';
  try {
    sessionStorage.setItem(STEAM_STATE_KEY, started.state);
    sessionStorage.setItem(STEAM_REDIRECT_KEY, safeRedirect(redirectRoute));
    if (mode === 'link') sessionStorage.setItem(STEAM_MODE_KEY, 'link');
    else sessionStorage.removeItem(STEAM_MODE_KEY);
  } catch {
    return 'Steam sign-in needs browser storage turned on.';
  }
  window.location.href = started.url;
  return null;
};
