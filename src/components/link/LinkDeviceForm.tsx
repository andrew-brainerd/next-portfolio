'use client';

import Link from 'next/link';
import { useState } from 'react';

import { approveDevice } from '@/api/device';
import { LINK_ROUTE, LOGIN_ROUTE } from 'constants/routes';
import { linkErrorMessage, linkSuccessMessage, needsSignIn } from 'utils/linkDevice';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export const LinkDeviceForm = () => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [signIn, setSignIn] = useState(false);

  const submit = async () => {
    if (!code.trim() || status === 'submitting') return;
    setStatus('submitting');
    setMessage('');
    setSignIn(false);
    const result = await approveDevice(code).catch(() => ({ ok: false as const, status: 0 }));
    if (result.ok) {
      setStatus('success');
      setMessage(linkSuccessMessage(result.kind));
      setCode('');
      return;
    }
    setStatus('error');
    setMessage(linkErrorMessage(result));
    setSignIn(needsSignIn(result));
  };

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor="device-code" className="text-sm text-neutral-300">
        Enter the code shown on your device or app
      </label>
      <input
        id="device-code"
        type="text"
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase())}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="ABCD-EFGH"
        autoComplete="off"
        autoCapitalize="characters"
        className="rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-center text-2xl tracking-[0.3em] text-white placeholder:text-neutral-600 focus:border-white/40 focus:outline-none"
      />
      <button
        type="button"
        onClick={submit}
        disabled={status === 'submitting' || !code.trim()}
        className="rounded-lg bg-white/90 px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-white disabled:opacity-40"
      >
        {status === 'submitting' ? 'Linking…' : 'Link device'}
      </button>
      {message && (
        <p className={`text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`} role="status">
          {message}
          {signIn && (
            <>
              {' '}
              <Link href={`${LOGIN_ROUTE}?from=${encodeURIComponent(LINK_ROUTE)}`} className="underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
};
