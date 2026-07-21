'use client';

import { useState } from 'react';

import type { Hotel, ScheduleItem, WeddingConfig } from '@/types/wedding';
import { updateWeddingConfig } from '@/api/wedding';
import { prepareWeddingConfigForSave, withEditableWeddingDefaults } from '@/utils/wedding';
import { CheckboxField, SectionCard, TextArea, TextField } from './FormFields';
import { EventBlockFields } from './EventBlockFields';
import { ListEditor } from './ListEditor';

type SaveStatus = 'idle' | 'saved' | 'error';

interface WeddingSettingsFormProps {
  initialConfig: WeddingConfig;
}

export const WeddingSettingsForm = ({ initialConfig }: WeddingSettingsFormProps) => {
  const [config, setConfig] = useState<WeddingConfig>(() => withEditableWeddingDefaults(initialConfig));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');

  const patch = (partial: Partial<WeddingConfig>) => {
    setStatus('idle');
    setConfig(current => ({ ...current, ...partial }));
  };

  const onSave = async () => {
    setSaving(true);
    setStatus('idle');
    try {
      const saved = await updateWeddingConfig(prepareWeddingConfigForSave(config));
      setConfig(withEditableWeddingDefaults(saved));
      setStatus('saved');
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionCard
        title="Guest access"
        description="The shared passcode printed on the invites. While it's empty, the storybook stays locked for everyone."
      >
        <TextField
          label="Guest passcode"
          value={config.guestPasscode}
          onChange={guestPasscode => patch({ guestPasscode })}
          maxLength={64}
        />
      </SectionCard>

      <SectionCard title="The basics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Partner A"
            value={config.coupleNames.partnerA}
            onChange={partnerA => patch({ coupleNames: { ...config.coupleNames, partnerA } })}
            maxLength={80}
          />
          <TextField
            label="Partner B"
            value={config.coupleNames.partnerB}
            onChange={partnerB => patch({ coupleNames: { ...config.coupleNames, partnerB } })}
            maxLength={80}
          />
        </div>
        <TextField label="Wedding date" type="date" value={config.weddingDate} onChange={weddingDate => patch({ weddingDate })} />
        <TextField
          label="Tagline"
          value={config.tagline ?? ''}
          onChange={tagline => patch({ tagline })}
          placeholder="A short storybook subtitle"
          maxLength={200}
        />
      </SectionCard>

      <SectionCard title="Ceremony">
        <EventBlockFields
          value={config.ceremony}
          onChange={ceremony => patch({ ceremony })}
          dateHint="Leave blank if same as the wedding date"
        />
      </SectionCard>

      <SectionCard title="Reception">
        <EventBlockFields
          value={config.reception}
          onChange={reception => patch({ reception })}
          dateHint="Leave blank if same as the wedding date"
        />
      </SectionCard>

      <SectionCard title="Rehearsal dinner" description="Leave everything blank to keep it off the storybook.">
        <EventBlockFields
          value={config.rehearsalDinner ?? { venueName: '' }}
          onChange={rehearsalDinner => patch({ rehearsalDinner })}
          showInvited
        />
      </SectionCard>

      <SectionCard title="Hotels" description="Suggested places for out-of-town guests to stay.">
        <ListEditor
          items={config.hotels}
          onChange={hotels => patch({ hotels })}
          makeItem={(): Hotel => ({ name: '' })}
          addLabel="Add hotel"
          itemLabel={index => `Hotel ${index + 1}`}
          renderItem={(hotel, update) => (
            <div className="space-y-4">
              <TextField label="Name" value={hotel.name} onChange={name => update({ ...hotel, name })} maxLength={120} />
              <TextField
                label="Address"
                value={hotel.address ?? ''}
                onChange={address => update({ ...hotel, address })}
                maxLength={200}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <TextField
                  label="Booking link"
                  value={hotel.url ?? ''}
                  onChange={url => update({ ...hotel, url })}
                  maxLength={500}
                />
                <TextField
                  label="Booking code"
                  value={hotel.bookingCode ?? ''}
                  onChange={bookingCode => update({ ...hotel, bookingCode })}
                  maxLength={80}
                />
                <TextField
                  label="Rate"
                  value={hotel.rate ?? ''}
                  onChange={rate => update({ ...hotel, rate })}
                  placeholder="$189/night"
                  maxLength={80}
                />
              </div>
              <TextField
                label="Notes"
                value={hotel.notes ?? ''}
                onChange={notes => update({ ...hotel, notes })}
                maxLength={500}
              />
            </div>
          )}
        />
      </SectionCard>

      <SectionCard title="Day-of schedule">
        <ListEditor
          items={config.schedule}
          onChange={schedule => patch({ schedule })}
          makeItem={(): ScheduleItem => ({ time: '', title: '' })}
          addLabel="Add schedule item"
          itemLabel={index => `Item ${index + 1}`}
          renderItem={(item, update) => (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Time"
                  value={item.time}
                  onChange={time => update({ ...item, time })}
                  placeholder="4:30 PM"
                  maxLength={40}
                />
                <TextField label="Title" value={item.title} onChange={title => update({ ...item, title })} maxLength={120} />
              </div>
              <TextField
                label="Description"
                value={item.description ?? ''}
                onChange={description => update({ ...item, description })}
                maxLength={500}
              />
            </div>
          )}
        />
      </SectionCard>

      <SectionCard title="Travel & parking">
        <TextArea
          label="Parking"
          value={config.travel?.parking ?? ''}
          onChange={parking => patch({ travel: { ...config.travel, parking } })}
          maxLength={1000}
        />
        <TextArea
          label="Airports"
          value={config.travel?.airports ?? ''}
          onChange={airports => patch({ travel: { ...config.travel, airports } })}
          maxLength={1000}
        />
        <TextArea
          label="Directions"
          value={config.travel?.directions ?? ''}
          onChange={directions => patch({ travel: { ...config.travel, directions } })}
          maxLength={1000}
        />
        <TextArea
          label="Other notes"
          value={config.travel?.notes ?? ''}
          onChange={notes => patch({ travel: { ...config.travel, notes } })}
          maxLength={1000}
        />
      </SectionCard>

      <SectionCard title="Dress code">
        <TextField
          label="Title"
          value={config.dressCode?.title ?? ''}
          onChange={title => patch({ dressCode: { description: '', ...config.dressCode, title } })}
          placeholder="Garden formal"
          maxLength={120}
        />
        <TextArea
          label="Description"
          value={config.dressCode?.description ?? ''}
          onChange={description => patch({ dressCode: { title: '', ...config.dressCode, description } })}
          maxLength={1000}
        />
      </SectionCard>

      <SectionCard title="FAQ">
        <ListEditor
          items={config.faq}
          onChange={faq => patch({ faq })}
          makeItem={() => ({ question: '', answer: '' })}
          addLabel="Add question"
          itemLabel={index => `Question ${index + 1}`}
          renderItem={(item, update) => (
            <div className="space-y-4">
              <TextField
                label="Question"
                value={item.question}
                onChange={question => update({ ...item, question })}
                maxLength={300}
              />
              <TextArea label="Answer" value={item.answer} onChange={answer => update({ ...item, answer })} maxLength={2000} />
            </div>
          )}
        />
      </SectionCard>

      <SectionCard title="Announcements" description="Anything else guests should know.">
        <ListEditor
          items={config.announcements ?? []}
          onChange={announcements => patch({ announcements })}
          makeItem={() => ''}
          addLabel="Add announcement"
          itemLabel={index => `Announcement ${index + 1}`}
          renderItem={(item, update) => (
            <TextField label="Announcement" value={item} onChange={update} maxLength={500} />
          )}
        />
      </SectionCard>

      <SectionCard title="Registry">
        <ListEditor
          items={config.registry}
          onChange={registry => patch({ registry })}
          makeItem={() => ({ label: '', url: '' })}
          addLabel="Add registry link"
          itemLabel={index => `Link ${index + 1}`}
          renderItem={(link, update) => (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Label" value={link.label} onChange={label => update({ ...link, label })} maxLength={120} />
              <TextField label="URL" value={link.url} onChange={url => update({ ...link, url })} maxLength={500} />
            </div>
          )}
        />
      </SectionCard>

      <SectionCard title="Honeymoon fund" description="Leave the title blank to keep it off the storybook.">
        <TextField
          label="Title"
          value={config.honeymoonFund?.title ?? ''}
          onChange={title => patch({ honeymoonFund: { ...config.honeymoonFund, title } })}
          placeholder="Honeymoon fund"
          maxLength={120}
        />
        <TextArea
          label="Description"
          value={config.honeymoonFund?.description ?? ''}
          onChange={description => patch({ honeymoonFund: { title: '', ...config.honeymoonFund, description } })}
          maxLength={500}
        />
        <TextField
          label="URL"
          value={config.honeymoonFund?.url ?? ''}
          onChange={url => patch({ honeymoonFund: { title: '', ...config.honeymoonFund, url } })}
          maxLength={500}
        />
      </SectionCard>

      <SectionCard title="RSVP">
        <CheckboxField
          label="RSVPs open"
          checked={config.rsvp.enabled}
          onChange={enabled => patch({ rsvp: { ...config.rsvp, enabled } })}
          hint="When off, the RSVP page is hidden from the storybook."
        />
        <TextField
          label="Deadline"
          type="date"
          value={config.rsvp.deadline ?? ''}
          onChange={deadline => patch({ rsvp: { ...config.rsvp, deadline } })}
        />
        <TextField
          label="Message"
          value={config.rsvp.message ?? ''}
          onChange={message => patch({ rsvp: { ...config.rsvp, message } })}
          placeholder="We can't wait to celebrate with you!"
          maxLength={500}
        />
      </SectionCard>

      <div className="sticky bottom-0 -mx-1 flex items-center gap-4 border-t border-neutral-800 bg-neutral-950/90 px-1 py-4 backdrop-blur">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-brand-600 px-6 py-2 font-medium text-neutral-100 transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
        {status === 'saved' && <p className="text-sm text-neutral-300">Saved.</p>}
        {status === 'error' && (
          <p className="text-sm text-warning-100">Save failed — check the API connection and try again.</p>
        )}
      </div>
    </div>
  );
};
