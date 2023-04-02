const baseUrl = 'https://api.rawg.io/api';

const { RAWG_API_KEY } = process.env;

export interface Params {
  [param: string]: any;
}

interface GameMedia {
  image: string;
  color: string;
}

interface SearchGame {
  name: string;
  background_image: string;
  dominant_color: string;
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
  console.log('Searching games', RAWG_API_KEY);

  const response = await fetch(getRawgUrl('games', { search: name }));
  const data = await response.json() as SearchGamesResponse;

  return data;
};

export const getGameMedia = async (name: string): Promise<GameMedia> => {
  const { results } = await searchGames(name);

  const { background_image, dominant_color } = results[0];

  return { image: background_image, color: dominant_color };
};
