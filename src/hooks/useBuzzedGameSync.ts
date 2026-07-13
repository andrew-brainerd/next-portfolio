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

// Pusher misses are silent: `getRequest` swallows a failed refetch and returns undefined, so one dropped
// socket, one slept laptop, or one expired session leaves the UI permanently stale with no signal at all.
// Realtime is treated here as an optimisation, never as the thing correctness depends on — a reconnect,
// a re-focus, and a slow poll all reconcile against the server independently.
const RECONCILE_MS = 10_000;
const RECONCILE_DEBOUNCE_MS = 250;

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

  // Refetches race. One issued BEFORE a ring-in can return AFTER it, carrying a snapshot with no lock in
  // it — which un-pauses the video and wipes the ring-in until the next refetch puts it back. Pause,
  // un-pause, pause. Sequence-stamping every request and dropping any response that a newer one has
  // already superseded is what makes the reconcilers safe to run as often as we do.
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

    // A ring-in fans out several events at once. The payloads have already been applied instantly; the
    // refetch behind them is only reconciliation, so collapse a burst into one request instead of racing
    // half a dozen round-trips against each other.
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

    // A reconnect means we were deaf for a while with no idea what we missed.
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
      // Must be the Pusher instance method, never `channel.unsubscribe()`. The channel method leaves the
      // subscription pending-but-uncancelled, so the next subscribe() sends nothing and the client sits
      // silently deaf. React StrictMode tears effects down mid-subscription, hitting exactly that path.
      leaveChannel(name);
    };
  }, [gameId, refetch]);

  return { refetch };
};
