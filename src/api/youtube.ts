import type { YoutubePlaylist, YoutubePlaylistItem } from 'types/watch';
import { deleteRequest, getRequest, postRequest } from 'api/client';

export interface YoutubeImportResult {
  imported: number;
  skipped: number;
}

export interface YoutubeSyncResult extends YoutubeImportResult {
  playlistFound?: boolean;
  connected?: boolean;
  // Set when the sync request itself failed (e.g. the server couldn't reach YouTube). Detail is logged
  // server-side; this is a short message for the UI.
  error?: string;
}

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

export const importYoutubeVideos = async (videoIds: string[]): Promise<YoutubeImportResult> => {
  const response = await postRequest<{ videoIds: string[] }, YoutubeImportResult>('/watch/youtube/import', {
    videoIds
  });
  return response ?? { imported: 0, skipped: 0 };
};

// Import net-new videos from the connected account's "Watchlist" playlist (auto-sync on open). Never
// throws — a failure comes back as `{ error }` so the caller can surface it instead of silently dropping it.
export const syncYoutubeWatchlist = async (): Promise<YoutubeSyncResult> => {
  try {
    const response = await postRequest<Record<string, never>, YoutubeSyncResult>('/watch/youtube/sync', {});
    return response ?? { imported: 0, skipped: 0 };
  } catch (e) {
    const body = (e as { response?: { data?: { title?: string; message?: string; error?: { message?: string } } } })
      ?.response?.data;
    return {
      imported: 0,
      skipped: 0,
      error: body?.error?.message || body?.title || body?.message || 'Sync request failed'
    };
  }
};
