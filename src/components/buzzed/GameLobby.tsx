'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

import { setBuzzedVideo, startBuzzedGame } from '@/api/buzzed';
import { useBuzzedGameSync } from '@/hooks/useBuzzedGameSync';
import { BUZZED_ROUTE } from '@/constants/routes';
import { parseYouTubeVideoId, youTubeThumbnail, youTubeWatchUrl } from '@/utils/buzzed';
import { BUZZED_TARGET_LABELS, DEFAULT_BUZZER_COLOR } from '@/constants/buzzed';
import { GameMenu } from '@/components/buzzed/GameMenu';
import { VideoLinkInput } from '@/components/buzzed/VideoLinkInput';
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
  const [videoUrl, setVideoUrl] = useState('');
  const [savingVideo, setSavingVideo] = useState(false);

  const isHost = game.ownerUserId === currentUserId;
  const pendingVideoId = parseYouTubeVideoId(videoUrl);
  const enoughPlayers = game.players.length >= MIN_PLAYERS;

  const onSaveVideo = async () => {
    if (!pendingVideoId) return;
    setSavingVideo(true);
    try {
      const fresh = await setBuzzedVideo(game.id, pendingVideoId);
      setGame(fresh);
      setVideoUrl('');
    } finally {
      setSavingVideo(false);
    }
  };

  useBuzzedGameSync(initialGame.id, fresh => {
    if (fresh.status !== 'lobby') {
      router.refresh();
      return;
    }
    setGame(fresh);
  });

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
    const link = `${window.location.origin}${BUZZED_ROUTE}/join/${game.joinCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 truncate text-2xl font-bold text-white sm:text-3xl">{game.name}</h1>
        <GameMenu game={game} currentUserId={currentUserId} onChange={setGame} />
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-5 text-center">
        <p className="mb-1 text-sm text-neutral-400">Share this to let people in</p>
        <p className="font-mono text-4xl font-bold tracking-[0.3em] text-white">{game.joinCode}</p>
        <Button variant="outlined" size="small" className="mt-3" onClick={onCopy}>
          {copied ? 'Link copied' : 'Copy join link'}
        </Button>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60">
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
          <h2 className="text-sm font-medium text-neutral-300">
            Players ({game.players.length})
            {!enoughPlayers && <span className="ml-2 text-xs text-neutral-500">need at least {MIN_PLAYERS}</span>}
          </h2>
        </div>

        {game.players.length === 0 && (
          <p className="px-4 py-3 text-sm text-neutral-500">
            Nobody yet — send them the join link.
          </p>
        )}

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

      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60">
        <div className="border-b border-neutral-800 px-4 py-2">
          <h2 className="text-sm font-medium text-neutral-300">Video</h2>
        </div>

        <div className="space-y-3 p-4">
          {game.videoId ? (
            <a
              href={youTubeWatchUrl(game.videoId)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-md transition-colors hover:bg-neutral-800/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={youTubeThumbnail(game.videoId)}
                alt=""
                className="h-14 w-24 shrink-0 rounded object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm text-white">{game.videoTitle ?? 'YouTube video'}</p>
                <p className="truncate font-mono text-xs text-neutral-500">{game.videoId}</p>
              </div>
            </a>
          ) : (
            <p className="text-sm text-neutral-500">
              {isHost ? 'No video set yet.' : 'The host hasn’t picked a video yet.'}
            </p>
          )}

          {isHost && (
            <div className="space-y-2">
              <VideoLinkInput value={videoUrl} onChange={setVideoUrl} id="lobby-video" />
              <Button
                fullWidth
                variant="outlined"
                size="small"
                disabled={!pendingVideoId || savingVideo}
                onClick={onSaveVideo}
              >
                {game.videoId ? 'Change video' : 'Set video'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-sm text-neutral-500">
        Playing on: {BUZZED_TARGET_LABELS[game.target]}
        {` · ${game.settings.answerWindowMs / 1000}s to answer`}
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
