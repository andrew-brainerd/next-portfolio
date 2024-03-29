import { OwnedGame, PlayerSummary } from 'types/steam';
import { MY_STEAM_ID, STEAM_API_KEY } from 'constants/steam';

const steamFetchOpts = { next: { revalidate: 3600 } };

const getSteamUrl = (path: string, steamId?: string, isMultipleUsers = false, hasExtraParams = false) => {
  const route = `${path}${hasExtraParams ? '&' : '?'}key=${STEAM_API_KEY}&steamid${isMultipleUsers ? 's' : ''}=${
    steamId ?? MY_STEAM_ID
  }`;

  return `https://api.steampowered.com/${route}`;
};

export const getPlayerSummary = async (steamId?: string): Promise<Partial<PlayerSummary>> => {
  try {
    const response = await fetch(getSteamUrl(`ISteamUser/GetPlayerSummaries/v0002`, steamId, true), steamFetchOpts);

    const {
      response: { players }
    } = await response.json();

    const player = players[0] ?? { personaname: 'Invalid User' };

    return player;
  } catch (error) {
    return new Promise(res => res({ personaname: 'Invalid User' }));
  }
};

export const getOwnedGames = async (steamId?: string): Promise<OwnedGame[]> => {
  try {
    const response = await fetch(
      getSteamUrl('IPlayerService/GetOwnedGames/v0001?include_appinfo=true', steamId, false, true),
      steamFetchOpts
    );
    const {
      response: { games }
    } = await response.json();

    return games;
  } catch (error) {
    return new Promise(res => res([]));
  }
};

export const getRecentGames = async (steamId?: string): Promise<OwnedGame[]> => {
  try {
    const response = await fetch(
      getSteamUrl('IPlayerService/GetRecentlyPlayedGames/v0001', steamId, false, false),
      steamFetchOpts
    );

    const {
      response: { games }
    } = await response.json();

    return games;
  } catch (error) {
    return new Promise(res => res([]));
  }
};
