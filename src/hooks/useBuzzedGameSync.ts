'use client';

import { useCallback, useEffect, useRef } from 'react';

import { getBuzzedGame } from '@/api/buzzed';
import { getChannel, leaveChannel, onPusherReconnect } from '@/utils/pusher';
import {
  BUZZED_GAME_UPDATED,
  BUZZED_GRADED,
  BUZZED_PLAYBACK_UPDATED,
  BUZZED_RANG_IN,
  BUZZED_WINDOW_CLOSED,
  buzzedChannelName
} from '@/constants/buzzed';
import type { BuzzedGame } from '@/types/buzzed';

const EVENTS = [
  BUZZED_GAME_UPDATED,
  BUZZED_RANG_IN,
  BUZZED_WINDOW_CLOSED,
  BUZZED_GRADED,
  BUZZED_PLAYBACK_UPDATED
];

// Pusher misses are silent, so realtime is an optimisation and never what correctness depends on: a
// reconnect, a re-focus, and a slow poll each reconcile against the server independently.
const RECONCILE_MS = 10_000;
const RECONCILE_DEBOUNCE_MS = 250;

export const useBuzzedGameSync = (
  gameId: string,
  onGame: (game: BuzzedGame) => void,
  // Fires the instant an event lands, before any network round-trip.
  onEvent?: (event: string, payload: unknown) => void
) => {
  // Refs so callers can pass inline callbacks without re-subscribing every render.
  const onGameRef = useRef(onGame);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onGameRef.current = onGame;
    onEventRef.current = onEvent;
  }, [onGame, onEvent]);

  // Refetches race: one issued before a ring-in can return after it and wipe it. Sequence-stamp every
  // request and drop any response a newer one has superseded.
  const seqRef = useRef(0);
  const appliedRef = useRef(0);

  const refetch = useCallback(async () => {
    const seq = (seqRef.current += 1);
    const fresh = await getBuzzedGame(gameId);
    if (!fresh) return;
    if (seq <= appliedRef.current) return;

    appliedRef.current = seq;
    onGameRef.current(fresh);
  }, [gameId]);

  useEffect(() => {
    const name = buzzedChannelName(gameId);
    const channel = getChannel(name);

    // A ring-in fans out several events at once; collapse the burst into one reconciling request.
    let pending: ReturnType<typeof setTimeout> | undefined;
    const reconcileSoon = () => {
      clearTimeout(pending);
      pending = setTimeout(refetch, RECONCILE_DEBOUNCE_MS);
    };

    const handlers = EVENTS.map(event => {
      const handler = (payload: unknown) => {
        onEventRef.current?.(event, payload);
        reconcileSoon();
      };
      channel.bind(event, handler);
      return { event, handler };
    });

    const offReconnect = onPusherReconnect(refetch);

    const onVisible = () => {
      if (document.visibilityState === 'visible') void refetch();
    };
    document.addEventListener('visibilitychange', onVisible);

    const reconcile = setInterval(refetch, RECONCILE_MS);

    return () => {
      handlers.forEach(({ event, handler }) => channel.unbind(event, handler));
      clearTimeout(pending);
      offReconnect();
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(reconcile);
      // Must be the Pusher instance method: `channel.unsubscribe()` leaves a pending subscription
      // uncancelled, so the next subscribe() sends nothing and the client goes silently deaf.
      leaveChannel(name);
    };
  }, [gameId, refetch]);

  return { refetch };
};
