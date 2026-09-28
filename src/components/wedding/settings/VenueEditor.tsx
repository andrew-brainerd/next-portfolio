'use client';

import type { PracticalItem, ScheduleItem, VenueMap, WeddingGuideConfig } from '@/types/wedding';
import { SelectField, TextArea, TextField } from './FormFields';
import { ListEditor } from './ListEditor';

interface VenueEditorProps {
  venue: WeddingGuideConfig['venue'];
  schedule: ScheduleItem[];
  onChange: (venue: WeddingGuideConfig['venue']) => void;
}

export const VenueEditor = ({ venue, schedule, onChange }: VenueEditorProps) => {
  const scheduleOptions = [
    { value: '', label: 'Always (default layout)' },
    ...schedule.filter(item => item.title.trim()).map(item => ({ value: item.title, label: `${item.time} — ${item.title}` }))
  ];

  return (
    <>
      <TextArea
        label="History"
        value={venue.history ?? ''}
        onChange={history => onChange({ ...venue, history })}
        rows={5}
        placeholder="Separate paragraphs with a blank line."
        maxLength={5000}
      />
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">Fun facts</h3>
        <ListEditor
          items={venue.funFacts}
          onChange={funFacts => onChange({ ...venue, funFacts })}
          makeItem={() => ''}
          addLabel="Add fun fact"
          itemLabel={index => `Fact ${index + 1}`}
          renderItem={(fact, update) => <TextField label="Fact" value={fact} onChange={update} maxLength={300} />}
        />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">Maps</h3>
        <p className="mb-2 text-xs text-neutral-500">
          Images live in <code>public/wedding/</code>. Guests get a toggle between layouts.
        </p>
        <ListEditor
          items={venue.maps}
          onChange={maps => onChange({ ...venue, maps })}
          makeItem={(): VenueMap => ({ label: '', src: '/wedding/', alt: '', width: 0, height: 0 })}
          addLabel="Add map"
          itemLabel={index => venue.maps[index]?.label || `Map ${index + 1}`}
          renderItem={(map, update) => (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Label"
                  value={map.label}
                  onChange={label => update({ ...map, label })}
                  placeholder="Reception"
                  maxLength={40}
                />
                <TextField
                  label="Image path"
                  value={map.src}
                  onChange={src => update({ ...map, src })}
                  placeholder="/wedding/venue-map-reception.jpg"
                  maxLength={300}
                />
              </div>
              <TextField label="Alt text" value={map.alt} onChange={alt => update({ ...map, alt })} maxLength={300} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <TextField
                  label="Width (px)"
                  type="number"
                  value={map.width ? String(map.width) : ''}
                  onChange={width => update({ ...map, width: Number(width) || 0 })}
                />
                <TextField
                  label="Height (px)"
                  type="number"
                  value={map.height ? String(map.height) : ''}
                  onChange={height => update({ ...map, height: Number(height) || 0 })}
                />
                <SelectField
                  label="Default from"
                  value={map.activeFrom ?? ''}
                  onChange={activeFrom => update({ ...map, activeFrom })}
                  options={scheduleOptions}
                />
              </div>
            </div>
          )}
        />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">Practical info</h3>
        <ListEditor
          items={venue.practical}
          onChange={practical => onChange({ ...venue, practical })}
          makeItem={(): PracticalItem => ({ label: '', value: '' })}
          addLabel="Add info"
          itemLabel={index => venue.practical[index]?.label || `Info ${index + 1}`}
          renderItem={(item, update) => (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextField
                label="Label"
                value={item.label}
                onChange={label => update({ ...item, label })}
                placeholder="Wi-Fi"
                maxLength={60}
              />
              <div className="sm:col-span-2">
                <TextField
                  label="Value"
                  value={item.value}
                  onChange={value => update({ ...item, value })}
                  maxLength={500}
                />
              </div>
            </div>
          )}
        />
      </div>
    </>
  );
};
