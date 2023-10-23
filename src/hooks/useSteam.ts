import { create } from 'zustand';
import { OwnedGame } from 'types/steam';

interface SteamStore {
  games: OwnedGame[];
  recentGames: OwnedGame[];
  showCompleted: boolean;
  showRecent: boolean;
  username: string;
  setGames: (games: OwnedGame[]) => void;
  setRecentGames: (recentGames: OwnedGame[]) => void;
  setShowCompleted: (showCompleted: boolean) => void;
  setShowRecent: (showRecent: boolean) => void;
  setUsername: (username: string) => void;
}

export const useSteam = create<SteamStore>(set => ({
  games: [],
  recentGames: [],
  showCompleted: false,
  showRecent: false,
  username: '',
  setGames: games => set({ games }),
  setRecentGames: recentGames => set({ recentGames }),
  setShowCompleted: showCompleted => set({ showCompleted }),
  setShowRecent: showRecent => set({ showRecent }),
  setUsername: username => set({ username })
}));
