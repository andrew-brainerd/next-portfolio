'use client';

import { useCallback, useEffect, useRef } from 'react';

import { getFrisbeeGolfRound } from '@/api/scorebook';
import { getChannel, leaveChannel, onPusherReconnect } from '@/utils/pusher';
import type { FrisbeeGolfRound } from '@/types/scorebook';

const FRISBEE_GOLF_ROUND_UPDATED = 'frisbeeGolfRoundUpdated';

// A missed Pusher event is silent: `getRequest` swallows a failed refetch and returns undefined, so a
// dropped socket, a slept phone, or an expired session leaves the round stale forever with no signal —
// on a course, with a phone in a pocket, that is the normal case rather than the edge case. Realtime is
// the fast path; these reconcilers are what make it correct.
const RECONCILE_MS = 10_000;
const RECONCILE_DEBOUNCE_MS = 250;

export const useFrisbeeGolfRoundSync = (roundId: string, onRound: (round: FrisbeeGolfRound) => void) => {
  // Held in a ref so callers can pass an inline callback without re-subscribing on every render.
  const onRoundRef = useRef(onRound);

  useEffect(() => {
    onRoundRef.current = onRound;
  }, [onRound]);

  // Refetches race. One issued before a score lands can return after it, reverting the score on screen
  // until the next refetch puts it back. Sequence-stamping and dropping superseded responses is what
  // makes it safe to reconcile as often as we do.
  const seqRef = useRef(0);
  const appliedRef = useRef(0);

  const refetch = useCallback(async () => {
    const seq = (seqRef.current += 1);
    const fresh = await getFrisbeeGolfRound(roundId);
    if (!fresh) return;
    if (seq <= appliedRef.current) return;

    appliedRef.current = seq;
    onRoundRef.current(fresh);
  }, [roundId]);

  useEffect(() => {
    const channel = getChannel(roundId);

    let pending: ReturnType<typeof setTimeout> | undefined;
    const reconcileSoon = () => {
      clearTimeout(pending);
      pending = setTimeout(refetch, RECONCILE_DEBOUNCE_MS);
    };

    channel.bind(FRISBEE_GOLF_ROUND_UPDATED, reconcileSoon);

    // A reconnect means we were deaf for a while with no idea what we missed.
    const offReconnect = onPusherReconnect(refetch);

    const onVisible = () => {
      if (document.visibilityState === 'visible') void refetch();
    };
    document.addEventListener('visibilitychange', onVisible);

    const reconcile = setInterval(refetch, RECONCILE_MS);

    return () => {
      channel.unbind(FRISBEE_GOLF_ROUND_UPDATED, reconcileSoon);
      clearTimeout(pending);
      offReconnect();
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(reconcile);
      // Must be the Pusher instance method, never `channel.unsubscribe()` — that leaves the subscription
      // pending-but-uncancelled, so the next subscribe() sends nothing and the client sits silently deaf.
      leaveChannel(roundId);
    };
  }, [roundId, refetch]);

  return { refetch };
};
