'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

// The storybook's locked cover. Palette comes from the `.storybook` token scope
// (spec Appendix B) — deliberately independent of the site theme.
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
    <main className="storybook flex min-h-dvh items-center justify-center bg-[var(--sb-cream)] p-6">
      <div className="w-full max-w-md rounded-2xl border-4 border-[var(--sb-gold)] bg-[var(--sb-crimson)] p-8 text-center shadow-2xl sm:p-12">
        <div className="rounded-lg border border-[var(--sb-gold)]/60 px-4 py-10">
          <p className="font-garamond text-xs uppercase tracking-[0.3em] text-[var(--sb-gold)]">A storybook for</p>
          <h1 className="mt-4 font-pacifico text-4xl text-[var(--sb-white)]">Our Wedding</h1>
          <p className="mt-6 font-garamond text-base text-[var(--sb-cream)]/80">
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
              className="w-full rounded-lg border border-[var(--sb-gold)]/70 bg-[var(--sb-white)] px-4 py-2.5 text-center text-lg tracking-widest text-[var(--sb-ink)] placeholder:text-neutral-400 focus:border-[var(--sb-gold)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={checking || code.trim().length === 0}
              className="mt-4 w-full rounded-lg bg-[var(--sb-gold)] px-6 py-2.5 font-semibold text-[var(--sb-ink)] transition-colors hover:bg-[var(--sb-gold-deep)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checking ? 'Opening…' : 'Open the book'}
            </button>
          </form>

          <p aria-live="polite" className="mt-4 min-h-5 font-garamond text-sm text-[var(--sb-white)]">
            {failed && "That's not it — check your invitation and try again."}
          </p>
        </div>
      </div>
    </main>
  );
};
