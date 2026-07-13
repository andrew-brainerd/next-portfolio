'use client';

import { useCallback, useEffect, useRef } from 'react';

import { getBuzzedGame } from '@/api/buzzed';
import { getChannel, leaveChannel, onPusherReconnect } from '@/utils/pusher';
import {
  BUZZED_BUZZ_LOCKED,
  BUZZED_BUZZ_REOPENED,
  BUZZED_GAME_UPDATED,
  BUZZED_PLAYBACK_UPDATED,
  BUZZED_QUESTION_RESOLVED,
  buzzedChannelName
} from '@/constants/buzzed';
import type { BuzzedGame } from '@/types/buzzed';

const EVENTS = [
  BUZZED_GAME_UPDATED,
  BUZZED_BUZZ_LOCKED,
  BUZZED_BUZZ_REOPENED,
  BUZZED_QUESTION_RESOLVED,
  BUZZED_PLAYBACK_UPDATED
];

// Pusher misses are silent: `getRequest` swallows a failed refetch and returns undefined, so one dropped
// socket, one slept laptop, or one expired session leaves the UI permanently stale with no signal at all.
// Realtime is treated here as an optimisation, never as the thing correctness depends on — a reconnect,
// a re-focus, and a slow poll all reconcile against the server independently.
const RECONCILE_MS = 10_000;

export const useBuzzedGameSync = (
  gameId: string,
  onGame: (game: BuzzedGame) => void,
  // Fires the instant an event lands, with its payload — before any network round-trip. This is what
  // makes the pause feel immediate instead of waiting on a refetch.
  onEvent?: (event: string, payload: unknown) => void
) => {
  // Held in refs so callers can pass inline callbacks without re-subscribing on every render.
  const onGameRef = useRef(onGame);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onGameRef.current = onGame;
    onEventRef.current = onEvent;
  }, [onGame, onEvent]);

  const refetch = useCallback(async () => {
    const fresh = await getBuzzedGame(gameId);
    if (fresh) onGameRef.current(fresh);
  }, [gameId]);

  useEffect(() => {
    const name = buzzedChannelName(gameId);
    const channel = getChannel(name);

    const handlers = EVENTS.map(event => {
      const handler = (payload: unknown) => {
        onEventRef.current?.(event, payload);
        void refetch();
      };
      channel.bind(event, handler);
      return { event, handler };
    });

    // A reconnect means we were deaf for a while with no idea what we missed.
    const offReconnect = onPusherReconnect(refetch);

    const onVisible = () => {
      if (document.visibilityState === 'visible') void refetch();
    };
    document.addEventListener('visibilitychange', onVisible);

    const reconcile = setInterval(refetch, RECONCILE_MS);

    return () => {
      handlers.forEach(({ event, handler }) => channel.unbind(event, handler));
      offReconnect();
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(reconcile);
      // Must be the Pusher instance method, never `channel.unsubscribe()`. The channel method leaves the
      // subscription pending-but-uncancelled, so the next subscribe() sends nothing and the client sits
      // silently deaf. React StrictMode tears effects down mid-subscription, hitting exactly that path.
      leaveChannel(name);
    };
  }, [gameId, refetch]);

  return { refetch };
};
