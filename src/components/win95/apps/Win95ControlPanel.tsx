'use client';

import { themes, useTheme } from '@/hooks/useTheme';
import { useWin95Mode } from '@/hooks/useWin95Mode';

const CheckGlyph = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
    <path d="M0 4 L3 7 L9 1 L8 0 L3 5 L1 3 Z" fill="#000" />
  </svg>
);

export const Win95ControlPanel = () => {
  const { theme: current, setTheme } = useTheme();
  const { enabled, disable } = useWin95Mode();

  return (
    <div className="max-w-[460px] p-3 text-[11px] leading-snug">
      <p className="mb-4">Adjust your portfolio&apos;s appearance. Changes apply immediately.</p>

      <div className="win95-fieldset mb-4">
        <span className="win95-legend">Color scheme</span>
        <p className="mb-2 text-neutral-600">Used by the classic (non-95) site.</p>
        <div className="win95-listbox max-h-[124px]">
          {themes.map(theme => {
            const selected = current === theme.name;
            return (
              <button
                key={theme.name}
                type="button"
                onClick={() => setTheme(theme.name)}
                className={`win95-option w-full text-left ${selected ? 'win95-option-selected' : ''}`}
              >
                <span className="flex gap-px">
                  <span className="h-3 w-3 border border-black" style={{ background: theme.primary }} />
                  <span className="h-3 w-3 border border-black" style={{ background: theme.secondary }} />
                  <span className="h-3 w-3 border border-black" style={{ background: theme.tertiary }} />
                </span>
                {theme.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="win95-fieldset mb-4">
        <span className="win95-legend">Desktop</span>
        <button
          type="button"
          onClick={enabled ? disable : undefined}
          className="flex items-center gap-2 text-left"
          aria-pressed={enabled}
        >
          <span className="win95-checkbox">{enabled && <CheckGlyph />}</span>
          <span>Windows 95 mode</span>
        </button>
        <p className="mt-2 text-neutral-600">
          Reskins the whole site with a Start menu, taskbar, and window chrome. Uncheck to return to
          the classic site.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" className="win95-btn" onClick={disable}>
          Restore Classic Site
        </button>
      </div>
    </div>
  );
};
