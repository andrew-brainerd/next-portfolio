const baseUrl = 'https://api.rawg.io/api';

const { RAWG_API_KEY } = process.env;

export interface Params {
  [param: string]: any;
}

interface GameDetails {
  image?: string;
  color: string;
  website: string;
}

interface SearchGame {
  id: number;
  name: string;
  background_image: string;
  dominant_color: string;
  stores: any[],
}

interface SearchGamesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SearchGame[];
}

const getRawgUrl = (path: string, params: Params) => {
  const apiKey = `?key=${RAWG_API_KEY}`;
  const parameters = Object.keys(params);
  const paramString = parameters.length ? parameters.map(param => `&${param}=${params[param]}`) : '';

  return `${baseUrl}/${path}${apiKey}${paramString}`;
};

export const searchGames = async (name: string): Promise<SearchGamesResponse> => {
  const response = await fetch(getRawgUrl('games', { search: name }));
  const data: SearchGamesResponse = await response.json();

  return data;
};

export const getGameDetails = async (gameId: number) => {
  const response = await fetch(getRawgUrl(`games/${gameId}`, {}));
  const data: GameDetails = await response.json();

  return data;
};

export const getGameData = async (name: string): Promise<GameDetails> => {
  const { results: searchData } = await searchGames(name);
  const gameDetails = await getGameDetails(searchData[0].id);

  const { background_image, dominant_color } = searchData[0];
  const { website } = gameDetails;

  return { image: background_image, color: dominant_color, website };
};
