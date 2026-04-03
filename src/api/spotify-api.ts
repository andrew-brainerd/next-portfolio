import axios from 'axios';

const SPOTIFY_ACCESS_TOKEN_KEY = 'spotifyAccessToken';

const spotifyApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BRAINERD_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

spotifyApi.interceptors.request.use(config => {
  const token = typeof window !== 'undefined' ? localStorage.getItem(SPOTIFY_ACCESS_TOKEN_KEY) : null;
  if (token) {
    config.headers['x-spotify-token'] = token;
  }
  return config;
});

export default spotifyApi;
