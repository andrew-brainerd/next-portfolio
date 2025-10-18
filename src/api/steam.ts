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

    if (!response.ok) {
      console.error(`Steam API error: ${response.status} ${response.statusText}`);
      return { personaname: 'Invalid User' };
    }

    const data = await response.json();

    if (!data?.response?.players) {
      console.error('Invalid Steam API response structure');
      return { personaname: 'Invalid User' };
    }

    const player = data.response.players[0] ?? { personaname: 'Invalid User' };

    return player;
  } catch (error) {
    console.error('Failed to fetch player summary:', error instanceof Error ? error.message : error);
    return { personaname: 'Invalid User' };
  }
};

export const getOwnedGames = async (steamId?: string): Promise<OwnedGame[]> => {
  try {
    const response = await fetch(
      getSteamUrl('IPlayerService/GetOwnedGames/v0001?include_appinfo=true', steamId, false, true),
      steamFetchOpts
    );

    if (!response.ok) {
      console.error(`Steam API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();

    if (!data?.response?.games) {
      console.error('Invalid Steam API response structure');
      return [];
    }

    return data.response.games;
  } catch (error) {
    console.error('Failed to fetch owned games:', error instanceof Error ? error.message : error);
    return [];
  }
};

export const getRecentGames = async (steamId?: string): Promise<OwnedGame[]> => {
  try {
    const response = await fetch(
      getSteamUrl('IPlayerService/GetRecentlyPlayedGames/v0001', steamId, false, false),
      steamFetchOpts
    );

    if (!response.ok) {
      console.error(`Steam API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();

    if (!data?.response?.games) {
      console.error('Invalid Steam API response structure');
      return [];
    }

    return data.response.games;
  } catch (error) {
    console.error('Failed to fetch recent games:', error instanceof Error ? error.message : error);
    return [];
  }
};
