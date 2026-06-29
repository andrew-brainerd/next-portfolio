'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { joinFrisbeeGolfRoundByCode } from '@/api/scorebook';
import { SCOREBOOK_FRISBEE_GOLF_ROUTE } from 'constants/routes';
import { DEFAULT_DISC_COLOR } from '@/components/scorebook/PlayerColorDot';

export const JoinByCode = () => {
  const router = useRouter();
  const { user } = useFirebaseUser();
  const [nicknameInput, setNicknameInput] = useState<string | null>(null);
  const [color, setColor] = useState(DEFAULT_DISC_COLOR);
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nickname = nicknameInput ?? user?.displayName ?? user?.email ?? '';

  const handleJoin = async () => {
    const trimmed = code.trim();
    if (trimmed.length < 5) {
      setError('Enter the 5-character code');
      return;
    }
    setPending(true);
    setError(null);
    try {
      const round = await joinFrisbeeGolfRoundByCode(trimmed, nickname.trim() || undefined, color);
      router.push(`${SCOREBOOK_FRISBEE_GOLF_ROUTE}/${round.id}`);
    } catch {
      setError('That code didn’t match a round that’s open to join.');
      setPending(false);
    }
  };

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-800/40 p-3">
      <span className="mb-2 block text-sm font-medium text-neutral-300">Have a join code?</span>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs text-neutral-400">
          Nickname
          <input
            value={nickname}
            onChange={e => setNicknameInput(e.target.value)}
            placeholder="Your name"
            disabled={pending}
            aria-label="Nickname"
            className="mt-1 block w-40 rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder-neutral-500 outline-none focus:border-brand-500 disabled:opacity-60"
          />
        </label>
        <label className="text-xs text-neutral-400">
          Color
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            disabled={pending}
            aria-label="Frisbee color"
            className="mt-1 block h-10 w-12 cursor-pointer rounded border border-neutral-700 bg-neutral-900 p-1 disabled:opacity-60"
          />
        </label>
        <label className="text-xs text-neutral-400">
          Code
          <input
            value={code}
            onChange={e =>
              setCode(
                e.target.value
                  .toUpperCase()
                  .replace(/[^0-9A-Z]/g, '')
                  .slice(0, 10)
              )
            }
            onKeyDown={e => {
              if (e.key === 'Enter') handleJoin();
            }}
            placeholder="ABC12"
            disabled={pending}
            aria-label="Join code"
            className="mt-1 block w-32 rounded border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono uppercase tracking-[0.3em] text-white placeholder-neutral-500 outline-none focus:border-brand-500 disabled:opacity-60"
          />
        </label>
        <button
          type="button"
          onClick={handleJoin}
          disabled={pending}
          className="cursor-pointer rounded bg-brand-600 px-4 py-2 text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? 'Joining…' : 'Join'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
};
