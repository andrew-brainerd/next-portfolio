'use client';

import { buzzBuzzedGame, resolveBuzzedQuestion } from '@/api/buzzed';
import { brainerdDirectPost, canCallBrainerdDirectly } from '@/utils/brainerdDirect';
import type { BuzzResponse, BuzzedGame } from '@/types/buzzed';

// The two calls on the interactive path. Everything else in Buzzed stays on the house `'use server'`
// pattern; these two are worth the deviation because the extra Next hop lands *before* the server can
// arbitrate the ring-in, so it delays the winner and — via the fan-out — everyone else's pause.
//
// Both fall back to the server action if the session cookie isn't readable, so the game degrades to
// "slower" rather than "broken".

export const buzzNow = async (
  gameId: string,
  questionIndex: number,
  positionSec?: number
): Promise<BuzzResponse> => {
  if (canCallBrainerdDirectly()) {
    return brainerdDirectPost<BuzzResponse>(`/buzzed/games/${gameId}/buzz`, {
      questionIndex,
      positionSec
    });
  }

  return buzzBuzzedGame(gameId, questionIndex, positionSec);
};

export const resolveNow = async (gameId: string, correct: boolean): Promise<BuzzedGame> => {
  if (canCallBrainerdDirectly()) {
    return brainerdDirectPost<BuzzedGame>(`/buzzed/games/${gameId}/resolve`, { correct });
  }

  return resolveBuzzedQuestion(gameId, correct);
};
