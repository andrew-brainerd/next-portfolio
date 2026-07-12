'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

import { getBuzzedGame, startBuzzedGame } from '@/api/buzzed';
import { getChannel } from '@/utils/pusher';
import {
  BUZZED_GAME_UPDATED,
  BUZZED_TARGET_LABELS,
  DEFAULT_BUZZER_COLOR,
  buzzedChannelName
} from '@/constants/buzzed';
import type { BuzzedGame } from '@/types/buzzed';

const MIN_PLAYERS = 2;

interface GameLobbyProps {
  initialGame: BuzzedGame;
  currentUserId: string;
}

export const GameLobby = ({ initialGame, currentUserId }: GameLobbyProps) => {
  const router = useRouter();
  const [game, setGame] = useState(initialGame);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  const isHost = game.ownerUserId === currentUserId;
  const enoughPlayers = game.players.length >= MIN_PLAYERS;

  const refetch = useCallback(async () => {
    const fresh = await getBuzzedGame(game.id);
    if (!fresh) return;
    if (fresh.status !== 'lobby') {
      router.refresh();
      return;
    }
    setGame(fresh);
  }, [game.id, router]);

  useEffect(() => {
    const channel = getChannel(buzzedChannelName(initialGame.id));
    channel.bind(BUZZED_GAME_UPDATED, refetch);
    return () => {
      channel.unbind(BUZZED_GAME_UPDATED, refetch);
      channel.unsubscribe();
    };
  }, [initialGame.id, refetch]);

  const onStart = async () => {
    setPending(true);
    try {
      await startBuzzedGame(game.id);
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  const onCopy = async () => {
    await navigator.clipboard.writeText(game.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-5 text-center">
        <p className="mb-1 text-sm text-neutral-400">Share this code to let people in</p>
        <button
          type="button"
          onClick={onCopy}
          className="font-mono text-4xl font-bold tracking-[0.3em] text-white transition-colors hover:text-brand-400"
        >
          {game.joinCode}
        </button>
        <p className="mt-2 h-4 text-xs text-neutral-500">{copied ? 'Copied' : 'Tap to copy'}</p>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60">
        <div className="border-b border-neutral-800 px-4 py-2">
          <h2 className="text-sm font-medium text-neutral-300">
            Players ({game.players.length})
            {!enoughPlayers && <span className="ml-2 text-xs text-neutral-500">need at least {MIN_PLAYERS}</span>}
          </h2>
        </div>
        <ul>
          {game.players.map(player => (
            <li
              key={player.userId}
              className="flex items-center gap-2.5 border-b border-neutral-800/60 px-4 py-2.5 text-sm text-white last:border-b-0"
            >
              <span
                aria-hidden
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: player.color ?? DEFAULT_BUZZER_COLOR }}
              />
              <span className="flex-1 truncate">{player.displayName}</span>
              {player.userId === game.ownerUserId && <span className="text-xs text-neutral-500">host</span>}
              {player.userId === currentUserId && <span className="text-xs text-neutral-500">you</span>}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-center text-sm text-neutral-500">
        Playing on: {BUZZED_TARGET_LABELS[game.target]}
        {game.settings.wrongPenalty > 0 && ` · wrong answers cost ${game.settings.wrongPenalty}`}
      </p>

      {isHost ? (
        <Button fullWidth variant="contained" disabled={pending || !enoughPlayers} onClick={onStart}>
          Start game
        </Button>
      ) : (
        <p className="text-center text-sm text-neutral-400">Waiting for the host to start…</p>
      )}
    </div>
  );
};
