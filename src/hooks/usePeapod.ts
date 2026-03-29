import { create } from 'zustand';
import type { SpotifyAuth, NowPlaying, Pod, SpotifyProfile } from '@/types/peapod';

const SPOTIFY_ACCESS_TOKEN = 'spotifyAccessToken';
const SPOTIFY_REFRESH_TOKEN = 'spotifyRefreshToken';
const SPOTIFY_EXPIRE_TIME = 'spotifyExpireTime';
const REFRESH_THRESHOLD_MIN = 1;

export const calculateExpireTime = (expiresIn: number | string): string =>
  new Date(Date.now() + Number(expiresIn) * 1000).toISOString();

export const formatTimer = (timer: unknown): string => {
  const totalSeconds = typeof timer === 'number' ? Math.floor(timer / 1000) : 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = hours > 0 ? `${hours}:` : '';
  const mm = minutes < 10 ? `0${minutes}` : minutes;
  const ss = seconds < 10 ? `0${seconds}` : seconds;

  return `${hh}${mm}:${ss}`;
};

// --- Spotify Auth Store ---

interface SpotifyAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expireTime: string | null;
  setAuth: (auth: SpotifyAuth) => void;
  signOut: () => void;
  loadLocalAuth: () => void;
  hasAuth: () => boolean;
}

export const useSpotifyAuth = create<SpotifyAuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  expireTime: null,

  setAuth: auth => {
    set(state => ({
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken ?? state.refreshToken,
      expireTime: auth.expireTime ?? state.expireTime
    }));
    if (typeof window !== 'undefined') {
      if (auth.accessToken) localStorage.setItem(SPOTIFY_ACCESS_TOKEN, auth.accessToken);
      if (auth.refreshToken) localStorage.setItem(SPOTIFY_REFRESH_TOKEN, auth.refreshToken);
      if (auth.expireTime) localStorage.setItem(SPOTIFY_EXPIRE_TIME, auth.expireTime);
    }
  },

  signOut: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SPOTIFY_ACCESS_TOKEN);
      localStorage.removeItem(SPOTIFY_REFRESH_TOKEN);
      localStorage.removeItem(SPOTIFY_EXPIRE_TIME);
    }
    set({ accessToken: null, refreshToken: null, expireTime: null });
  },

  loadLocalAuth: () => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem(SPOTIFY_ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(SPOTIFY_REFRESH_TOKEN);
      const expireTime = localStorage.getItem(SPOTIFY_EXPIRE_TIME);

      if (accessToken) {
        const isExpired = expireTime
          ? (new Date(expireTime).getTime() - Date.now()) / 60000 < REFRESH_THRESHOLD_MIN
          : true;

        if (!isExpired) {
          set({ accessToken, refreshToken, expireTime });
        }
        // If expired, the component layer will handle refresh
      }
    }
  },

  hasAuth: () => !!get().accessToken
}));

// --- Pod Connection Store ---

interface PodConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  currentPodId: string | null;
  setConnecting: (podId: string) => void;
  setConnected: () => void;
  setDisconnected: () => void;
}

export const usePodConnection = create<PodConnectionState>(set => ({
  isConnected: false,
  isConnecting: false,
  currentPodId: null,

  setConnecting: podId => set({ isConnecting: true, isConnected: false, currentPodId: podId }),
  setConnected: () => set({ isConnecting: false, isConnected: true }),
  setDisconnected: () => set({ isConnecting: false, isConnected: false, currentPodId: null })
}));

// --- Notification Store ---

interface NotifyState {
  hidden: boolean;
  message: string;
  displayNotification: (message: string, time?: number) => void;
  closeNotification: () => void;
}

export const usePeapodNotify = create<NotifyState>(set => ({
  hidden: true,
  message: '',

  displayNotification: (message, time) => {
    const openTime = time || 3000;
    set({ hidden: false, message });
    setTimeout(() => set({ hidden: true }), openTime);
  },

  closeNotification: () => set({ hidden: true })
}));

// --- Now Playing Store (for client sync) ---

interface NowPlayingState {
  nowPlaying: NowPlaying | null;
  setNowPlaying: (np: NowPlaying) => void;
}

export const useNowPlayingSync = create<NowPlayingState>(set => ({
  nowPlaying: null,
  setNowPlaying: np => set({ nowPlaying: np })
}));
