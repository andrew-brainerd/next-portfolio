// Messages for the /link page. Approving a code can fail for reasons that have nothing to do
// with the code, so each failure says what actually happened.

export const linkSuccessMessage = (kind?: string): string =>
  kind === 'charter'
    ? 'Charter Forever is paired. The app finishes setting up in a few seconds; you can close this page.'
    : 'Device linked! It should continue in a few seconds.';

// brainerd-api answers an expired session with 500 "Authentication failed", not 401.
export const needsSignIn = (result: { status: number; title?: string }): boolean =>
  result.status === 401 || result.status === 403 || (result.status === 500 && result.title === 'Authentication failed');

export const linkErrorMessage = (result: { status: number; title?: string }): string => {
  if (result.status === 400) {
    return 'That code is invalid or has expired. Codes last 15 minutes; get a new one from your device or app and try again.';
  }
  if (needsSignIn(result)) return 'Your sign-in has expired. Sign in again, then enter the code.';
  if (result.status === 0) return "Couldn't reach brainerd.dev. Check your connection and try again.";
  return `Something went wrong on brainerd.dev (error ${result.status}). Try again in a moment.`;
};
