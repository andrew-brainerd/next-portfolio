import spotifyApi from '@/api/spotify-api';
import type { NowPlaying } from '@/types/peapod';

export const getSpotifyAuthUrl = () => spotifyApi.get<{ authUrl: string }>('/spotify/auth').then(r => r.data);

export const getSpotifyProfile = () => spotifyApi.get('/spotify/profile').then(r => r.data);

export const getMyTopTracks = () => spotifyApi.get('/spotify/myTopTracks').then(r => r.data);

export const getMyDevices = () => spotifyApi.get('/spotify/myDevices').then(r => r.data);

export const getMyNowPlaying = () => spotifyApi.get<NowPlaying>('/spotify/myNowPlaying').then(r => r.data);

export const transferPlayback = (devices: string[], shouldPlay = false) =>
  spotifyApi.put('/spotify/transferPlayback', { devices, shouldPlay }).then(r => r.data);

export const play = (options?: { uris?: string[] }) => spotifyApi.put('/spotify/play', options || {}).then(r => r.data);

export const pause = () => spotifyApi.put('/spotify/pause').then(r => r.data);

export const skipToNext = () => spotifyApi.post('/spotify/next').then(r => r.data);

export const searchSpotify = (searchText: string) =>
  spotifyApi.post('/spotify/search', { searchText, types: ['track'] }).then(r => r.data);

export const getArtistDetails = (artistId: string) => spotifyApi.get(`/spotify/artist/${artistId}`).then(r => r.data);

export const getAlbumDetails = (albumId: string) => spotifyApi.get(`/spotify/album/${albumId}`).then(r => r.data);
