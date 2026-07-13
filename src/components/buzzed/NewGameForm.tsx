'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

import { createBuzzedGame } from '@/api/buzzed';
import { BUZZED_ROUTE } from '@/constants/routes';
import {
  ANSWER_WINDOW_CHOICES,
  BUZZED_PLAYER_COLORS,
  BUZZED_TARGET_DESCRIPTIONS,
  BUZZED_TARGET_LABELS,
  DEFAULT_BUZZED_SETTINGS
} from '@/constants/buzzed';
import { ColorPicker } from '@/components/buzzed/ColorPicker';
import { VideoLinkInput } from '@/components/buzzed/VideoLinkInput';
import { parseYouTubeVideoId } from '@/utils/buzzed';
import type { BuzzedTarget } from '@/types/buzzed';

const TARGETS: BuzzedTarget[] = ['host', 'roku'];

export const NewGameForm = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [target, setTarget] = useState<BuzzedTarget>('host');
  const [rokuDeviceIp, setRokuDeviceIp] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [answerWindowMs, setAnswerWindowMs] = useState(DEFAULT_BUZZED_SETTINGS.answerWindowMs);
  const [color, setColor] = useState<string>(BUZZED_PLAYER_COLORS[0]);
  const [hostPlaying, setHostPlaying] = useState(false);

  const onChangeTarget = (next: BuzzedTarget) => {
    setTarget(next);
    setHostPlaying(next !== 'host');
  };
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsRoku = target === 'roku';
  const videoId = parseYouTubeVideoId(videoUrl);
  const videoInvalid = videoUrl.trim().length > 0 && !videoId;

  const canSubmit = !pending && !videoInvalid && (!needsRoku || rokuDeviceIp.trim().length > 0);

  const onSubmit = async () => {
    setPending(true);
    setError(null);
    try {
      const game = await createBuzzedGame({
        name: name.trim() || undefined,
        target,
        rokuDeviceIp: needsRoku ? rokuDeviceIp.trim() : undefined,
        settings: { answerWindowMs },
        color: hostPlaying ? color : undefined,
        videoId: videoId ?? undefined,
        hostPlaying
      });
      router.push(`${BUZZED_ROUTE}/${game.id}`);
    } catch {
      setError('Couldn’t create the game. Try again.');
      setPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm text-neutral-300">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Anime quiz night"
          className="text-base w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-600 focus:border-brand-500 focus:outline-none"
        />
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm text-neutral-300">Where does the video play?</legend>
        <div className="space-y-2">
          {TARGETS.map(option => (
            <label
              key={option}
              className={`flex cursor-pointer gap-3 rounded-md border p-3 transition-colors ${
                target === option
                  ? 'border-brand-500 bg-brand-600/10'
                  : 'border-neutral-700 hover:border-neutral-600'
              }`}
            >
              <input
                type="radio"
                name="target"
                value={option}
                checked={target === option}
                onChange={() => onChangeTarget(option)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm text-white">{BUZZED_TARGET_LABELS[option]}</span>
                <span className="block text-xs text-neutral-500">{BUZZED_TARGET_DESCRIPTIONS[option]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {needsRoku && (
        <div>
          <label htmlFor="roku" className="mb-1.5 block text-sm text-neutral-300">
            Roku IP address
          </label>
          <input
            id="roku"
            type="text"
            value={rokuDeviceIp}
            onChange={e => setRokuDeviceIp(e.target.value)}
            placeholder="192.168.4.61"
            className="text-base w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-white placeholder:text-neutral-600 focus:border-brand-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Someone in the room needs the Buzzed app running to control the TV.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="video" className="mb-1.5 block text-sm text-neutral-300">
          YouTube link
        </label>
        <VideoLinkInput value={videoUrl} onChange={setVideoUrl} />
        <p className="mt-1 text-xs text-neutral-500">
          {needsRoku
            ? 'This is what gets cast to the TV. You can change it before you start.'
            : 'This is what you’ll play on your screen. You can change it before you start.'}
        </p>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm text-neutral-300">Are you playing?</legend>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setHostPlaying(true)}
            className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
              hostPlaying
                ? 'border-brand-500 bg-brand-600/10 text-white'
                : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'
            }`}
          >
            I’m playing
          </button>
          <button
            type="button"
            onClick={() => setHostPlaying(false)}
            className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
              !hostPlaying
                ? 'border-brand-500 bg-brand-600/10 text-white'
                : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'
            }`}
          >
            Just running it
          </button>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          {hostPlaying
            ? 'You get a buzzer and appear on the scoreboard.'
            : 'No buzzer, no scoreboard — you just play the video and run the game.'}
        </p>
      </fieldset>

      {hostPlaying && (
        <fieldset>
          <legend className="mb-1.5 text-sm text-neutral-300">Your buzzer colour</legend>
          <ColorPicker value={color} onChange={setColor} />
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-1.5 text-sm text-neutral-300">Answering window</legend>
        <div className="flex gap-2">
          {ANSWER_WINDOW_CHOICES.map(ms => (
            <button
              key={ms}
              type="button"
              onClick={() => setAnswerWindowMs(ms)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                answerWindowMs === ms
                  ? 'border-brand-500 bg-brand-600/10 text-white'
                  : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'
              }`}
            >
              {ms / 1000}s
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          How long the video pauses after the first ring-in. Others can still ring in during it, and you can
          always resume early.
        </p>
      </fieldset>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button fullWidth variant="contained" disabled={!canSubmit} onClick={onSubmit}>
        Create game
      </Button>
    </div>
  );
};
