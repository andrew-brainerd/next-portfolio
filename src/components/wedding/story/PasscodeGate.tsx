'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

// The storybook's locked cover. Palette is the storybook's own (cream/gold/
// crimson/ink — spec Appendix B), deliberately independent of the site theme.
export const PasscodeGate = () => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [failed, setFailed] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!code.trim() || checking) return;
    setChecking(true);
    setFailed(false);

    try {
      const response = await fetch('/wedding/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() })
      });

      if (response.ok) {
        // Server page re-renders with the fresh cookie and opens the book
        router.refresh();
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setChecking(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#ede6e1] p-6">
      <div className="w-full max-w-md rounded-2xl border-4 border-[#d4a770] bg-[#8c0707] p-8 text-center shadow-2xl sm:p-12">
        <div className="rounded-lg border border-[#d4a770]/60 px-4 py-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4a770]">A storybook for</p>
          <h1 className="mt-4 font-pacifico text-4xl text-[#fafafa]">Our Wedding</h1>
          <p className="mt-6 text-sm text-[#ede6e1]/80">
            This book opens with the passcode from your invitation.
          </p>

          <form onSubmit={onSubmit} className="mt-6">
            <label htmlFor="wedding-passcode" className="sr-only">
              Passcode
            </label>
            <input
              id="wedding-passcode"
              type="text"
              value={code}
              onChange={event => {
                setCode(event.target.value);
                setFailed(false);
              }}
              autoComplete="off"
              autoCapitalize="none"
              maxLength={64}
              placeholder="Passcode"
              className="w-full rounded-lg border border-[#d4a770]/70 bg-[#fafafa] px-4 py-2.5 text-center text-lg tracking-widest text-[#000000] placeholder:text-neutral-400 focus:border-[#d4a770] focus:outline-none"
            />
            <button
              type="submit"
              disabled={checking || code.trim().length === 0}
              className="mt-4 w-full rounded-lg bg-[#d4a770] px-6 py-2.5 font-semibold text-[#000000] transition-colors hover:bg-[#c99755] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checking ? 'Opening…' : 'Open the book'}
            </button>
          </form>

          <p aria-live="polite" className="mt-4 min-h-5 text-sm text-[#fafafa]">
            {failed && "That's not it — check your invitation and try again."}
          </p>
        </div>
      </div>
    </main>
  );
};
