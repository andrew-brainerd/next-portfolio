'use client';

import { GUIDE_TIME_ZONES } from '@/constants/wedding';
import type { WeddingGuideConfig } from '@/types/wedding';
import { generateGuideKey } from '@/utils/weddingGuide';
import { CheckboxField, SelectField, TextField } from './FormFields';

interface GuideAccessFieldsProps {
  guide: WeddingGuideConfig;
  guideKey: string;
  onGuideChange: (guide: WeddingGuideConfig) => void;
  onGuideKeyChange: (guideKey: string) => void;
}

export const GuideAccessFields = ({ guide, guideKey, onGuideChange, onGuideKeyChange }: GuideAccessFieldsProps) => {
  const regenerate = () => {
    // Every printed tag and QR embeds the key — confirm before invalidating them
    if (guideKey && !window.confirm('A new key disables every printed QR code and NFC tag. Continue?')) return;
    onGuideKeyChange(generateGuideKey());
  };

  const timeZoneOptions = (GUIDE_TIME_ZONES.includes(guide.timeZone) ? GUIDE_TIME_ZONES : [guide.timeZone, ...GUIDE_TIME_ZONES]).map(
    zone => ({ value: zone, label: zone })
  );

  return (
    <>
      <CheckboxField
        label="Guidebook open"
        checked={guide.enabled}
        onChange={enabled => onGuideChange({ ...guide, enabled })}
        hint="When off, /wedding/guide shows a 'not open yet' page (still behind the passcode or tag key)."
      />
      <div>
        <p className="text-sm text-neutral-300">Tag key</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <code className="rounded-lg border border-neutral-700 bg-neutral-950/50 px-3 py-2 font-mono text-neutral-100">
            {guideKey || 'Not set'}
          </code>
          <button
            type="button"
            onClick={regenerate}
            className="rounded-lg border border-neutral-600 px-4 py-2 text-sm text-neutral-200 transition-colors hover:border-brand-400 hover:text-neutral-100"
          >
            {guideKey ? 'Regenerate' : 'Generate'}
          </button>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          Built into every QR code and NFC tag URL, so guests skip the passcode. It also unlocks the storybook.
        </p>
      </div>
      <SelectField
        label="Venue time zone"
        value={guide.timeZone}
        onChange={timeZone => onGuideChange({ ...guide, timeZone })}
        options={timeZoneOptions}
        hint="Drives 'happening now' and the quiz times."
      />
      <TextField
        label="Welcome line"
        value={guide.welcome ?? ''}
        onChange={welcome => onGuideChange({ ...guide, welcome })}
        placeholder="Welcome to the Colony Club!"
        maxLength={300}
      />
      <CheckboxField
        label="Guests can send us messages"
        checked={guide.messages.enabled}
        onChange={enabled => onGuideChange({ ...guide, messages: { ...guide.messages, enabled } })}
      />
      <TextField
        label="Message prompt"
        value={guide.messages.prompt ?? ''}
        onChange={prompt => onGuideChange({ ...guide, messages: { ...guide.messages, prompt } })}
        placeholder="Leave us a note we'll read on the honeymoon"
        maxLength={300}
      />
    </>
  );
};
