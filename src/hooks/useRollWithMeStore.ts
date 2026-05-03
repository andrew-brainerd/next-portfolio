import { create } from 'zustand';
import type { RollWithMeGame, Slot } from '@/types/rollWithMe';

interface RollWithMeStore {
  game: RollWithMeGame | null;
  selectedSlot: Slot | null;
  setGame: (game: RollWithMeGame | null) => void;
  setSelectedSlot: (slot: Slot | null) => void;
  resetSelection: () => void;
}

export const useRollWithMeStore = create<RollWithMeStore>(set => ({
  game: null,
  selectedSlot: null,
  setGame: game => set({ game }),
  setSelectedSlot: slot => set({ selectedSlot: slot }),
  resetSelection: () => set({ selectedSlot: null })
}));

export const getActivePlayerUid = (game: RollWithMeGame): string | null => {
  if (game.currentPlayer === 'player1') return game.player1.uid;
  return game.player2?.uid ?? null;
};

export const isMyTurn = (game: RollWithMeGame, uid: string | null | undefined): boolean => {
  if (!uid) return false;
  return getActivePlayerUid(game) === uid;
};

export const getOpponent = (game: RollWithMeGame, uid: string | null | undefined) => {
  if (!uid) return null;
  if (game.player1.uid === uid) return game.player2;
  if (game.player2?.uid === uid) return game.player1;
  return null;
};
