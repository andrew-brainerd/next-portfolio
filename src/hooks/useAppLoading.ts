import { create } from 'zustand';

interface AppLoadingStore {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const useAppLoading = create<AppLoadingStore>(set => ({
  isLoading: false,
  setIsLoading: isLoading => set({ isLoading })
}));
