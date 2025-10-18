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
  stores: any[];
}

interface SearchGamesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SearchGame[];
}

const getRawgUrl = (path: string, params: Params): string => {
  const apiKey = `?key=${RAWG_API_KEY}`;
  const parameters = Object.keys(params);
  const paramString = parameters.length ? parameters.map(param => `&${param}=${params[param]}`) : '';

  return `${baseUrl}/${path}${apiKey}${paramString}`;
};

export const searchGames = async (name: string): Promise<SearchGamesResponse> => {
  try {
    const response = await fetch(getRawgUrl('games', { search: name }));

    if (!response.ok) {
      console.error(`RAWG API error: ${response.status} ${response.statusText}`);
      return { count: 0, next: null, previous: null, results: [] };
    }

    const data: SearchGamesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to search games:', error instanceof Error ? error.message : error);
    return { count: 0, next: null, previous: null, results: [] };
  }
};

export const getGameDetails = async (gameId: number): Promise<GameDetails | null> => {
  try {
    const response = await fetch(getRawgUrl(`games/${gameId}`, {}));

    if (!response.ok) {
      console.error(`RAWG API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: GameDetails = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to get game details:', error instanceof Error ? error.message : error);
    return null;
  }
};

export const getGameData = async (name: string): Promise<GameDetails | null> => {
  try {
    const { results: searchData } = await searchGames(name);

    if (!searchData || searchData.length === 0) {
      console.error('No game found with name:', name);
      return null;
    }

    const gameDetails = await getGameDetails(searchData[0].id);

    if (!gameDetails) {
      return null;
    }

    const { background_image, dominant_color } = searchData[0];
    const { website } = gameDetails;

    return { image: background_image, color: dominant_color, website };
  } catch (error) {
    console.error('Failed to get game data:', error instanceof Error ? error.message : error);
    return null;
  }
};
