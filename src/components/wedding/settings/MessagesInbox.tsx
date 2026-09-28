'use client';

import { useState } from 'react';

import type { WeddingMessage } from '@/types/wedding';
import { setWeddingMessageRead } from '@/api/wedding';

interface MessagesInboxProps {
  initialMessages: WeddingMessage[];
}

export const MessagesInbox = ({ initialMessages }: MessagesInboxProps) => {
  const [messages, setMessages] = useState(initialMessages);
  const unread = messages.filter(message => !message.read).length;

  const toggleRead = async (message: WeddingMessage) => {
    if (!message.id) return;
    const updated = await setWeddingMessageRead(message.id, !message.read);
    if (!updated) return;
    setMessages(current => current.map(existing => (existing.id === updated.id ? updated : existing)));
  };

  return (
    <section className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-5">
      <h2 className="text-lg font-semibold text-neutral-100">
        Messages from guests
        {unread > 0 && (
          <span className="ml-2 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-medium text-neutral-100">
            {unread} new
          </span>
        )}
      </h2>
      {messages.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-500">No messages yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {messages.map(message => (
            <li
              key={message.id ?? message.createdAt}
              className={`rounded-lg border p-4 ${
                message.read ? 'border-neutral-800 bg-neutral-950/20' : 'border-brand-400/50 bg-neutral-950/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-100">
                  {message.name}
                  {message.table && <span className="ml-2 font-normal text-neutral-500">table {message.table}</span>}
                  <span className="ml-2 text-xs font-normal text-neutral-500">
                    {new Date(message.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => toggleRead(message)}
                  className="shrink-0 rounded border border-neutral-700 px-2 py-1 text-xs text-neutral-300 transition-colors hover:bg-neutral-800"
                >
                  Mark {message.read ? 'unread' : 'read'}
                </button>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-200">{message.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
