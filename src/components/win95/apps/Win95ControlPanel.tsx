'use client';

import { useThemeSelection } from 'hooks/useThemeSelection';
import { useDisplayName } from 'hooks/useDisplayName';
import { useWin95Mode } from '@/hooks/useWin95Mode';

export const Win95ControlPanel = () => {
  const { options, activeId, select } = useThemeSelection();
  const { disable } = useWin95Mode();
  const account = useDisplayName();

  return (
    <div className="max-w-[460px] p-3 text-[11px] leading-snug">
      <p className="mb-4">Manage your account and appearance. Changes apply immediately.</p>

      {account.ready && account.user && (
        <div className="win95-fieldset mb-4">
          <span className="win95-legend">Account</span>
          <label className="flex items-center gap-2">
            <span className="shrink-0">Display name:</span>
            <input
              className="win95-field flex-1"
              type="text"
              value={account.name}
              onChange={e => account.setName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') account.save();
              }}
              placeholder="The name others see"
              disabled={account.saving}
            />
            <button
              type="button"
              className="win95-btn"
              onClick={account.save}
              disabled={!account.canSave}
            >
              {account.saving ? 'Saving…' : 'Save'}
            </button>
          </label>
          {account.saved && <p className="mt-2 text-[#007000]">✓ Saved.</p>}
          {account.error && <p className="mt-2 text-[#a00000]">⚠ {account.error}</p>}
        </div>
      )}

      <div className="win95-fieldset mb-4">
        <span className="win95-legend">Theme</span>
        <p className="mb-2 text-neutral-600">Pick a color scheme, or switch to Windows 95 mode.</p>
        <div className="win95-listbox max-h-[124px]">
          {options.map(option => {
            const selected = activeId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => select(option.id)}
                className={`win95-option w-full text-left ${selected ? 'win95-option-selected' : ''}`}
              >
                <span className="flex gap-px">
                  {option.swatches.map((color, i) => (
                    <span key={i} className="h-3 w-3 border border-black" style={{ background: color }} />
                  ))}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" className="win95-btn" onClick={disable}>
          Restore Classic Site
        </button>
      </div>
    </div>
  );
};
