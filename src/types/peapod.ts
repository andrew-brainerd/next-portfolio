export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface Artist {
  id?: string;
  uri?: string;
  name: string;
}

export interface SpotifyAlbum {
  id?: string;
  uri?: string;
  images: SpotifyImage[];
  name?: string;
}

export interface SpotifyTrack {
  uri: string;
  name: string;
  artists: Artist[];
  album: SpotifyAlbum;
  duration_ms: number;
  preview_url: string | null;
}

export interface SpotifyProfile {
  id: string;
  display_name: string;
  images: SpotifyImage[];
}

export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
}

export interface NowPlaying {
  id?: number;
  is_playing?: boolean;
  progress_ms?: number;
  item?: SpotifyTrack;
}

export interface PodMember {
  id: string;
  display_name: string;
  name?: string;
}

export interface Pod {
  id: string;
  name?: string;
  owner: PodMember;
  members: PodMember[];
  activeMembers: string[];
  queue: SpotifyTrack[];
  history: SpotifyTrack[];
}

export interface PodTrack {
  id: string;
  name: string;
  artist?: string;
}

export interface PodFavorite {
  podId: string;
  trackId: string;
  track: PodTrack;
  favoritedBy: string;
  favoritedAt: string;
}

export type PodView = 'search' | 'nowPlaying' | 'queue' | 'history';

export interface ControlsOptions {
  canPlay?: boolean;
  canPause?: boolean;
  canQueue?: boolean;
}

export interface SpotifyAuth {
  accessToken: string | null;
  expireTime?: string;
}
