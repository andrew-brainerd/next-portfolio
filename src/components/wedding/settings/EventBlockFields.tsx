'use client';

import type { EventBlock } from '@/types/wedding';
import { TextArea, TextField } from './FormFields';

type EditableEventBlock = EventBlock & { invited?: string };

interface EventBlockFieldsProps {
  value: EditableEventBlock;
  onChange: (value: EditableEventBlock) => void;
  // Rehearsal dinner carries a "who's invited" line; ceremony/reception don't
  showInvited?: boolean;
  // Ceremony/reception default to the main wedding date, so their date field is optional context
  dateHint?: string;
}

export const EventBlockFields = ({ value, onChange, showInvited = false, dateHint }: EventBlockFieldsProps) => {
  const patch = (partial: Partial<EditableEventBlock>) => onChange({ ...value, ...partial });

  return (
    <div className="space-y-4">
      <TextField label="Venue name" value={value.venueName} onChange={venueName => patch({ venueName })} maxLength={120} />
      <TextField
        label="Address"
        value={value.address ?? ''}
        onChange={address => patch({ address })}
        maxLength={200}
      />
      <TextField
        label="Map link"
        value={value.mapUrl ?? ''}
        onChange={mapUrl => patch({ mapUrl })}
        placeholder="https://maps.google.com/…"
        maxLength={500}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextField label="Date" type="date" value={value.date ?? ''} onChange={date => patch({ date })} hint={dateHint} />
        <TextField
          label="Start time"
          value={value.startTime ?? ''}
          onChange={startTime => patch({ startTime })}
          placeholder="4:30 PM"
          maxLength={20}
        />
        <TextField
          label="End time"
          value={value.endTime ?? ''}
          onChange={endTime => patch({ endTime })}
          placeholder="10:00 PM"
          maxLength={20}
        />
      </div>
      {showInvited && (
        <TextField
          label="Who's invited"
          value={value.invited ?? ''}
          onChange={invited => patch({ invited })}
          placeholder="Wedding party + family"
          maxLength={200}
        />
      )}
      <TextArea label="Notes" value={value.notes ?? ''} onChange={notes => patch({ notes })} maxLength={1000} />
    </div>
  );
};
