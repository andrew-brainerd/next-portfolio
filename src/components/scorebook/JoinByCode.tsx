'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { joinFrisbeeGolfRoundByCode } from '@/api/scorebook';
import { SCOREBOOK_FRISBEE_GOLF_ROUTE } from 'constants/routes';

export const JoinByCode = () => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    const trimmed = code.trim();
    if (trimmed.length < 5) {
      setError('Enter the 5-character code');
      return;
    }
    setPending(true);
    setError(null);
    try {
      const round = await joinFrisbeeGolfRoundByCode(trimmed);
      router.push(`${SCOREBOOK_FRISBEE_GOLF_ROUTE}/${round.id}`);
    } catch {
      setError('That code didn’t match a round that’s open to join.');
      setPending(false);
    }
  };

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-800/40 p-3">
      <label htmlFor="join-code" className="mb-2 block text-sm font-medium text-neutral-300">
        Have a join code?
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          id="join-code"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 10))}
          onKeyDown={e => {
            if (e.key === 'Enter') handleJoin();
          }}
          placeholder="ABC12"
          disabled={pending}
          aria-label="Join code"
          className="w-32 rounded border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono uppercase tracking-[0.3em] text-white placeholder-neutral-500 outline-none focus:border-brand-500 disabled:opacity-60"
        />
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
