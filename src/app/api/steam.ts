import { OwnedGame, PlayerSummary } from 'types/steam';
import { MY_STEAM_ID, STEAM_API_KEY } from 'constants/steam';

const getSteamUrl = (path: string, isMultipleUsers = false, hasExtraParams = false) => {
  const route = `${path}${hasExtraParams ? '&' : '?'}key=${STEAM_API_KEY}&steamid${isMultipleUsers ? 's' : ''}=${MY_STEAM_ID}`;

  return `https://api.steampowered.com/${route}`;
};

export const getPlayerSummary = async (): Promise<PlayerSummary[]> => {
  const response = await fetch(getSteamUrl(`ISteamUser/GetPlayerSummaries/v0002`, true));
  const { response: { players } } = await response.json();

  return players;
};

export const getOwnedGames = async (): Promise<OwnedGame[]> => {
  const response = await fetch(getSteamUrl('IPlayerService/GetOwnedGames/v0001?include_appinfo=true', false, true));
  const { response: { games } } = await response.json();

  return games;
};
