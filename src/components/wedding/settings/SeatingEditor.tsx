'use client';

import { useState } from 'react';

import type { SeatedGuest, SeatingTable } from '@/types/wedding';
import { findDuplicateGuests, parseGuestLines, slugify } from '@/utils/weddingGuide';
import { TextArea, TextField } from './FormFields';
import { ListEditor } from './ListEditor';

interface BulkGuestAddProps {
  onAdd: (guests: SeatedGuest[]) => void;
}

const BulkGuestAdd = ({ onAdd }: BulkGuestAddProps) => {
  const [text, setText] = useState('');
  const guests = parseGuestLines(text);

  return (
    <div className="space-y-2">
      <TextArea
        label="Paste guests"
        value={text}
        onChange={setText}
        rows={3}
        placeholder={"Jane Doe — Andrew's aunt\nGuest of Jane Doe\nBob Smith - Hayley's college roommate"}
      />
      <button
        type="button"
        disabled={guests.length === 0}
        onClick={() => {
          onAdd(guests);
          setText('');
        }}
        className="rounded-lg border border-neutral-600 px-4 py-2 text-sm text-neutral-200 transition-colors hover:border-brand-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Add {guests.length || ''} {guests.length === 1 ? 'guest' : 'guests'}
      </button>
    </div>
  );
};

interface SeatingEditorProps {
  tables: SeatingTable[];
  onChange: (tables: SeatingTable[]) => void;
}

export const SeatingEditor = ({ tables, onChange }: SeatingEditorProps) => {
  const duplicates = findDuplicateGuests(tables);
  const ids = tables.map(table => slugify(table.id));
  const duplicateIds = ids.filter((id, index) => id && ids.indexOf(id) !== index);

  return (
    <div className="space-y-3">
      {duplicates.length > 0 && (
        <p className="text-sm text-warning-100">Seated at more than one table: {duplicates.join(', ')}</p>
      )}
      {duplicateIds.length > 0 && (
        <p className="text-sm text-warning-100">
          Table ids must be unique (they&apos;re in the tag URLs): {[...new Set(duplicateIds)].join(', ')}
        </p>
      )}
      <ListEditor
        items={tables}
        onChange={onChange}
        makeItem={(): SeatingTable => ({ id: `t${tables.length + 1}`, name: `Table ${tables.length + 1}`, guests: [] })}
        addLabel="Add table"
        itemLabel={index => tables[index]?.name || `Table ${index + 1}`}
        renderItem={(table, update) => (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextField
                label="Id"
                value={table.id}
                onChange={id => update({ ...table, id })}
                maxLength={24}
                hint="Short and stable, e.g. t7 or head. Changing it breaks that table's printed tag."
              />
              <div className="sm:col-span-2">
                <TextField label="Name" value={table.name} onChange={name => update({ ...table, name })} maxLength={80} />
              </div>
            </div>
            <TextField
              label="Table description"
              value={table.description ?? ''}
              onChange={description => update({ ...table, description })}
              placeholder="The Michigan crew"
              maxLength={500}
            />
            <ListEditor
              items={table.guests}
              onChange={guests => update({ ...table, guests })}
              makeItem={(): SeatedGuest => ({ name: '' })}
              addLabel="Add guest"
              itemLabel={index => `Guest ${index + 1}`}
              renderItem={(guest, updateGuest) => (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <TextField
                    label="Name"
                    value={guest.name ?? ''}
                    onChange={name => updateGuest({ ...guest, name })}
                    maxLength={80}
                  />
                  <TextField
                    label="Or guest of"
                    value={guest.guestOf ?? ''}
                    onChange={guestOf => updateGuest({ ...guest, guestOf })}
                    placeholder="Unnamed plus-one's host"
                    maxLength={80}
                  />
                  <TextField
                    label="Blurb"
                    value={guest.blurb ?? ''}
                    onChange={blurb => updateGuest({ ...guest, blurb })}
                    maxLength={300}
                  />
                </div>
              )}
            />
            <BulkGuestAdd onAdd={guests => update({ ...table, guests: [...table.guests, ...guests] })} />
          </div>
        )}
      />
    </div>
  );
};
