import type { SpotifyTrack, SpotifyDevice, Artist, SearchArtist, SearchAlbum, SearchResult } from '@/types/peapod';

const PEAPOD_PLAYER_NAME = 'Peapod Web Player';

/**
 * Deduplicate an array by a key function, keeping the first occurrence.
 */
export function deduplicateByKey<T>(items: T[], keyFn: (item: T) => string): T[] {
  return [...new Map(items.map(item => [keyFn(item), item])).values()];
}

/**
 * Get the smallest available album art URL (thumbnail), falling back to the first available.
 */
export function getAlbumArtUrl(track: SpotifyTrack): string | undefined {
  return track.album?.images?.[2]?.url || track.album?.images?.[0]?.url;
}

/**
 * Format an array of artists into a comma-separated string.
 */
export function formatArtistNames(artists?: Artist[]): string {
  return (artists || []).map(a => a.name).join(', ');
}

/**
 * Score how well a name matches a search query.
 * Higher scores indicate better matches. Index penalizes lower-ranked results.
 */
export function scoreMatch(name: string, query: string, index: number): number {
  const lower = name.toLowerCase();
  const q = query.toLowerCase();
  if (lower === q) return 100 - index;
  if (lower.startsWith(q)) return 80 - index;
  if (lower.includes(q)) return 60 - index;
  return 40 - index;
}

/**
 * Sort devices with Peapod Web Player first, preserving order otherwise.
 */
export function sortDevicesWithPeapodFirst(devices: SpotifyDevice[]): SpotifyDevice[] {
  return [...devices].sort((a, b) => (a.name === PEAPOD_PLAYER_NAME ? -1 : b.name === PEAPOD_PLAYER_NAME ? 1 : 0));
}

/**
 * Build a unified, relevance-sorted search result list from Spotify search data.
 */
export function buildSearchResults(
  data: { artists?: { items: SearchArtist[] }; albums?: { items: SearchAlbum[] }; tracks?: { items: SpotifyTrack[] } },
  query: string
): SearchResult[] {
  const artists: SearchResult[] = (data?.artists?.items || []).slice(0, 5).map((a, i) => ({
    type: 'artist' as const,
    data: a,
    score: scoreMatch(a.name, query, i)
  }));
  const albums: SearchResult[] = (data?.albums?.items || []).slice(0, 5).map((a, i) => ({
    type: 'album' as const,
    data: a,
    score: scoreMatch(a.name, query, i)
  }));
  const tracks: SearchResult[] = deduplicateByKey(data?.tracks?.items || [], t => t.name)
    .slice(0, 10)
    .map((t, i) => ({
      type: 'track' as const,
      data: t,
      score: scoreMatch(t.name, query, i)
    }));
  return [...artists, ...albums, ...tracks].sort((a, b) => b.score - a.score);
}

/**
 * Deduplicate play history by track URI, keeping the most recent play.
 * Assumes input is in chronological order (oldest first).
 */
export function deduplicateHistory(history: SpotifyTrack[]): SpotifyTrack[] {
  return deduplicateByKey([...history].reverse(), t => t.uri);
}
