'use client';

import { advanceBuzzedQuestion, buzzBuzzedGame } from '@/api/buzzed';
import { brainerdDirectPost, canCallBrainerdDirectly } from '@/utils/brainerdDirect';
import type { BuzzResponse, BuzzedGame } from '@/types/buzzed';

// The two calls on the interactive path. The extra Next hop lands BEFORE the server can record the
// ring-in order, so it delays the buzzer and — via the fan-out — everyone else's pause.
// Both fall back to the server action if the session cookie isn't readable: slower, never broken.

export const buzzNow = async (gameId: string, questionIndex: number): Promise<BuzzResponse> => {
  if (canCallBrainerdDirectly()) {
    return brainerdDirectPost<BuzzResponse>(`/buzzed/games/${gameId}/buzz`, { questionIndex });
  }

  return buzzBuzzedGame(gameId, questionIndex);
};

export const advanceNow = async (gameId: string): Promise<BuzzedGame> => {
  if (canCallBrainerdDirectly()) {
    return brainerdDirectPost<BuzzedGame>(`/buzzed/games/${gameId}/advance`, {});
  }

  return advanceBuzzedQuestion(gameId);
};
