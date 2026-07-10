'use client';

import { useState } from 'react';

import { createBoardNote, removeBoardNote, updateBoardNote } from '@/api/board';
import type { BoardNote } from '@/types/board';

interface BoardNotesPanelProps {
  notes: BoardNote[];
  onChange: () => void | Promise<void>;
}

const CHIP_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'violet', 'white'];

const CHIP_HEX: Record<string, string> = {
  red: '#d3222a',
  orange: '#e5651f',
  yellow: '#f2b31c',
  green: '#3a9c46',
  blue: '#1160c4',
  violet: '#6f3aa0',
  white: '#eceadf'
};

export const BoardNotesPanel = ({ notes, onChange }: BoardNotesPanelProps) => {
  const [text, setText] = useState('');
  const [color, setColor] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      await createBoardNote({ text, color: color || null });
      setText('');
      setColor('');
      await onChange();
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (note: BoardNote) => {
    await updateBoardNote(note.id, { enabled: !note.enabled });
    await onChange();
  };

  const remove = async (note: BoardNote) => {
    await removeBoardNote(note.id);
    await onChange();
  };

  return (
    <div
      className="w-full rounded-2xl border border-white/10 bg-white/5 p-4"
      style={{ maxWidth: 'min(96vw, 1080px)' }}
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-neutral-300">Notes</h2>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Add a note…"
          maxLength={200}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white/30 focus:outline-none"
        />
        <select
          value={color}
          onChange={e => setColor(e.target.value)}
          aria-label="Note accent color"
          className="rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
        >
          <option value="">No color</option>
          {CHIP_COLORS.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          disabled={busy || !text.trim()}
          className="rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white disabled:opacity-40"
        >
          Add
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-neutral-500">No notes yet. Add one above and it joins the rotation.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notes.map(note => (
            <li
              key={note.id}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/30 px-3 py-2"
            >
              {note.color ? (
                <span
                  className="h-3 w-3 shrink-0 rounded-sm"
                  style={{ background: CHIP_HEX[note.color] ?? '#888' }}
                  aria-hidden
                />
              ) : (
                <span className="h-3 w-3 shrink-0" aria-hidden />
              )}
              <span className={`flex-1 truncate text-sm ${note.enabled ? 'text-white' : 'text-neutral-500 line-through'}`}>
                {note.text}
              </span>
              <button
                type="button"
                onClick={() => toggle(note)}
                className="rounded px-2 py-1 text-xs text-neutral-300 hover:bg-white/10"
              >
                {note.enabled ? 'Hide' : 'Show'}
              </button>
              <button
                type="button"
                onClick={() => remove(note)}
                aria-label={`Delete note ${note.text}`}
                className="rounded px-2 py-1 text-xs text-red-300 hover:bg-red-500/15"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
