'use client';

import { useState, useRef, useEffect } from 'react';
import { useThemeSelection } from 'hooks/useThemeSelection';
import { PaletteIcon } from 'components/icons/PaletteIcon';

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
  const { options, activeId, select } = useThemeSelection();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelect = (id: string) => {
    select(id);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`text-white hover:text-brand-300 transition-colors cursor-pointer ${className ?? ''}`}
        aria-label="Switch theme"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <PaletteIcon className="w-7 h-7" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1 w-44 bg-neutral-800 border border-neutral-600 rounded-lg shadow-lg overflow-hidden z-50"
        >
          {options.map(option => {
            const active = activeId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => handleSelect(option.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors cursor-pointer ${
                  active ? 'bg-neutral-700 text-white' : 'text-neutral-200 hover:bg-neutral-700'
                }`}
              >
                <span className="flex gap-1" aria-hidden="true">
                  {option.swatches.map((color, i) => (
                    <span key={i} className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  ))}
                </span>
                <span className="flex-1">{option.label}</span>
                {active && (
                  <svg
                    className="h-4 w-4 text-brand-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
