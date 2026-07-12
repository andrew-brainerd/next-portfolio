'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

import { createBuzzedGame } from '@/api/buzzed';
import { BUZZED_ROUTE } from '@/constants/routes';
import {
  BUZZED_PLAYER_COLORS,
  BUZZED_TARGET_DESCRIPTIONS,
  BUZZED_TARGET_LABELS,
  DEFAULT_BUZZED_SETTINGS
} from '@/constants/buzzed';
import { ColorPicker } from '@/components/buzzed/ColorPicker';
import type { BuzzedTarget } from '@/types/buzzed';

const TARGETS: BuzzedTarget[] = ['host', 'roku'];

export const NewGameForm = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [target, setTarget] = useState<BuzzedTarget>('host');
  const [rokuDeviceIp, setRokuDeviceIp] = useState('');
  const [wrongPenalty, setWrongPenalty] = useState(DEFAULT_BUZZED_SETTINGS.wrongPenalty);
  const [color, setColor] = useState<string>(BUZZED_PLAYER_COLORS[0]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsRoku = target === 'roku';
  const canSubmit = !pending && (!needsRoku || rokuDeviceIp.trim().length > 0);

  const onSubmit = async () => {
    setPending(true);
    setError(null);
    try {
      const game = await createBuzzedGame({
        name: name.trim() || undefined,
        target,
        rokuDeviceIp: needsRoku ? rokuDeviceIp.trim() : undefined,
        settings: { ...DEFAULT_BUZZED_SETTINGS, wrongPenalty },
        color
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
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-600 focus:border-brand-500 focus:outline-none"
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
                onChange={() => setTarget(option)}
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
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-white placeholder:text-neutral-600 focus:border-brand-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Someone in the room needs the Buzzed app running to control the TV.
          </p>
        </div>
      )}

      <fieldset>
        <legend className="mb-1.5 text-sm text-neutral-300">Your buzzer colour</legend>
        <ColorPicker value={color} onChange={setColor} />
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 text-sm text-neutral-300">Wrong answers</legend>
        <div className="flex gap-2">
          {[0, 1].map(penalty => (
            <button
              key={penalty}
              type="button"
              onClick={() => setWrongPenalty(penalty)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                wrongPenalty === penalty
                  ? 'border-brand-500 bg-brand-600/10 text-white'
                  : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'
              }`}
            >
              {penalty === 0 ? 'Cost nothing' : 'Cost a point'}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          Either way, a wrong answer locks you out of that question.
        </p>
      </fieldset>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button fullWidth variant="contained" disabled={!canSubmit} onClick={onSubmit}>
        Create game
      </Button>
    </div>
  );
};
