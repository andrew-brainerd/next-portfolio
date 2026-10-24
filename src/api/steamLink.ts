'use server';

import type { AxiosError } from 'axios';

import { deleteRequest, getRequest, postRequest } from 'api/client';
import type { SteamLinkOutcome } from 'utils/steamSignIn';

// Linking Steam to an email or Google account (condensate spec AC-24.11, FR-47).

// undefined means the link couldn't be read, as opposed to null for no link.
export const getSteamLink = async (): Promise<string | null | undefined> => {
  const result = await getRequest<{ steamId: string | null }>('/auth/steam/link');
  return result ? result.steamId : undefined;
};

export const linkSteamAccount = async (params: Record<string, string>): Promise<SteamLinkOutcome> => {
  try {
    await postRequest('/auth/steam/link', { params });
    return 'linked';
  } catch (e) {
    const reason = (e as AxiosError<{ reason?: string }>).response?.data?.reason;
    return reason === 'steam_linked_elsewhere' || reason === 'account_has_steam' ? reason : 'failed';
  }
};

export const unlinkSteamAccount = async (): Promise<void> => deleteRequest('/auth/steam/link');
