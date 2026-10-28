// Messages for the /link page. Approving a code can fail for reasons that have nothing to do
// with the code, so each failure says what actually happened.

import { LINK_ROUTE } from '@/constants/routes';

type ApproveFailure = { status: number; title?: string; reason?: string };

export const linkSuccessMessage = (kind?: string): string => {
  if (kind === 'charter') {
    return 'Charter Forever is paired. The app finishes setting up in a few seconds; you can close this page.';
  }
  if (kind === 'condensate') {
    return 'Condensate is now signed in to your account. The app updates in a few seconds, so you can close this page.';
  }
  if (kind === 'drewtube') {
    return 'DrewTube is now syncing with your account. You can close this page.';
  }
  return 'Device linked! It should continue in a few seconds.';
};

// A code from ?code= (the QR link an app shows), kept to the characters a code can contain.
export const codeFromQuery = (value: string | string[] | undefined): string =>
  typeof value === 'string'
    ? value
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, '')
        .slice(0, 9)
    : '';

export const linkPath = (code?: string): string =>
  code ? `${LINK_ROUTE}?code=${encodeURIComponent(code)}` : LINK_ROUTE;

const steamRequired = (result: ApproveFailure) => result.status === 400 && result.reason === 'steamRequired';

// brainerd-api answers an expired session with 500 "Authentication failed", not 401.
export const needsSignIn = (result: ApproveFailure): boolean =>
  steamRequired(result) ||
  result.status === 401 ||
  result.status === 403 ||
  (result.status === 500 && result.title === 'Authentication failed');

export const linkErrorMessage = (result: ApproveFailure): string => {
  if (steamRequired(result)) {
    return 'Condensate uses your Steam account. Sign in with Steam, or link Steam in Settings, then enter the code again.';
  }
  if (result.status === 400) {
    return 'That code is invalid or has expired. Codes last 15 minutes; get a new one from your device or app and try again.';
  }
  if (needsSignIn(result)) return 'Your sign-in has expired. Sign in again, then enter the code.';
  if (result.status === 0) return "Couldn't reach brainerd.dev. Check your connection and try again.";
  return `Something went wrong on brainerd.dev (error ${result.status}). Try again in a moment.`;
};
