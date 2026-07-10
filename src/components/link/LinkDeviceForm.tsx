'use client';

import { useState } from 'react';

import { approveDevice } from '@/api/device';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export const LinkDeviceForm = () => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const submit = async () => {
    if (!code.trim() || status === 'submitting') return;
    setStatus('submitting');
    setMessage('');
    try {
      await approveDevice(code);
      setStatus('success');
      setMessage('Device linked! Your TV should continue in a few seconds.');
      setCode('');
    } catch {
      setStatus('error');
      setMessage('That code is invalid or expired. Check the code on your TV and try again.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor="device-code" className="text-sm text-neutral-300">
        Enter the code shown on your TV
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
        </p>
      )}
    </div>
  );
};
