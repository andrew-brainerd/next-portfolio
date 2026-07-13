'use client';

import { useEffect, useRef, useState } from 'react';

import {
  YT_EMBED_BLOCKED,
  YT_PLAYING,
  type YouTubePlayer,
  loadYouTubeIframeApi
} from '@/utils/youtubeIframe';
import { youTubeWatchUrl } from '@/utils/buzzed';
import type { BuzzedGame } from '@/types/buzzed';

const SEEK_THRESHOLD_SEC = 2;
const AUTOPLAY_GRACE_MS = 1500;

interface HostVideoProps {
  game: BuzzedGame;
  now: number;
  onPlaybackChange: (playing: boolean, positionSec: number) => void;
}

export const HostVideo = ({ game, now, onPlaybackChange }: HostVideoProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const appliedRef = useRef<boolean | null>(null);
  const loadedVideoRef = useRef<string | undefined>(undefined);

  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);

  const { videoId } = game;

  useEffect(() => {
    if (!videoId || !mountRef.current) return;

    let cancelled = false;

    loadYouTubeIframeApi()
      .then(YT => {
        if (cancelled || !mountRef.current) return;

        playerRef.current = new YT.Player(mountRef.current, {
          videoId,
          playerVars: { playsinline: 1, rel: 0, modestbranding: 1, controls: 1 },
          events: {
            onReady: () => {
              loadedVideoRef.current = videoId;
              setReady(true);
            },
            onError: event => {
              if (YT_EMBED_BLOCKED.includes(event.data)) setBlocked(true);
            }
          }
        });
      })
      .catch(() => setBlocked(true));

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!ready || !player || !videoId || loadedVideoRef.current === videoId) return;

    loadedVideoRef.current = videoId;
    appliedRef.current = null;
    setBlocked(false);
    player.loadVideoById(videoId);
  }, [ready, videoId]);

  useEffect(() => {
    const player = playerRef.current;
    if (!ready || !player || game.status !== 'active') return;

    const { playing, positionSec, resumeAt } = game.playback;
    const shouldPlay = playing || (resumeAt != null && now >= resumeAt);

    if (!shouldPlay && Math.abs(player.getCurrentTime() - positionSec) > SEEK_THRESHOLD_SEC) {
      player.seekTo(positionSec, true);
    }

    if (appliedRef.current === shouldPlay) return;
    appliedRef.current = shouldPlay;

    if (shouldPlay) {
      player.playVideo();
      setTimeout(() => {
        if (playerRef.current?.getPlayerState() !== YT_PLAYING) setNeedsGesture(true);
      }, AUTOPLAY_GRACE_MS);
    } else {
      player.pauseVideo();
      setNeedsGesture(false);
      onPlaybackChange(false, player.getCurrentTime());
    }
  }, [ready, game.status, game.playback, now, onPlaybackChange]);

  const onTapToPlay = () => {
    playerRef.current?.playVideo();
    setNeedsGesture(false);
    onPlaybackChange(true, playerRef.current?.getCurrentTime() ?? 0);
  };

  if (!videoId) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/60">
        <p className="text-sm text-neutral-500">No video set.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-neutral-800 bg-black">
      <div className="aspect-video w-full">
        <div ref={mountRef} className="h-full w-full" />
      </div>

      {blocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-950/95 p-6 text-center">
          <p className="font-semibold text-white">This video can’t be embedded</p>
          <p className="max-w-sm text-sm text-neutral-400">
            The uploader disabled playback on other sites. Open it on YouTube and share your screen, or pick a
            different video.
          </p>
          <a
            href={youTubeWatchUrl(videoId)}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-brand-400 underline hover:text-brand-300"
          >
            Open on YouTube
          </a>
        </div>
      )}

      {needsGesture && !blocked && (
        <button
          type="button"
          onClick={onTapToPlay}
          className="absolute inset-0 flex items-center justify-center bg-neutral-950/70 text-lg font-semibold text-white"
        >
          Tap to play
        </button>
      )}
    </div>
  );
};
