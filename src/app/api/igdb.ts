import { fetchTwitchAuth } from 'app/api/twitch';
import { SearchGame } from 'types/igdb';

const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } = process.env;

const baseUrl = 'https://api.igdb.com/v4';

export const igdbRequest = async (url: string, body = '') => {
  const { token } = await fetchTwitchAuth();

  try {
    const data = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'text/plain',
        'Client-ID': TWITCH_CLIENT_ID || '',
        'Authorization': `Bearer ${token}`
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body
    });

    if (!data.ok) {
      console.error('Error fetching IGDB data');
    }

    return data.json();
  } catch (error) {
    return new Promise(res => res({ token: '', expiration: 0 }));
  }
};

export const searchGames = async (name: string) => {
  const url = `${baseUrl}/games`;
  const body = `search "${name}"; fields: name,artworks,cover;`;
  const games = (await igdbRequest(url, body)) as SearchGame[];

  return games;
};
