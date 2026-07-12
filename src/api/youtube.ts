import type { YoutubePlaylist, YoutubePlaylistItem } from 'types/watch';
import { deleteRequest, getRequest } from 'api/client';

export const getYoutubeConnection = async (): Promise<boolean> => {
  const response = await getRequest<{ connected: boolean }>('/watch/youtube/connection');
  return response?.connected ?? false;
};

export const disconnectYoutube = async (): Promise<void> => {
  await deleteRequest('/watch/youtube/connection');
};

export const getYoutubePlaylists = async (): Promise<YoutubePlaylist[]> => {
  const response = await getRequest<{ playlists: YoutubePlaylist[] }>('/watch/youtube/playlists');
  return response?.playlists ?? [];
};

export const getYoutubePlaylistItems = async (playlistId: string): Promise<YoutubePlaylistItem[]> => {
  const response = await getRequest<{ items: YoutubePlaylistItem[] }>(`/watch/youtube/playlists/${playlistId}/items`);
  return response?.items ?? [];
};
