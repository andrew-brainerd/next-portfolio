import { create } from 'zustand';
import type { SpotifyAuth, NowPlaying, Pod, SpotifyProfile } from '@/types/peapod';

const SPOTIFY_ACCESS_TOKEN = 'spotifyAccessToken';
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
// Access token is stored in localStorage (short-lived).
// Refresh token is stored in a secure HTTP-only cookie by the backend — never touches JS.

interface SpotifyAuthState {
  accessToken: string | null;
  expireTime: string | null;
  isRefreshing: boolean;
  setAuth: (auth: { accessToken: string | null; expireTime?: string }) => void;
  signOut: () => void;
  loadLocalAuth: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  hasAuth: () => boolean;
}

export const useSpotifyAuth = create<SpotifyAuthState>((set, get) => ({
  accessToken: null,
  expireTime: null,
  isRefreshing: false,

  setAuth: auth => {
    set({
      accessToken: auth.accessToken,
      expireTime: auth.expireTime ?? get().expireTime
    });
    if (typeof window !== 'undefined') {
      if (auth.accessToken) localStorage.setItem(SPOTIFY_ACCESS_TOKEN, auth.accessToken);
      if (auth.expireTime) localStorage.setItem(SPOTIFY_EXPIRE_TIME, auth.expireTime);
    }
  },

  signOut: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SPOTIFY_ACCESS_TOKEN);
      localStorage.removeItem(SPOTIFY_EXPIRE_TIME);
    }
    set({ accessToken: null, expireTime: null });
  },

  refreshAuth: async () => {
    if (get().isRefreshing) return false;
    set({ isRefreshing: true });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BRAINERD_API_URL}/spotify/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!res.ok) {
        set({ isRefreshing: false });
        return false;
      }

      const data = await res.json();
      const { access_token, expires_in } = data;

      if (access_token) {
        const expireTime = calculateExpireTime(expires_in);
        get().setAuth({ accessToken: access_token, expireTime });
        set({ isRefreshing: false });
        return true;
      }

      set({ isRefreshing: false });
      return false;
    } catch {
      set({ isRefreshing: false });
      return false;
    }
  },

  loadLocalAuth: async () => {
    if (typeof window === 'undefined') return;

    const accessToken = localStorage.getItem(SPOTIFY_ACCESS_TOKEN);
    const expireTime = localStorage.getItem(SPOTIFY_EXPIRE_TIME);

    if (accessToken) {
      const isExpired = expireTime
        ? (new Date(expireTime).getTime() - Date.now()) / 60000 < REFRESH_THRESHOLD_MIN
        : true;

      if (!isExpired) {
        set({ accessToken, expireTime });
        return;
      }
    }

    // Access token missing or expired — try refreshing via the HTTP-only cookie
    await get().refreshAuth();
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
