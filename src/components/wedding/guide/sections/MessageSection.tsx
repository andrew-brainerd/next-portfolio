'use client';

import { useId, useState } from 'react';

import { sendWeddingMessage } from '@/api/wedding';
import { useGuideMe } from '@/hooks/useGuideMe';
import type { MessageSendOutcome } from '@/types/wedding';
import { getWeddingClientId } from '@/utils/weddingClient';
import { GuideSection } from '../GuideSection';

const MAX_LENGTH = 2000;

interface MessageSectionProps {
  prompt?: string;
}

export const MessageSection = ({ prompt }: MessageSectionProps) => {
  const nameId = useId();
  const messageId = useId();
  const [me] = useGuideMe();
  const [name, setName] = useState<string | undefined>();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<MessageSendOutcome | 'idle' | 'sending'>('idle');

  const displayName = name ?? (me && !me.name.startsWith('Guest of') ? me.name : '');
  const canSend = displayName.trim().length > 0 && message.trim().length > 0 && status !== 'sending';

  const send = async () => {
    if (!canSend) return;
    setStatus('sending');
    // The draft stays in place until the send succeeds
    const outcome = await sendWeddingMessage({
      clientId: getWeddingClientId(),
      name: displayName.trim(),
      message: message.trim(),
      table: me?.tableId
    });
    setStatus(outcome);
    if (outcome === 'sent') setMessage('');
  };

  return (
    <GuideSection id="messages" title="Message us">
      {status === 'sent' ? (
        <div className="text-center font-garamond">
          <p className="text-2xl text-[var(--sb-crimson)]">Thank you 💛</p>
          <p className="mt-1">We&apos;ll treasure it.</p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="mt-3 text-[var(--sb-crimson)] underline underline-offset-4"
          >
            Send another
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="font-garamond text-lg">{prompt || "Leave us a note — only the two of us will see it."}</p>
          <div>
            <label htmlFor={nameId} className="block font-garamond">
              Your name
            </label>
            <input
              id={nameId}
              value={displayName}
              onChange={event => setName(event.target.value)}
              maxLength={80}
              autoComplete="name"
              className="mt-1 w-full rounded-lg border border-[var(--sb-gold)] bg-[var(--sb-white)] px-4 py-3 text-base focus:border-[var(--sb-crimson)] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor={messageId} className="block font-garamond">
              Your message
            </label>
            <textarea
              id={messageId}
              value={message}
              onChange={event => setMessage(event.target.value)}
              maxLength={MAX_LENGTH}
              rows={5}
              className="mt-1 w-full rounded-lg border border-[var(--sb-gold)] bg-[var(--sb-white)] px-4 py-3 text-base focus:border-[var(--sb-crimson)] focus:outline-none"
            />
            <p className="text-right text-xs opacity-70">
              {message.length}/{MAX_LENGTH}
            </p>
          </div>
          <button
            type="button"
            onClick={send}
            disabled={!canSend}
            className="min-h-11 w-full rounded-lg bg-[var(--sb-crimson)] px-4 py-3 font-garamond text-lg text-[var(--sb-white)] disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending…' : 'Send to the couple'}
          </button>
          <p aria-live="polite" className="min-h-5 text-sm text-[var(--sb-crimson)]">
            {status === 'error' && "Couldn't send — your message is still here. Check your connection and try again."}
            {status === 'closed' && 'Messages are closed right now.'}
          </p>
        </div>
      )}
    </GuideSection>
  );
};
