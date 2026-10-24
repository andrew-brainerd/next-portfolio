export const STEAM_STATE_KEY = 'steamSignInState';
export const STEAM_REDIRECT_KEY = 'steamSignInRedirect';
// 'link' when the Steam sign-in links Steam to the account already signed in (condensate spec AC-24.11).
export const STEAM_MODE_KEY = 'steamSignInMode';
export const STEAM_LINK_RESULT_KEY = 'steamLinkResult';

export type SteamLinkOutcome = 'linked' | 'steam_linked_elsewhere' | 'account_has_steam' | 'failed';

export const steamLinkMessage = (outcome: SteamLinkOutcome): string => {
  switch (outcome) {
    case 'linked':
      return 'Steam is linked. Sign in with Steam now signs in to this account.';
    case 'steam_linked_elsewhere':
      return 'That Steam account is already linked to another brainerd.dev account.';
    case 'account_has_steam':
      return 'This account is already linked to a different Steam account. Unlink it first.';
    default:
      return 'Steam couldn’t be linked. Please try again.';
  }
};

// Only same-site paths, so a crafted redirect can't send the user off brainerd.dev after sign-in.
export const safeRedirect = (path: string | null | undefined): string => {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return '/';
  return path;
};

export const openIdParams = (search: URLSearchParams): Record<string, string> => {
  const params: Record<string, string> = {};
  search.forEach((value, key) => {
    if (key.startsWith('openid.')) params[key] = value;
  });
  return params;
};

export type SteamCallbackProblem = 'cancelled' | 'stateMismatch' | null;

export const steamCallbackProblem = (search: URLSearchParams, expectedState: string | null): SteamCallbackProblem => {
  if (search.get('openid.mode') !== 'id_res') return 'cancelled';
  const state = search.get('state');
  if (!state || !expectedState || state !== expectedState) return 'stateMismatch';
  return null;
};

export const steamProblemMessage = (problem: Exclude<SteamCallbackProblem, null>): string =>
  problem === 'cancelled'
    ? 'Steam sign-in was cancelled.'
    : 'This sign-in link has expired or was opened in a different browser. Please try again.';
