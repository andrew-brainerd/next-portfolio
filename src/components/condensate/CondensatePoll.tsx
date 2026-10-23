'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';

import { getPoll, searchSteamStore, setPollBallot, suggestPollGame } from '@/api/condensatePolls';
import type { CondensatePoll as Poll, PollLoad, SteamStoreHit } from 'types/condensatePoll';
import { getChannel, leaveChannel, onPusherReconnect } from '@/utils/pusher';
import { formatSession, personLabel, rankedOptions, steamHeaderArt, toggleTick } from '@/utils/condensatePolls';

const ERRORS: Record<number, string> = {
  400: 'This poll is closed, or it already has as many games as it can hold.',
  401: 'Sign in with Steam to vote. Other sign-ins can’t vote in Condensate polls.',
  404: 'That poll doesn’t exist any more.'
};

// The brainerd.dev side of a Condensate game night poll: approval ticks, live counts and suggestions (FR-46).
export const CondensatePoll = ({ initial }: { initial: Poll }) => {
  const [poll, setPoll] = useState(initial);
  const [error, setError] = useState('');
  const [term, setTerm] = useState('');
  const [found, setFound] = useState<{ term: string; hits: SteamStoreHit[] }>({ term: '', hits: [] });
  const [pending, startTransition] = useTransition();
  const channel = `condensate-poll-${initial.pollId}`;

  const apply = useCallback((result: PollLoad) => {
    if (result.ok) {
      setPoll(result.poll);
      setError('');
    } else {
      setError(ERRORS[result.status] ?? 'Something went wrong. Try again.');
    }
  }, []);

  const reload = useCallback(() => {
    void getPoll(initial.pollId).then(r => r.ok && setPoll(r.poll));
  }, [initial.pollId]);

  useEffect(() => {
    getChannel(channel).bind('poll-updated', reload);
    const offReconnect = onPusherReconnect(reload);
    return () => {
      offReconnect();
      leaveChannel(channel);
    };
  }, [channel, reload]);

  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) return;
    const id = setTimeout(() => void searchSteamStore(q).then(hits => setFound({ term: q, hits })), 300);
    return () => clearTimeout(id);
  }, [term]);
  const hits = found.term === term.trim() ? found.hits : [];

  const open = poll.status === 'open';
  const winner = poll.options.find(o => o.appId === poll.leader);
  const when = formatSession(poll.sessionAt);
  const taken = new Set(poll.options.map(o => o.appId));

  const tick = (appId: number) =>
    startTransition(async () => apply(await setPollBallot(poll.pollId, toggleTick(poll.myBallot, appId))));

  const suggest = (hit: SteamStoreHit) =>
    startTransition(async () => {
      apply(await suggestPollGame(poll.pollId, hit.appId, hit.name));
      setTerm('');
    });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-400">
        <span
          className={`rounded-full px-2 py-0.5 font-medium ${open ? 'bg-green-500/15 text-green-300' : 'bg-white/10 text-neutral-300'}`}
        >
          {open ? 'Open' : 'Closed'}
        </span>
        {when && <span>{when}</span>}
        <span>Started by {personLabel(poll, poll.creatorSteamId)}</span>
      </div>

      {!open && winner && (
        <div className="flex items-center gap-4 rounded-xl border border-white/15 bg-white/5 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={steamHeaderArt(winner.appId)} alt="" className="h-14 w-28 rounded object-cover" />
          <div>
            <div className="text-xs uppercase tracking-wide text-neutral-400">Winner</div>
            <div className="text-lg font-semibold text-white">{winner.name}</div>
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-2" aria-label="Games">
        {rankedOptions(poll).map(option => {
          const ticked = poll.myBallot.includes(option.appId);
          return (
            <li
              key={option.appId}
              className={`flex items-center gap-3 rounded-xl border p-2 pr-3 ${option.appId === poll.leader ? 'border-white/30 bg-white/10' : 'border-white/10 bg-white/5'}`}
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={ticked}
                aria-label={`I'd play ${option.name}`}
                disabled={!open || pending}
                onClick={() => tick(option.appId)}
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border text-sm font-bold transition-colors disabled:opacity-40 ${ticked ? 'border-white bg-white text-black' : 'border-white/30 text-transparent'}`}
              >
                ✓
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={steamHeaderArt(option.appId)} alt="" className="h-12 w-24 shrink-0 rounded object-cover" />
              <div className="min-w-0 flex-1 text-xs text-neutral-400">
                <div className="truncate text-sm font-medium text-white">{option.name}</div>
                <div>
                  {option.voters.length} {option.voters.length === 1 ? 'vote' : 'votes'}
                  {option.voters.length > 0 && ` · ${option.voters.map(id => personLabel(poll, id)).join(', ')}`}
                </div>
                <div>
                  Owned by {option.owners.length} of {poll.participants.length}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {open && (
        <div className="flex flex-col gap-2">
          <input
            type="search"
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder="Suggest a Steam game…"
            aria-label="Search Steam for a game to suggest"
            className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white placeholder:text-neutral-500 focus:border-white/40 focus:outline-none"
          />
          {hits.filter(h => !taken.has(h.appId)).length > 0 && (
            <ul className="flex flex-col gap-1 rounded-lg bg-black/30 p-1" aria-label="Search results">
              {hits
                .filter(h => !taken.has(h.appId))
                .map(h => (
                  <li key={h.appId}>
                    <button
                      type="button"
                      onClick={() => suggest(h)}
                      disabled={pending}
                      className="flex w-full items-center gap-3 rounded px-2 py-1.5 text-left text-sm text-white hover:bg-white/10"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={steamHeaderArt(h.appId)} alt="" className="h-8 w-16 rounded object-cover" />
                      <span className="flex-1 truncate">{h.name}</span>
                      <span className="text-neutral-400">Add</span>
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <p className="text-xs text-neutral-500">
        Tick every game you’d be happy to play; the most ticks wins. Condensate shows what each game would cost you and
        how long it takes to download.
      </p>
    </div>
  );
};
