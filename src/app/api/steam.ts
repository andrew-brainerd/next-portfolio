import { OwnedGame, PlayerSummary } from 'types/steam';
import { MY_STEAM_ID, STEAM_API_KEY } from 'constants/steam';

const getSteamUrl = (path: string, steamId?: string, isMultipleUsers = false, hasExtraParams = false) => {
  const route = `${path}${hasExtraParams ? '&' : '?'}key=${STEAM_API_KEY}&steamid${isMultipleUsers ? 's' : ''}=${
    steamId ?? MY_STEAM_ID
  }`;

  return `https://api.steampowered.com/${route}`;
};

export const getPlayerSummary = async (steamId?: string): Promise<PlayerSummary> => {
  try {
    const response = await fetch(getSteamUrl(`ISteamUser/GetPlayerSummaries/v0002`, steamId, true));
    const {
      response: { players }
    } = await response.json();

    return players[0];
  } catch (error) {
    return new Promise(res => res({} as PlayerSummary));
  }
};

export const getOwnedGames = async (steamId?: string): Promise<OwnedGame[]> => {
  try {
    const response = await fetch(
      getSteamUrl('IPlayerService/GetOwnedGames/v0001?include_appinfo=true', steamId, false, true)
    );
    const {
      response: { games }
    } = await response.json();

    return games;
  } catch (error) {
    return new Promise(res => res([] as OwnedGame[]));
  }
};
